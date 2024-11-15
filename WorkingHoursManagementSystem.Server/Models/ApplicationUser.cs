using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        // optional Photos add later
        public byte[]? Photo { get; set; }

        [Required]
        public string Name { get; set; }
        [Required]
        public string JobPosition { get; set; }

        [Required]
        public EmploymentType EmploymentType { get; set; }
        public string? EmploymentOtherComment { get; set; }

        [Required]
        public bool ActiveStatus { get; set; }
    }

    public enum EmploymentType
    {
        Permanent,
        FixedTerm,
        Student,
        Contracted,
        Freelancer,
        Other
    }

}
