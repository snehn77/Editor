using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RCTableEditor.Server.Models
{
    public class ChangeDetail
    {
        [Key]
        public int ChangeDetailId { get; set; }
        
        public string ChangeId { get; set; } = string.Empty;
        
        public string ChangeType { get; set; } = string.Empty; // "Add", "Edit", "Remove"
        
        public int? SessionDataId { get; set; }
        
        public string Process { get; set; } = string.Empty;
        
        public string Layer { get; set; } = string.Empty;
        
        public string DefectType { get; set; } = string.Empty;
        
        public string OperationList { get; set; } = string.Empty;
        
        public string? FieldName { get; set; } // For Edit changes, which field changed
        
        public string? OldValue { get; set; } // JSON or string of old value
        
        public string? NewValue { get; set; } // JSON or string of new value
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("ChangeId")]
        public virtual ChangeHistory? ChangeHistory { get; set; }
    }
}
