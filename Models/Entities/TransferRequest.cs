using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Entities
{
    public class TransferRequest : IEntity
    {
        public int Id { get; set; }
        public int TypeId { get; set; }
        public string Description { get; set; }
        public int UserId { get; set; }
        public int StatuId { get; set; }
        public int? ApprovedCourthousePreferenceId { get; set; }
        public DateTime CreatedAt { get; set; } = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"));

    }
}
