using System;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.Bussines.Interfaces;
using TayinProgrami.Models.Entities;

namespace TayinProgrami.Bussines.Services
{

    public class LoggerService : ILoggerService
    {
        private readonly AppDbContext _dbContext;

        public LoggerService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task LogInfoAsync(LogEntry entry)
        {
            entry.Level = "INFO";
            await LogAsync(entry);
        }

        public async Task LogErrorAsync(LogEntry entry)
        {
            entry.Level = "ERROR";
            await LogAsync(entry);
        }

        private async Task LogAsync(LogEntry entry)
        {
            entry.Date = DateTime.UtcNow;
            _dbContext.LogEntry.Add(entry);
            await _dbContext.SaveChangesAsync();
        }
    }

}
