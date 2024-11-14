using System.ComponentModel.DataAnnotations;

public class WorkingHoursDto
{
    [Required]
    public string UserId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public TimeSpan ArrivalTime { get; set; }

    [Required]
    public TimeSpan DepartureTime { get; set; }

    public TimeSpan? LunchStartTime { get; set; }
    public TimeSpan? LunchEndTime { get; set; }

    public int? AbsenceTypeId { get; set; }
}
