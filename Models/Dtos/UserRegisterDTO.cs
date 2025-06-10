using System.ComponentModel.DataAnnotations;
using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Dtos
{
    public class UserRegisterDTO : IDTO
    {

        [Required] 
        public int RegistratioNumber { get; set; }
        [Required] 
        public string TCNo { get; set; }
        [Required] 
        public string Name { get; set; }
        [Required] 
        public string Surname { get; set; }
        [Required] 
        public string EMail { get; set; }
        [Required] 
        public string Phone { get; set; }
        [Required]
        public int TitleId { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public int ActiveCourthouseId { get; set; }

    }
}
