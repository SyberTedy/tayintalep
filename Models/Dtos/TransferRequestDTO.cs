using System.ComponentModel.DataAnnotations;
using TayinProgrami.Models.Interfaces;
using Microsoft.AspNetCore.Http;

namespace TayinProgrami.Models.Dtos
{
    public class TransferRequestDTO
    {
        [Required]
        public int TypeId { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public int[] PreferenceIds { get; set; }
        public List<IFormFile> Sources { get; set; }
    }

}
