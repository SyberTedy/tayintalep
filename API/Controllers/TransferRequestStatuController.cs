using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinProgrami.Bussines.Services;
using TayinProgrami.DataAccess.Context;

namespace TayinProgrami.WebAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class TransferRequestStatuController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PermissionService _permissionService;

        public TransferRequestStatuController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var status = await _context.TransferRequestStatu.ToListAsync();
            return Ok(status);
        }

    }

}
