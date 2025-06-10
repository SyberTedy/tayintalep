using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Dtos
{
    public class UserDTO : IDTO
    {

        public int Id { get; set; }
        public string TCNo { get; set; }
        public int RegistrationNumber { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string EMail { get; set; }
        public string Phone { get; set; }
        public string Title { get; set; }
        public string ActiveCourthouse { get; set; }
        public List<string> Permissions { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
