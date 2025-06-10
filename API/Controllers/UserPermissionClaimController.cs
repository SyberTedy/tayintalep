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
    public class UserPermissionClaimController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService;

        public UserPermissionClaimController(AppDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var userPermissionClaim = await _context.UserPermissionClaim.ToListAsync();
            return Ok(userPermissionClaim);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(UserPermissionClaim userPermissionClaim)
        {
            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "UserPermissionClaim.Create")) return Unauthorized();

            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.UserPermissionClaim.Add(userPermissionClaim);
            await _context.SaveChangesAsync();
            return Ok("Courthouse created successfully");
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {

            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "UserPermissionClaim.Delete")) return Unauthorized();

            var userPermissionClaim = await _context.UserPermissionClaim.FindAsync(id);
            if (userPermissionClaim == null) return NotFound();

            _context.UserPermissionClaim.Remove(userPermissionClaim);
            await _context.SaveChangesAsync();
            return Ok("Courthouse deleted successfully");
        }
    }
}
