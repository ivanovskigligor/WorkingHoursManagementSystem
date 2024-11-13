using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DbContext;
using Server.Models;

namespace Server.Services
{
    public class DataSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;

        public DataSeeder(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _context = context;
        }

        public async Task SeedRoles()
        {
            var roles = new[] { "Admin", "User" };

            // check if roles exist and create them if not
            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                    await _roleManager.CreateAsync(new IdentityRole(role));
            }

            string email = "admin@admin.com";
            string password = "SecurePassword!23";

            if (await _userManager.FindByEmailAsync(email) == null)
            {
                var adminUser = new ApplicationUser
                {
                    UserName = "Admin",
                    Email = email,
                    PhoneNumber = "000000000",
                    JobPosition = "Admin",
                    EmploymentType = EmploymentType.Other,
                    EmploymentOtherComment = "Admin",
                    ActiveStatus = true,
                    Photo = null,
                    Name = "Admin"
                };
                

                var result = await _userManager.CreateAsync(adminUser, password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, "Admin");

                }
            }
        }

        public async Task SeedAbsenceTypes()
        {
            if (!await _context.AbsenceTypes.AnyAsync())
            {
                var absenceTypes = new List<AbsenceTypes>()
                {
                    new AbsenceTypes { Name = "Leave" },
                    new AbsenceTypes { Name = "Sick Leave" },
                    new AbsenceTypes { Name = "Child Care" },
                    new AbsenceTypes { Name = "Personal Leave" },
                };

                _context.AbsenceTypes.AddRange(absenceTypes);
                await _context.SaveChangesAsync();
            }
        }

    }
}




    
