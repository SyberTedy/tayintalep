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
    public class TransferRequestTypeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPermissionService _permissionService;

        public TransferRequestTypeController(AppDbContext context, IPermissionService permissionService)
        {
            _context = context;
            _permissionService = permissionService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var types = await _context.TransferRequestType.ToListAsync();
            return Ok(types);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(TransferRequestType type)
        {
            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "TransferRequestType.Create")) return Unauthorized();

            if (!ModelState.IsValid) return BadRequest(ModelState);

            _context.TransferRequestType.Add(type);
            await _context.SaveChangesAsync();
            return Ok("Transfer request type created successfully");
        }

    }
}
