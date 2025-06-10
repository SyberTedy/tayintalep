using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.Bussines.Services;
using TayinProgrami.Models.Dtos;
using TayinProgrami.Models.Entities;
using TayinProgrami.Bussines.Interfaces;

namespace TayinProgrami.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransferRequestController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IPermissionService _permissionService;

        public TransferRequestController(AppDbContext context, IPermissionService permissionService, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
            _permissionService = permissionService;
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] TransferRequestDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue("Id"));
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Böyle bir tayin talebi türü mevcut mu diye kontrol ediyorum çünkü normalde sadece UI tarafını düşündüğümüzde bu gereksiz olsa da
                // çapraz platform desteği sağlansa ve bir x platformunu geliştiren şahıs hata yaparsa sorun yaşanabilir 
                var type = _context.TransferRequestType.FirstOrDefault(t => t.Id == dto.TypeId);
                if (type == null) return BadRequest($"Invalid transfer request type");

                var countToday = await _context.TransferRequest
                    .CountAsync(tr => tr.UserId == userId && tr.CreatedAt.Date == GetTurkeyLocalDateTime().Date);

                // Aynı gün içinde en fazla 3 başvuru yapılabilir şeklinde bir sınırlandırma oluşturdum burda kendimce 
                if (countToday >= 3) return Forbid("You have reached your daily limit (3) for transfer requests");

                var transferRequest = new TransferRequest
                {
                    TypeId = type.Id,
                    Description = dto.Description,
                    UserId = userId,
                    StatuId = 1,
                };
                _context.TransferRequest.Add(transferRequest);
                await _context.SaveChangesAsync();

                // tercih listesine eklenen her bir adliye için işlem yapıyorum 
                for (int i = 0; i < dto.PreferenceIds.Length; i++)
                {
                    // tayin türünü denetlediğim yapının bierbir aynısı
                    var courthouse = await _context.Courthouse.FindAsync(dto.PreferenceIds[i]);
                    if (courthouse == null) return BadRequest("Invalid courthouse id in preferences");

                    _context.CourthousePreference.Add(new CourthousePreference
                    {
                        CourthouseId = courthouse.Id,
                        PreferenceOrder = i + 1,
                        TransferRequestId = transferRequest.Id
                    });

                }


                // her bir Asset için işlem yapıyorum
                for (int i = 0; i < dto.Sources.Count; i++)
                {
                    var file = dto.Sources[i];

                    if (file == null || file.Length == 0) return BadRequest("Invalid file");

                    var extension = Path.GetExtension(file.FileName).TrimStart('.').ToLower();

                    if (extension != "jpg" && extension != "jpeg" && extension != "docx" && extension != "png" && extension != "pdf" ) 
                        return BadRequest("Invalid Sources type");

                    var fileName = $"Source-{transferRequest.Id}-{i + 1}.{extension}";
                    var assetPath = Path.Combine(AppContext.BaseDirectory, "Resources", fileName);

                    using (var stream = new FileStream(assetPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    _context.TransferRequestSource.Add(new TransferRequestSource
                    {
                        TransferRequestId = transferRequest.Id,
                        PathName = fileName
                    });
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok("Transfer request created");

            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new { message = "Internal server error", detail = e.Message });
            }
        }


        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> CancelRequest(int id)
        {
            var userId = int.Parse(User.FindFirstValue("Id"));

            var transferRequest = await _context.TransferRequest.FindAsync(id);

            if (transferRequest == null || transferRequest.UserId != userId)
                return Forbid("Transfer request not found or you are not authorized to delete this transfer request");

            // Tayin talebi reddedilmiş, onaylanmış ya da zaten iptal edilmişse Forbid döndürdüm
            if (transferRequest.StatuId!=1) return Forbid("Transfer request status is not 'pending'");

            transferRequest.StatuId = 4;

            await _context.SaveChangesAsync();

            return Ok("Transfer request updated successfully");
        }

        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> GetMine()
        {
            var userId = int.Parse(User.FindFirstValue("Id"));
            var basePath = Path.Combine(AppContext.BaseDirectory, "Resources");

            var requests = _context.TransferRequest
                .Where(r => r.UserId == userId)
                .Select(r => new
                {
                    r.Id,
                    r.TypeId,
                    r.CreatedAt,
                    r.Description,
                    r.StatuId,
                    Preferences = _context.CourthousePreference.Where(cp => cp.TransferRequestId == r.Id).ToList(),
                    Sources = _context.TransferRequestSource
                    .Where(tra => tra.TransferRequestId == r.Id).Select( tra => System.IO.File.ReadAllBytes(Path.Combine(basePath, tra.PathName))).ToList()
                }).ToList();

            return Ok(requests);
        }

        [HttpGet("admin")]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "TransferRequest.GetAllUsers")) return Unauthorized();

            var userId = int.Parse(User.FindFirstValue("Id"));
            var basePath = Path.Combine(AppContext.BaseDirectory, "Resources");

            var requests = _context.TransferRequest
                .Where(  tr => tr.UserId != userId )
                .Select(r => new
                {
                    r.Id,
                    r.TypeId,
                    r.CreatedAt,
                    r.Description,
                    r.UserId,
                    r.StatuId,
                    r.ApprovedCourthousePreferenceId,
                    Preferences = _context.CourthousePreference.Where(p => p.TransferRequestId == r.Id).ToList(),
                    Sources = _context.TransferRequestSource
                    .Where(tra => tra.TransferRequestId == r.Id).Select(tra => System.IO.File.ReadAllBytes(Path.Combine(basePath, tra.PathName))).ToList()
                }).ToList();

            return Ok(requests);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = int.Parse(User.FindFirstValue("Id"));
            var basePath = Path.Combine(_env.ContentRootPath, "Resources");

            var request = _context.TransferRequest.FirstOrDefault(r => r.Id == id);

            // admin olmamasına ramen kendisine ait olmayan bir tayin talebini çekmeye çalışıyorsa ya da direkt böyle bir tayin talebi yoksa
            if (request == null || request.UserId != userId && !await _permissionService.UserHasPermissionsAsync(User, "Admin", "TransferRequest.GetAllUsers"))
                return NotFound("This transfer request either does not exist or you do not have the authorization to review it");

            var response = new
            {
                request.Id,
                request.TypeId,
                request.CreatedAt,
                request.Description,
                request.StatuId,
                Preferences = _context.CourthousePreference.Where(p => p.TransferRequestId == request.Id).ToList(),
                Sources = _context.TransferRequestSource
                    .Where(tra => tra.TransferRequestId == request.Id).Select(tra => System.IO.File.ReadAllBytes(Path.Combine(basePath, tra.PathName))).ToList()
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateApproveStatus(int id, [FromBody] UpdateTransferRequestDTO dto)
        {

            if (!await _permissionService.UserHasPermissionsAsync(User, "Admin", "TransferRequest.UpdateApproveStatus")) return Unauthorized();

            var userId = int.Parse(User.FindFirstValue("Id"));
            var user = await _context.User.FindAsync(userId);
            var transferRequest = await _context.TransferRequest.FindAsync(id);

            if (transferRequest == null) return NotFound("transfer request not found");

            if (transferRequest.UserId == userId) return Forbid("you cant update your own transfer request");

            // Sadece Onaylanması ve reddedilmesi durumlarını açık bıraktım
            if (dto.StatuId != 2 && dto.StatuId != 3 ) return BadRequest("Invalid ApprovedStatus value");

            // Tayin talebi reddedilmiş, onaylanmış ya da iptal edilmişse Forbid döndürdüm
            if (transferRequest.StatuId != 1) return Forbid("Transfer request status is not 'pending'");

            var preference = await _context.CourthousePreference.FirstOrDefaultAsync(p => p.Id == dto.ApprovedCourthousePreferenceId && p.TransferRequestId == id);

            if (preference == null && dto.StatuId == 2) return BadRequest("Invalid ApprovedCourthousePreferenceId for this transfer request");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                transferRequest.StatuId = dto.StatuId;
                transferRequest.ApprovedCourthousePreferenceId = dto.StatuId == 2 ? dto.ApprovedCourthousePreferenceId : null;

                // eğer talebi onaylandıysa ve kullanıcının başka tayin talepleri de varsa onları reddedildi olarak düzenleyecek
                if (dto.StatuId == 2)
                {

                    user.ActiveCourthouseId = _context.CourthousePreference.Find(dto.ApprovedCourthousePreferenceId).CourthouseId;

                    var otherPendingRequests = await _context.TransferRequest
                    .Where(tr => tr.UserId == userId && tr.Id != id && tr.StatuId == 1)
                    .ToListAsync();

                    foreach (var req in otherPendingRequests)
                    {
                        req.StatuId = 3;
                        req.ApprovedCourthousePreferenceId = null;
                    }

                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok("Transfer request updated successfully");
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Internal server error", detail = e.Message });
            }

        }

        private DateTime GetTurkeyLocalDateTime()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"));
        }

    }
}