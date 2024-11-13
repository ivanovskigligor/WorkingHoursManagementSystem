using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Data;

namespace Server.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Mvc.Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUser = await _userManager.FindByNameAsync(model.UserName);
            if (existingUser != null)
            {
                return BadRequest("Username is already taken.");
            }

            // Check if email already exists
            var existingEmail = await _userManager.FindByEmailAsync(model.Email);
            if (existingEmail != null)
            {
                return BadRequest("Email is already registered.");
            }

            var user = new ApplicationUser
            {
                UserName = model.UserName,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                JobPosition = model.JobPosition,
                EmploymentType = model.EmploymentType,
                EmploymentOtherComment = model.EmploymentType == EmploymentType.Other ? model.EmploymentOtherComment : "",
                ActiveStatus = model.ActiveStatus,
                Photo = model.Photo,
                Name = model.Name
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok("User Registered");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, false, false);
            if (result.Succeeded)
            {
                var roles = await _userManager.GetRolesAsync(user);

                var token = GenerateJwtToken(user);
                return Ok(new {
                    token, 
                    userId = user.Id,
                    roles = roles
                });
            }

            return Unauthorized("Invalid username or password.");
        }

        private string GenerateJwtToken(ApplicationUser user)
        {
            var roles = _userManager.GetRolesAsync(user).Result; // Get the user's roles

            var claims = new List<Claim>

            {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id)
        };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role)); // Add the role to claims
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("4f2eb4242346f9de9f035b838b5f3f3e80a42c9d406b73becb246cede2bfdbe6"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "https://localhost:7022",
                audience: "https://localhost:5173",
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
