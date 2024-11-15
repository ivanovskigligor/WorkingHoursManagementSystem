﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Models;

namespace Server.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : Controller
    {

        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("assign-admin")]
        public async Task<IActionResult> AssignAdminRole([FromBody] RoleAssignmentRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);

            if (user == null)
            {
                return NotFound("User was not found");
            }

            if(await _userManager.IsInRoleAsync(user, "Admin"))
            {
                return BadRequest("User is already an admin");
            }

            var result = await _userManager.AddToRoleAsync(user, "Admin");

            if (result.Succeeded)
            {
                return Ok("Admin role assigned successfully");
            }

            return BadRequest("failed to assign admin role");
        }
    }
    public class RoleAssignmentRequest
    {
        public string UserId { get; set; }
    }
}
