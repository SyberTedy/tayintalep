using System.Security.Claims;


namespace TayinProgrami.Bussines.Interfaces 
{ 

    public interface IPermissionService
    {
        Task<bool> UserHasPermissionsAsync(ClaimsPrincipal user, params string[] requiredPermissions);
    }
}