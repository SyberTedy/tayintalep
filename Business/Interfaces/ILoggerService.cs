using TayinProgrami.Models.Entities;

namespace TayinProgrami.Bussines.Interfaces
{
    public interface ILoggerService
    {
        Task LogInfoAsync(LogEntry entry);
        Task LogErrorAsync(LogEntry entry);
    }

}