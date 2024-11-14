using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class WorkingHours
    {
        [Key]
        public int Id { get; set; }

        // foreign key to users
        [Required]
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public ApplicationUser? User { get; set; }   

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public TimeSpan ArrivalTime { get; set; }

        [Required]
        public TimeSpan DepartureTime { get; set; }

        public TimeSpan? LunchStartTime { get; set; }
        public TimeSpan? LunchEndTime { get; set; }


        // foreign key to absecetypes
        public int? AbsenceTypeId { get; set; }
        [ForeignKey("AbsenceTypeId")]
        public AbsenceTypes? AbsenceTypes { get; set; }
    }
}
