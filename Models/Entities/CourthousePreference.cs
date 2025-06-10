using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Entities
{
    public class CourthousePreference : IEntity
    {

        public int Id { get; set; }
        public int CourthouseId { get; set; }
        public int TransferRequestId { get; set; }
        public int PreferenceOrder { get; set; }

    }
}
