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
                    .Where(x => x.UserId == userId && x.Date.Date == parsedDate.Date)  // Filter by both userId and date
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

            // Ensure the user exists
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                return BadRequest("User not found.");
            }

            
            AbsenceTypes? absenceType = null;
            if (model.AbsenceTypeId.HasValue)
            {
                absenceType = await _context.AbsenceTypes.FindAsync(model.AbsenceTypeId);
                if (absenceType == null)
                {
                    return BadRequest("Invalid AbsenceTypeId.");
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

            // Filter the working hours to include only the days worked so far (before today's date)
            var today = DateTime.Now.Date; // Get today's date (ignore the time)
            var workedDays = workingHours.Where(x => x.Date <= today).ToList();

            // Calculate total working hours for the days worked so far
            double totalMonthlyHours = workedDays.Sum(x => x.TotalWorkingHours);

            // Calculate daily average working hours (only for the days worked so far)
            int workingDays = workedDays.Count(x => x.Status != "Weekend");
            double dailyAverageHours = workingDays > 0 ? totalMonthlyHours / workingDays : 0;

            // Return both working hours and the calculated totals
            var result = new
            {
                WorkingHours = workedDays,
                TotalMonthlyHours = totalMonthlyHours,
                DailyAverageHours = dailyAverageHours
            };

            return Ok(result);

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
                return (DepartureTime.Value - ArrivalTime.Value).TotalMinutes;
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
