using System;
using System.ComponentModel.DataAnnotations;

namespace JobLocalAPI.Models
{
    public class Job
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public string Category { get; set; }

        [Required]
        public int EmployerId { get; set; }

        public int WorkerId { get; set; } // Null until assigned

        [Required]
        public string Status { get; set; } // "posted", "assigned", "completed", "cancelled"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
