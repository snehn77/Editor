namespace RCTableEditor.Server.DTOs
{
    public class TableDataDTO
    {
        public int SessionDataId { get; set; }
        public string BatchId { get; set; } = string.Empty;
        public string Process { get; set; } = string.Empty;
        public string Layer { get; set; } = string.Empty;
        public string DefectType { get; set; } = string.Empty;
        public string OperationList { get; set; } = string.Empty;
        public string? ClassType { get; set; }
        public string? Product { get; set; }
        public int? EntityConfidence { get; set; }
        public string? Comments { get; set; }
        public string? GenericData1 { get; set; }
        public string? GenericData2 { get; set; }
        public string? GenericData3 { get; set; }
        public string? EdiAttribution { get; set; }
        public string? EdiAttributionList { get; set; }
        public int? SecurityCode { get; set; }
        public int? OriginalId { get; set; }
        public DateTime LastModified { get; set; }
        public string LastModifiedBy { get; set; } = string.Empty;
    }

    public class TableDataQueryDTO
    {
        public string Process { get; set; } = string.Empty;
        public string Layer { get; set; } = string.Empty;
        public string? Operation { get; set; }
    }

    public class TableDataImportDTO
    {
        public string BatchId { get; set; } = string.Empty;
        public string? FileName { get; set; }
        public string Username { get; set; } = string.Empty;
        public List<TableDataDTO> Data { get; set; } = new List<TableDataDTO>();
    }
}
