using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TayinProgrami.Bussines.Interfaces;
using TayinProgrami.DataAccess.Context;
using TayinProgrami.Models.Entities;

namespace TayinProgrami.Bussines.Services
{

    public class PermissionService : IPermissionService
    {
        private readonly AppDbContext _context;

        public PermissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> UserHasPermissionsAsync(ClaimsPrincipal userPrincipal, params string[] requiredPermissions)
        {
            var userId = int.Parse(userPrincipal.FindFirst("Id").Value);
            var user = await _context.User.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return false;

            var userPermissionClaims = await _context.UserPermissionClaim
                .Where(upc => upc.UserId == user.Id)
                .ToListAsync();

            var userPermissions = userPermissionClaims
                .Select(upc => getNameOfPermissionOrNull(upc.Id))
                .ToList();

            return requiredPermissions.Any(rp => userPermissions.Contains(rp));
        }

        private string getNameOfPermissionOrNull(int permissionId)
        {
            var permission = _context.Permission.FirstOrDefault(p => p.Id == permissionId);
            var selected = permission != null ? permission.Name : "NULL";
            return selected;
        }


    }

}