using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Entities
{
    public class User : IEntity
    {

        public int Id { get; set; }
        public string TCNo { get; set; }
        public int RegistratioNumber { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string EMail { get; set; }
        public string Phone { get; set; }
        public int TitleId { get; set; }
        public string PasswordHash { get; set; }
        public int ActiveCourthouseId { get; set; }
        public DateTime CreatedAt { get; set; } = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"));

    }
}
