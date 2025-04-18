namespace RCTableEditor.Server.DTOs
{
    public class ChangeDTO
    {
        public string ChangeType { get; set; } = string.Empty; // "Add", "Edit", "Remove"
        public int? SessionDataId { get; set; }
        public TableDataDTO? OriginalData { get; set; }
        public TableDataDTO? NewData { get; set; }
        public List<string>? ModifiedFields { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class DraftChangeDTO
    {
        public string BatchId { get; set; } = string.Empty;
        public List<ChangeDTO> Changes { get; set; } = new List<ChangeDTO>();
    }

    public class SubmitChangesDTO
    {
        public string BatchId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class ChangeHistoryDTO
    {
        public string ChangeId { get; set; } = string.Empty;
        public string BatchId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Username { get; set; } = string.Empty;
        public string ChangeType { get; set; } = string.Empty;
        public string Process { get; set; } = string.Empty;
        public string SharePointUrl { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty;
        public DateTime? ApprovalDate { get; set; }
        public string? ApprovedBy { get; set; }
    }
}
