using System.ComponentModel.DataAnnotations;
using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Entities
{
    public class UserPermissionClaim : IEntity
    {
        public int Id { get; set; }
        [Required]
        public int PermissionId { get; set; }
        [Required]
        public int UserId { get; set; }
    }
}
