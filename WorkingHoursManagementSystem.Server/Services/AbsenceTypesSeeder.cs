using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.DbContext;
using Server.Models;

namespace Server.Services
{
    public class AbsenceTypesSeeder : Controller
    {

        private readonly AppDbContext _context;

        public AbsenceTypesSeeder(AppDbContext context)
        {
            _context = context;
        }


    }
}
