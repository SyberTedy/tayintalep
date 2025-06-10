using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.Bussines.Services;
using TayinProgrami.Models.Entities;
using TayinProgrami.Bussines.Interfaces;

namespace TayinProgrami.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TitleController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService;

        public TitleController(AppDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        [HttpGet]
        //[Authorize]
        public async Task<IActionResult> GetAll()
        {
            var courthouses = await _context.Title.ToListAsync();
            return Ok(courthouses);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(Title title)
        {
            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "Title.Create")) return Unauthorized();

            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.Title.Add(title);
            await _context.SaveChangesAsync();
            return Ok("Title created successfully");
        }
    }
}
