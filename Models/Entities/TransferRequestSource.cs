using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Entities
{
    public class TransferRequestSource : IEntity
    {

        public int Id { get; set; }
        public string PathName { get; set; }
        public int TransferRequestId { get; set; }

    }
}
