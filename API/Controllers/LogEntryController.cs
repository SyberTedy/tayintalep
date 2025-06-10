using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.Bussines.Services;
using Microsoft.EntityFrameworkCore;
using TayinProgrami.Models.Entities;
using TayinProgrami.Bussines.Interfaces;

namespace TayinProgrami.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogEntryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService;

        public LogEntryController(AppDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {

            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "LogEntry.GetAll")) return Unauthorized();

            var users = await _context.LogEntry
                .Select(u => new LogEntry
                {
                    Id = u.Id,
                    ActionName =u.ActionName,
                    ControllerName = u.ControllerName,
                    RegistratioNumber = u.RegistratioNumber,
                    Message = u.Message,
                    Exception = u.Exception,
                    Level = u.Level,
                    Date = u.Date,
                    IpAddress = u.IpAddress,
                })
                .ToListAsync();

            return Ok(users);
        }

    }
}
