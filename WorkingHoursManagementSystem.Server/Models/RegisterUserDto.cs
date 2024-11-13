using System.ComponentModel.DataAnnotations;

namespace Server.Models
{
    public class RegisterUserDto
    {
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
        [Required]
        public string UserName { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
