using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Models;
using System.Security.Claims;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User not found");
            return Ok(user);
        }


        [Authorize]
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Get the current logged-in user
            var currentUser = await _userManager.GetUserAsync(User);
            return Ok(currentUser.Id);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updatedUser)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByIdAsync(id);
            if(user == null)
            {
                return NotFound("User not found");
            }

            user.Email = updatedUser.Email;
            user.PhoneNumber = updatedUser.PhoneNumber;
            user.JobPosition = updatedUser.JobPosition;
            user.EmploymentType = updatedUser.EmploymentType;
            user.EmploymentOtherComment = updatedUser.EmploymentOtherComment;
            user.ActiveStatus = updatedUser.ActiveStatus;
            user.Name = updatedUser.Name;

            var result = await _userManager.UpdateAsync(user);
            if(!result.Succeeded) {
                return BadRequest(result.Errors);
            }

            return Ok("User data changed");
        }
    }

    public class UpdateUserDto
    {
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string JobPosition { get; set; }
        public EmploymentType EmploymentType { get; set; }
        public string EmploymentOtherComment { get; set; }
        public bool ActiveStatus { get; set; }
        public string Name { get; set; }
    }
}
