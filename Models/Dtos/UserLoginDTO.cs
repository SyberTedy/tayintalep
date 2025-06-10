using System.ComponentModel.DataAnnotations;
using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Dtos
{
    public class UserLoginDTO : IDTO
    {
        [Required]
        public int RegistratioNumber { get; set; }
        [Required]
        public string Password { get; set; }

    }
}
