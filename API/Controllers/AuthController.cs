using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinProgrami.Bussines.Services;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.Models.Dtos;

namespace TayinProgrami.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO loginDto)
        {

            var user = await _context.User.FirstOrDefaultAsync(p => p.RegistratioNumber == loginDto.RegistratioNumber);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Sicil Numarası veya Şifre hatalı" });

            var token = _tokenService.GenerateToken(user.RegistratioNumber.ToString(), user.Id.ToString());

            return Ok(new
            {
                token,
                user = new UserDTO
                {
                    Id = user.Id,
                    RegistrationNumber = user.RegistratioNumber,
                    Name = user.Name,
                    Surname = user.Surname,
                    Title = _context.Title.FirstOrDefault(t => t.Id == user.TitleId).Name,
                    EMail = user.EMail,
                    Phone = user.Phone,
                    TCNo = user.TCNo,
                    ActiveCourthouse = _context.Courthouse.FirstOrDefault(c => c.Id == user.ActiveCourthouseId).Name,
                    Permissions = _context.UserPermissionClaim.Where(upc => upc.UserId == user.Id)
                    .Select(upc => _context.Permission.First(p => p.Id == upc.PermissionId).Name).ToList()
                }

        });
        }
    }
}