using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RCTableEditor.Server.Data;
using RCTableEditor.Server.DTOs;
using RCTableEditor.Server.Models;
using RCTableEditor.Server.Services;
using System.Text.Json;

namespace RCTableEditor.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TableDataController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DraftStorageService _draftStorageService;
        private readonly ExcelService _excelService;
        private readonly ILogger<TableDataController> _logger;

        public TableDataController(
            AppDbContext context, 
            DraftStorageService draftStorageService, 
            ExcelService excelService,
            ILogger<TableDataController> logger)
        {
            _context = context;
            _draftStorageService = draftStorageService;
            _excelService = excelService;
            _logger = logger;
        }

        [HttpGet("{batchId}")]
        public async Task<IActionResult> GetTableData(string batchId)
        {
            try
            {
                // Get session data for the batch
                var sessionData = await _context.SessionData
                    .Where(s => s.BatchId == batchId && s.IsActive)
                    .OrderBy(s => s.SessionDataId)
                    .ToListAsync();

                // Map to DTOs
                var tableDataDTOs = sessionData.Select(s => new TableDataDTO
                {
                    SessionDataId = s.SessionDataId,
                    BatchId = s.BatchId,
                    Process = s.Process,
                    Layer = s.Layer,
                    DefectType = s.DefectType,
                    OperationList = s.OperationList,
                    ClassType = s.ClassType,
                    Product = s.Product,
                    EntityConfidence = s.EntityConfidence,
                    Comments = s.Comments,
                    GenericData1 = s.GenericData1,
                    GenericData2 = s.GenericData2,
                    GenericData3 = s.GenericData3,
                    EdiAttribution = s.EdiAttribution,
                    EdiAttributionList = s.EdiAttributionList,
                    SecurityCode = s.SecurityCode,
                    OriginalId = s.OriginalId,
                    LastModified = s.LastModified,
                    LastModifiedBy = s.LastModifiedBy
                }).ToList();

                return Ok(tableDataDTOs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving table data for batch {BatchId}", batchId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("query")]
        public async Task<IActionResult> QueryTableData([FromBody] TableDataQueryDTO query)
        {
            try
            {
                if (string.IsNullOrEmpty(query.Process) || string.IsNullOrEmpty(query.Layer))
                {
                    return BadRequest("Process and Layer are required");
                }

                // Generate a new batch ID
                string batchId = Guid.NewGuid().ToString();

                // In a real application, you would query an external database here
                // For now, we'll create some sample data
                var sampleData = new List<SessionData>();
                
                // Generate 10 sample records
                for (int i = 1; i <= 10; i++)
                {
                    sampleData.Add(new SessionData
                    {
                        BatchId = batchId,
                        Source = "ExternalDB",
                        Process = query.Process,
                        Layer = query.Layer,
                        DefectType = $"DEFECT_{i}",
                        OperationList = query.Operation ?? "128853/198166",
                        ClassType = $"CLASS_{i % 3 + 1}",
                        Product = $"PROD_{i % 4 + 1}",
                        EntityConfidence = i % 5 + 1,
                        Comments = $"Sample comment for record {i}",
                        GenericData1 = $"Data1_{i}",
                        GenericData2 = $"Data2_{i}",
                        GenericData3 = $"Data3_{i}",
                        EdiAttribution = $"EDI_{i}",
                        EdiAttributionList = $"EDI_LIST_{i}",
                        SecurityCode = i % 3 + 1,
                        OriginalId = i * 100,
                        LastModified = DateTime.UtcNow,
                        LastModifiedBy = "System",
                        IsActive = true
                    });
                }

                // Save to database
                await _context.SessionData.AddRangeAsync(sampleData);
                await _context.SaveChangesAsync();

                // Save batch metadata
                _draftStorageService.SaveBatchMetadata(
                    batchId, 
                    "ExternalDB", 
                    null, 
                    query.Process, 
                    query.Layer, 
                    query.Operation ?? "", 
                    User.Identity?.Name ?? "Anonymous");

                return Ok(new { BatchId = batchId, RecordCount = sampleData.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying table data for Process {Process}, Layer {Layer}", query.Process, query.Layer);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("import")]
        [Consumes("multipart/form-data")]
        [RCTableEditor.Server.Helpers.SwaggerIgnore]
        public async Task<IActionResult> ImportTableData([FromForm] DTOs.FileUploadDTO fileUpload)
        {
            try
            {
                var file = fileUpload?.File;
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                // Generate a new batch ID
                string batchId = Guid.NewGuid().ToString();
                
                // Parse the Excel file
                using (var stream = file.OpenReadStream())
                {
                    var tableDataDTOs = _excelService.ParseExcelFile(
                        stream, 
                        User.Identity?.Name ?? "Anonymous");

                    if (tableDataDTOs.Count == 0)
                    {
                        return BadRequest("No valid data found in the Excel file");
                    }

                    // Convert DTOs to SessionData entities
                    var sessionData = tableDataDTOs.Select(dto => new SessionData
                    {
                        BatchId = batchId,
                        Source = "Excel",
                        Process = dto.Process,
                        Layer = dto.Layer,
                        DefectType = dto.DefectType,
                        OperationList = dto.OperationList,
                        ClassType = dto.ClassType,
                        Product = dto.Product,
                        EntityConfidence = dto.EntityConfidence,
                        Comments = dto.Comments,
                        GenericData1 = dto.GenericData1,
                        GenericData2 = dto.GenericData2,
                        GenericData3 = dto.GenericData3,
                        EdiAttribution = dto.EdiAttribution,
                        EdiAttributionList = dto.EdiAttributionList,
                        SecurityCode = dto.SecurityCode,
                        OriginalId = dto.OriginalId,
                        LastModified = dto.LastModified,
                        LastModifiedBy = dto.LastModifiedBy,
                        IsActive = true
                    }).ToList();

                    // Save to database
                    await _context.SessionData.AddRangeAsync(sessionData);
                    await _context.SaveChangesAsync();

                    // Save batch metadata
                    _draftStorageService.SaveBatchMetadata(
                        batchId,
                        "Excel",
                        file.FileName,
                        sessionData.First().Process,
                        sessionData.First().Layer,
                        sessionData.First().OperationList,
                        User.Identity?.Name ?? "Anonymous");

                    return Ok(new { BatchId = batchId, RecordCount = sessionData.Count });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing Excel data");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("export/{batchId}")]
        public async Task<IActionResult> ExportTableData(string batchId)
        {
            try
            {
                // Get session data for the batch
                var sessionData = await _context.SessionData
                    .Where(s => s.BatchId == batchId && s.IsActive)
                    .OrderBy(s => s.SessionDataId)
                    .ToListAsync();

                if (sessionData.Count == 0)
                {
                    return NotFound("No data found for the specified batch");
                }

                // Map to DTOs
                var tableDataDTOs = sessionData.Select(s => new TableDataDTO
                {
                    SessionDataId = s.SessionDataId,
                    BatchId = s.BatchId,
                    Process = s.Process,
                    Layer = s.Layer,
                    DefectType = s.DefectType,
                    OperationList = s.OperationList,
                    ClassType = s.ClassType,
                    Product = s.Product,
                    EntityConfidence = s.EntityConfidence,
                    Comments = s.Comments,
                    GenericData1 = s.GenericData1,
                    GenericData2 = s.GenericData2,
                    GenericData3 = s.GenericData3,
                    EdiAttribution = s.EdiAttribution,
                    EdiAttributionList = s.EdiAttributionList,
                    SecurityCode = s.SecurityCode,
                    OriginalId = s.OriginalId,
                    LastModified = s.LastModified,
                    LastModifiedBy = s.LastModifiedBy
                }).ToList();

                // Get draft changes
                var draftChanges = _draftStorageService.GetDraftChanges(batchId);

                // Generate Excel file with original data only (no changes)
                var excelData = _excelService.GenerateExcelFile(
                    tableDataDTOs, 
                    new List<ChangeDTO>(), 
                    sessionData.First().Process, 
                    sessionData.First().Layer);

                // Return Excel file
                return File(
                    excelData, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    $"TableData_{batchId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting table data for batch {BatchId}", batchId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
