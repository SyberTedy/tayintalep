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
    public class CourthouseController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService;

        public CourthouseController(AppDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var courthouses = await _context.Courthouse.ToListAsync();
            return Ok(courthouses);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(Courthouse courthouse)
        {
            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "Courthouse.Create")) return Unauthorized();

            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.Courthouse.Add(courthouse);
            await _context.SaveChangesAsync();
            return Ok("Courthouse created successfully");
        }

    }
}
