using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Entities
{
    public class LogEntry : IEntity
    {
        public int Id { get; set; }
        public string Level { get; set; }

        public string Message { get; set; }

        public string? Exception { get; set; }

        public string RegistratioNumber { get; set; }

        public string ControllerName { get; set; }

        public string ActionName { get; set; }
        public string IpAddress { get; set; }
        public DateTime Date { get; set; } = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"));

    }

}
