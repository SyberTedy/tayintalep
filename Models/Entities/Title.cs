﻿using System.ComponentModel.DataAnnotations;
using TayinProgrami.Models.Interfaces;

namespace TayinProgrami.Models.Entities
{
    public class Title : IEntity
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
    }
}
