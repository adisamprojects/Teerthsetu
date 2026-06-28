using System;
using System.ComponentModel.DataAnnotations;

namespace TempleManagementApi.Models
{
    public class Devotee
    {
        [Key]
        public int DevoteeID { get; set; }

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? GoogleAccountID { get; set; }

        public bool IsVerified { get; set; } = false;

        public string? RefreshToken { get; set; }

        public string? OtpCode { get; set; }
        
        public DateTime? OtpExpiration { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    }
}
