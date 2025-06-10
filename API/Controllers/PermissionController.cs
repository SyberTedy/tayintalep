using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinProgrami.Bussines.Interfaces;
using TayinProgrami.Bussines.Services;
using TayinProgrami.DataAccess.Context;

namespace TayinProgrami.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService;

        public PermissionController(AppDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var permission = await _context.Permission.ToListAsync();
            return Ok(permission);
        }

        [HttpPost("permcheck")]
        public async Task<IActionResult> CheckPermission(List<string> permissionNames)
        {
            var response = await _permissionService.UserHasPermissionsAsync(User, permissionNames.ToArray());
            return Ok(response);
        }
    }
}
