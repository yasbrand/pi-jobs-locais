using System;
using System.ComponentModel.DataAnnotations;

namespace JobLocalAPI.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int JobId { get; set; }

        [Required]
        public int ReviewerId { get; set; } // User who is leaving the review

        [Required]
        public int RevieweeId { get; set; } // User who is being reviewed

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}