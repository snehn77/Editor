using System.ComponentModel.DataAnnotations;

namespace RCTableEditor.Server.Models
{
    public class ChangeHistory
    {
        [Key]
        public string ChangeId { get; set; } = Guid.NewGuid().ToString();
        
        public string BatchId { get; set; } = string.Empty;
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public string Username { get; set; } = string.Empty;
        
        public string ChangeType { get; set; } = string.Empty; // "Add", "Edit", "Remove" or combination
        
        public string Process { get; set; } = string.Empty;
        
        public string? ExcelFilePath { get; set; }
        
        public string? SharePointUrl { get; set; }
        
        public string ApprovalStatus { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"
        
        public DateTime? ApprovalDate { get; set; }
        
        public string? ApprovedBy { get; set; }
        
        public string? Notes { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
