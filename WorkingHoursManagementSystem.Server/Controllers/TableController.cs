using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace WorkingHoursManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TableController : ControllerBase
    { 

        private readonly UserManager<ApplicationUser> _userManager;

        public TableController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetTableData()
        {
            var data = await _userManager.Users.ToListAsync();

            if (data == null)
            {
                return NotFound("No data found.");
            }

            return Ok(data);
        }
    }
}
