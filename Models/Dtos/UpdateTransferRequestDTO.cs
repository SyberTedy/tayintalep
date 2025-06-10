using System.ComponentModel.DataAnnotations;
using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Dtos
{
    public class UpdateTransferRequestDTO : IDTO
    {
        [Required]
        public int StatuId { get; set; }
        public int ApprovedCourthousePreferenceId { get; set; }
    }

}
