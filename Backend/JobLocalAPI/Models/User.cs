using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JobLocalAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [Required]
        public string UserType { get; set; } // "worker" or "employer"

        public string Skills { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public decimal Rating { get; set; } = 0;
        public int RatingCount { get; set; } = 0;
        public string ProfileImage { get; set; }
        public string DocumentImage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Job> JobsPosted { get; set; }
        public ICollection<Job> JobsAccepted { get; set; }
        public ICollection<Review> ReviewsReceived { get; set; }
        public ICollection<Message> MessagesSent { get; set; }
        public ICollection<Message> MessagesReceived { get; set; }
    }
}