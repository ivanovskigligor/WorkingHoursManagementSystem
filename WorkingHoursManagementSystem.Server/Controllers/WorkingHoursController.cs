using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DbContext;
using Server.Models;
using System.Globalization;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkingHoursController : Controller
    {

        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        public WorkingHoursController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetWorkingHours(string userId, [FromQuery] string date)
        {
            if (DateTime.TryParse(date, out var parsedDate))
            {
                var workingHours = _context.WorkingHours
                    .Where(x => x.UserId == userId && x.Date.Date == parsedDate.Date)
                    .Include(x => x.AbsenceTypes)
                    .Select(x => new
                    {
                        x.Id,
                        x.Date,
                        x.ArrivalTime,
                        x.DepartureTime,
                        x.LunchStartTime,
                        x.LunchEndTime,
                        AbsenceTypeName = x.AbsenceTypes != null ? x.AbsenceTypes.Name : null,

                    })
                    .ToList();

                return Ok(workingHours);
            }
            else
            {
                return BadRequest("Invalid date format");
            }
        }


        [HttpGet("absence-types")]
        public IActionResult GetAbsenceTypes()
        {
            var absenceTypes = _context.AbsenceTypes
                .Select(a => new { a.Id, a.Name,})
                .ToList();
            return Ok(absenceTypes);
        }

        [HttpPut]
        public async Task<IActionResult> PostWorkingHours([FromBody] WorkingHoursDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                return BadRequest("user not found.");
            }

            
            AbsenceTypes? absenceType = null;
            if (model.AbsenceTypeId.HasValue)
            {
                absenceType = await _context.AbsenceTypes.FindAsync(model.AbsenceTypeId);
                if (absenceType == null)
                {
                    return BadRequest("invalid AbsenceTypeId.");
                }
            }

            // check if user has entry for that date
            var existingEntry = await _context.WorkingHours
                .FirstOrDefaultAsync(w=> w.UserId == model.UserId && w.Date == model.Date);

            if (existingEntry != null)
            {
                existingEntry.UserId = model.UserId;
                existingEntry.Date = model.Date;
                existingEntry.ArrivalTime = model.ArrivalTime;
                existingEntry.DepartureTime = model.DepartureTime;
                existingEntry.LunchStartTime = model.LunchStartTime;
                existingEntry.LunchEndTime = model.LunchEndTime;
                existingEntry.AbsenceTypeId = model.AbsenceTypeId;

                _context.WorkingHours.Update(existingEntry);
            }
            else
            {
                var workingHours = new WorkingHours
                {
                    UserId = model.UserId,
                    Date = model.Date,
                    ArrivalTime = model.ArrivalTime,
                    DepartureTime = model.DepartureTime,
                    LunchStartTime = model.LunchStartTime,
                    LunchEndTime = model.LunchEndTime,
                    AbsenceTypeId = model.AbsenceTypeId
                };
                _context.WorkingHours.Add(workingHours);
            }

            await _context.SaveChangesAsync();

            return Ok(existingEntry != null ? "Working hours updated successfully." : "Working hours logged successfully.");

        }

        [HttpGet("user/{userId}/month")]
        public async Task<IActionResult> GetMonthlyWorkingHours(string userId, [FromQuery] int year, [FromQuery] int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var workingHours = await _context.WorkingHours
                .Where(x => x.UserId == userId && x.Date >= startDate && x.Date <= endDate)
                .Include(x => x.AbsenceTypes)
                .Select(x => new
                {
                    x.Id,
                    x.Date,
                    Day = x.Date.ToString("dddd", CultureInfo.InvariantCulture),
                    Status = x.Date.DayOfWeek == DayOfWeek.Saturday || x.Date.DayOfWeek == DayOfWeek.Sunday ? "Weekend" : "Weekday",
                    x.ArrivalTime,
                    x.DepartureTime,
                    x.LunchStartTime,
                    x.LunchEndTime,
                    LunchDuration = CalculateTotalLaunchDuration(x.LunchStartTime, x.LunchEndTime),
                    LunchOvertime = CalculateLaunchOvertime(x.LunchStartTime, x.LunchEndTime),
                    TotalWorkingHours = CalculateTotalWorkDuration(x.ArrivalTime, x.DepartureTime),
                    AbsenceTypeName = x.AbsenceTypes != null ? x.AbsenceTypes.Name : null

                }) 
                .OrderBy(x => x.Date)
                .ToListAsync();

            var today = DateTime.Now.Date; 
            var workedDays = workingHours.Where(x => x.Date <= today).ToList();

            double totalMonthlyHours = workedDays.Sum(x => x.TotalWorkingHours);

            int workingDays = workedDays.Count(x => x.Status != "Weekend");
            double dailyAverageHours = workingDays > 0 ? totalMonthlyHours / workingDays : 0;

            var totalMonthlyTime = TimeSpan.FromHours(totalMonthlyHours);
            var dailyAverageTime = TimeSpan.FromHours(dailyAverageHours);

            string totalMonthlyTimeFormatted = $"{(int)totalMonthlyTime.TotalHours:D2}:{totalMonthlyTime.Minutes:D2}";
            string dailyAverageTimeFormatted = $"{(int)dailyAverageTime.TotalHours:D2}:{dailyAverageTime.Minutes:D2}";

            var result = new
            {
                WorkingHours = workedDays,
                TotalMonthlyHours = totalMonthlyTimeFormatted,
                DailyAverageHours = dailyAverageTimeFormatted
            };

            return Ok(result);

        }

        [HttpGet("user/{userId}/month/export")]
        public async Task<IActionResult> ExportMonthlyWorkingHoursToExcel(string userId, [FromQuery] int year, [FromQuery] int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var workingHoursData = await _context.WorkingHours
                .Where(x => x.UserId == userId && x.Date >= startDate && x.Date <= endDate)
                .Include(x => x.AbsenceTypes)
                .ToListAsync();

            var fullMonthData = Enumerable.Range(1, DateTime.DaysInMonth(year, month))
                .Select(day =>
                {
                    var date = new DateTime(year, month, day);
                    var entry = workingHoursData.FirstOrDefault(x => x.Date == date);

                    
                    return new
                    {
                        Date = date,
                        Day = date.ToString("dddd", CultureInfo.InvariantCulture),
                        Status = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday ? "Weekend" : "Weekday",
                        ArrivalTime = entry?.ArrivalTime,
                        DepartureTime = entry?.DepartureTime,
                        LunchStartTime = entry?.LunchStartTime,
                        LunchEndTime = entry?.LunchEndTime,
                        LunchDuration = CalculateTotalLaunchDuration(entry?.LunchStartTime, entry?.LunchEndTime),
                        LunchOvertime = CalculateLaunchOvertime(entry?.LunchStartTime, entry?.LunchEndTime),
                        TotalWorkingHours = CalculateTotalWorkDuration(entry?.ArrivalTime, entry?.DepartureTime),
                        AbsenceTypeName = entry?.AbsenceTypes?.Name
                    };
                })
                .OrderBy(x => x.Date)
                .ToList();

            var today = DateTime.Now.Date; 
            var workedDays = fullMonthData.Where(x => x.Date <= today).ToList();

            double totalMonthlyHours = workedDays.Sum(x => x.TotalWorkingHours);

            int workingDays = workedDays.Count(x => x.Status != "Weekend");

            double dailyAverageHours = workingDays > 0 ? totalMonthlyHours / workingDays : 0;

            TimeSpan totalMonthlyTime = TimeSpan.FromHours(totalMonthlyHours);
            TimeSpan dailyAverageTime = TimeSpan.FromHours(dailyAverageHours);

            string totalMonthlyTimeFormatted = $"{(int)totalMonthlyTime.TotalHours:D2}:{totalMonthlyTime.Minutes:D2}";
            string dailyAverageTimeFormatted = $"{(int)dailyAverageTime.TotalHours:D2}:{dailyAverageTime.Minutes:D2}";

            // create excel file
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Working Hours");

                worksheet.Cell(1, 1).Value = "No.";
                worksheet.Cell(1, 2).Value = "Date";
                worksheet.Cell(1, 3).Value = "Day";
                worksheet.Cell(1, 4).Value = "Status";
                worksheet.Cell(1, 5).Value = "ArrivalTime";
                worksheet.Cell(1, 6).Value = "DepartureTime";
                worksheet.Cell(1, 7).Value = "LunchStartTime";
                worksheet.Cell(1, 8).Value = "LunchEndTime";
                worksheet.Cell(1, 9).Value = "LunchDuration";
                worksheet.Cell(1, 10).Value = "LunchOvertime";
                worksheet.Cell(1, 11).Value = "TotalWorkingHours";
                worksheet.Cell(1, 12).Value = "AbsenceTypeName";

                int row = 2;
                foreach (var entry in fullMonthData)
                {
                    worksheet.Cell(row, 1).Value = row - 1;
                    worksheet.Cell(row, 2).Value = entry.Date.ToString("yyyy-MM-dd");
                    worksheet.Cell(row, 3).Value = entry.Day;
                    worksheet.Cell(row, 4).Value = entry.Status;
                    worksheet.Cell(row, 5).Value = entry.ArrivalTime?.ToString(@"hh\:mm") ?? "";
                    worksheet.Cell(row, 6).Value = entry.DepartureTime?.ToString(@"hh\:mm") ?? "";
                    worksheet.Cell(row, 7).Value = entry.LunchStartTime?.ToString(@"hh\:mm") ?? "";
                    worksheet.Cell(row, 8).Value = entry.LunchEndTime?.ToString(@"hh\:mm") ?? "";
                    worksheet.Cell(row, 9).Value = entry.LunchDuration != TimeSpan.Zero ? entry.LunchDuration.ToString(@"hh\:mm") : ""; 
                    worksheet.Cell(row, 10).Value = entry.LunchOvertime > 0 ? $"{entry.LunchOvertime} min" : "";
                    worksheet.Cell(row, 11).Value = entry.TotalWorkingHours > 0 ? $"{entry.TotalWorkingHours:0.00} hrs" : "";
                    worksheet.Cell(row, 12).Value = entry.AbsenceTypeName ?? "";
                    row++;
                }
                worksheet.Cell(row + 1, 1).Value = "Summary";
                worksheet.Cell(row + 1, 2).Value = "Total Monthly Hours:";
                worksheet.Cell(row + 1, 3).Value = totalMonthlyTimeFormatted;

                worksheet.Cell(row + 2, 2).Value = "Average Daily Hours:";
                worksheet.Cell(row + 2, 3).Value = dailyAverageTimeFormatted;

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    stream.Seek(0, SeekOrigin.Begin);

                    // add name of user in file title later
                    var fileName = $"WorkingHours_{year}_{month}.xlsx";
                    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                }
            }
        }


        private static TimeSpan CalculateTotalLaunchDuration(TimeSpan? launchStartTime, TimeSpan? launchEndTime)
        {
            if(launchStartTime.HasValue && launchEndTime.HasValue)
            {
                return (launchEndTime.Value - launchStartTime.Value);
            }
            return TimeSpan.Zero;
        }

        private static double CalculateTotalWorkDuration(TimeSpan? ArrivalTime, TimeSpan? DepartureTime)
        {
            if (ArrivalTime.HasValue && DepartureTime.HasValue)
            {
                return (DepartureTime.Value - ArrivalTime.Value).TotalHours;
            }
            return 0;
        }

        private static int CalculateLaunchOvertime(TimeSpan? launchStartTime, TimeSpan? launchEndTime)
        {
            var launchDuration = CalculateTotalLaunchDuration(launchStartTime, launchEndTime);
            var allowedLaunchTime = TimeSpan.FromMinutes(30);
            return launchDuration > allowedLaunchTime ? (int) (launchDuration - allowedLaunchTime).TotalMinutes : 0;
        }

    }
}
