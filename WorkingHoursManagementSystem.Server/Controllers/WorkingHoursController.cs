using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DbContext;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkingHoursController : Controller
    {

        private readonly AppDbContext _context;
        
        public WorkingHoursController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetWorkingHours(string userId)
        {
            var workingHours =_context.WorkingHours
                .Where(x => x.UserId == userId)
                .Include(x => x.AbsenceTypes)
                .Select(x=> new
                {
                    x.Id,
                    x.Date,
                    x.ArrivalTime,
                    x.DepartureTime,
                    x.LunchStartTime,
                    x.LunchEndTime,
                    AbsenceTypeName = x.AbsenceTypes != null ? x.AbsenceTypes.Name : null,

                    TotalDuration = CalculateTotalDuration(x.ArrivalTime, x.DepartureTime, x.LunchStartTime, x.LunchEndTime)
                })
                .ToList();  

            return Ok(workingHours);
        }

        [HttpGet("absence-types")]
        public IActionResult GetAbsenceTypes()
        {
            var absenceTypes = _context.AbsenceTypes
                .Select(a => new { a.Id, a.Name,})
                .ToList();
            return Ok(absenceTypes);
        }

        [HttpPost]
        public IActionResult PostWorkingHours([FromBody] WorkingHours workingHours)
        {
            if (workingHours == null)
            {
                return BadRequest("Invalid data.");
            }

            if (string.IsNullOrEmpty(workingHours.UserId))
            {
                return BadRequest("UserId is required.");
            }


            if (!workingHours.AbsenceTypeId.HasValue)
            {
                
                return BadRequest("AbsenceTypeId is required.");
            }


            Console.WriteLine($"UserId: {workingHours.UserId}");
            Console.WriteLine($"AbsenceTypeId: {workingHours.AbsenceTypeId}");

            _context.WorkingHours.Add(workingHours);
            _context.SaveChanges();
               
            return CreatedAtAction(nameof(GetWorkingHours), new { userId = workingHours.UserId }, workingHours);
        }

        private static TimeSpan CalculateTotalDuration(TimeSpan arrivalTime, TimeSpan departureTime, TimeSpan? launchStartTime, TimeSpan? launchEndTime)
        {
            TimeSpan workDuration = departureTime - arrivalTime;

            if(launchStartTime.HasValue && launchEndTime.HasValue)
            {
                workDuration -= (launchEndTime.Value - launchStartTime.Value);
            }

            return workDuration;
        }
    }
}
