using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.Bussines.Services;
using TayinProgrami.Models.Dtos;
using TayinProgrami.Models.Entities;
using TayinProgrami.Bussines.Interfaces;
using System.Linq;

namespace TayinProgrami.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService;

        public UserController(AppDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "User.GetAll")) return Unauthorized();

            var users = await _context.User
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    TCNo = u.TCNo,
                    RegistrationNumber = u.RegistratioNumber,
                    Name = u.Name,
                    Surname = u.Surname,
                    Title = _context.Title.FirstOrDefault(t => t.Id == u.TitleId).Name,
                    Phone = u.Phone,
                    EMail = u.EMail,
                    ActiveCourthouse = _context.Courthouse.FirstOrDefault(c => c.Id == u.ActiveCourthouseId).Name,
                    Permissions = _context.UserPermissionClaim.Where(upc => upc.UserId == u.Id)
                    .Select(upc => _context.Permission.First(p => p.Id == upc.PermissionId).Name).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> Get()
        {
            var registratioNumber = int.Parse(User.FindFirstValue(ClaimTypes.Name));

            var user = await _context.User
                .Where(u => u.RegistratioNumber == registratioNumber)
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    TCNo = u.TCNo,
                    RegistrationNumber = u.RegistratioNumber,
                    Name = u.Name,
                    Surname = u.Surname,
                    Title = _context.Title.FirstOrDefault( t => t.Id == u.TitleId ).Name,
                    Phone = u.Phone,
                    EMail = u.EMail,
                    ActiveCourthouse = _context.Courthouse.FirstOrDefault(c => c.Id == u.ActiveCourthouseId).Name,
                    Permissions = _context.UserPermissionClaim.Where(upc => upc.UserId == u.Id)
                    .Select( upc => _context.Permission.First(p => p.Id == upc.PermissionId).Name ).ToList()
                })
                .FirstOrDefaultAsync();

            return Ok(user);
        }

        [HttpPost("register")]
        [Authorize]
        public async Task<IActionResult> Register(UserRegisterDTO dto)
        {
            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "User.Register")) return Unauthorized();

            var exists = await _context.User.AnyAsync(u => u.RegistratioNumber == dto.RegistratioNumber);
            if ( exists ) return BadRequest("This registration number is already registered");

            // güvenilik amacıyla hashleyerek veri tabanında tutuyorum personelin şifresiniz
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                TCNo = dto.TCNo,
                RegistratioNumber = dto.RegistratioNumber,
                Name = dto.Name,
                Surname = dto.Surname,
                TitleId = dto.TitleId,
                PasswordHash = passwordHash,
                EMail = dto.EMail,
                Phone = dto.Phone,
                ActiveCourthouseId = dto.ActiveCourthouseId,
            };

            _context.User.Add(user);

            await _context.SaveChangesAsync();

            return Ok("New user registered successfully");
        }
    }
}
