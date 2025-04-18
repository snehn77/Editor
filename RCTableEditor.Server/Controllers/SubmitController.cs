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
    public class SubmitController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DraftStorageService _draftStorageService;
        private readonly ExcelService _excelService;
        private readonly SharePointService _sharePointService;
        private readonly ILogger<SubmitController> _logger;

        public SubmitController(
            AppDbContext context,
            DraftStorageService draftStorageService,
            ExcelService excelService,
            SharePointService sharePointService,
            ILogger<SubmitController> logger)
        {
            _context = context;
            _draftStorageService = draftStorageService;
            _excelService = excelService;
            _sharePointService = sharePointService;
            _logger = logger;
        }

        [HttpPost("{batchId}")]
        public async Task<IActionResult> SubmitChanges(string batchId, [FromBody] SubmitChangesDTO submitDto)
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
                
                if (draftChanges.Count == 0)
                {
                    return BadRequest("No changes found to submit");
                }

                // Generate a change ID
                string changeId = Guid.NewGuid().ToString();

                // Create change history record
                var process = sessionData.First().Process;
                var layer = sessionData.First().Layer;
                
                // Generate Excel file with changes
                var excelData = _excelService.GenerateExcelFile(tableDataDTOs, draftChanges, process, layer);
                
                // Create file name for SharePoint upload
                string fileName = $"TableData_{process}_{layer}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                // Upload to SharePoint
                string folderPath = $"RC_Table_Editor/{process}/{layer}";
                string sharePointUrl = await _sharePointService.UploadFileAsync(excelData, fileName, folderPath);

                // Create ChangeHistory record
                var changeHistory = new ChangeHistory
                {
                    ChangeId = changeId,
                    BatchId = batchId,
                    Timestamp = DateTime.UtcNow,
                    Username = submitDto.Username,
                    ChangeType = string.Join(",", draftChanges.Select(c => c.ChangeType).Distinct()),
                    Process = process,
                    ExcelFilePath = fileName,
                    SharePointUrl = sharePointUrl,
                    ApprovalStatus = "Pending",
                    Notes = submitDto.Notes,
                    CreatedDate = DateTime.UtcNow
                };

                // Create ChangeDetail records
                var changeDetails = new List<ChangeDetail>();
                
                foreach (var change in draftChanges)
                {
                    var detail = new ChangeDetail
                    {
                        ChangeId = changeId,
                        ChangeType = change.ChangeType,
                        SessionDataId = change.SessionDataId,
                        Process = process,
                        Layer = layer,
                        DefectType = change.OriginalData?.DefectType ?? change.NewData?.DefectType ?? "",
                        OperationList = change.OriginalData?.OperationList ?? change.NewData?.OperationList ?? "",
                        CreatedDate = DateTime.UtcNow
                    };

                    // For edits, track which fields were modified
                    if (change.ChangeType == "Edit" && change.ModifiedFields != null)
                    {
                        foreach (var field in change.ModifiedFields)
                        {
                            var fieldDetail = new ChangeDetail
                            {
                                ChangeId = changeId,
                                ChangeType = "Edit",
                                SessionDataId = change.SessionDataId,
                                Process = process,
                                Layer = layer,
                                DefectType = change.OriginalData?.DefectType ?? "",
                                OperationList = change.OriginalData?.OperationList ?? "",
                                FieldName = field,
                                OldValue = GetPropertyValue(change.OriginalData, field),
                                NewValue = GetPropertyValue(change.NewData, field),
                                CreatedDate = DateTime.UtcNow
                            };
                            
                            changeDetails.Add(fieldDetail);
                        }
                    }
                    else
                    {
                        // For adds or removes, store the entire record
                        detail.OldValue = change.OriginalData != null
                            ? JsonSerializer.Serialize(change.OriginalData)
                            : null;
                            
                        detail.NewValue = change.NewData != null
                            ? JsonSerializer.Serialize(change.NewData)
                            : null;
                            
                        changeDetails.Add(detail);
                    }
                }

                // Save to database
                await _context.ChangeHistory.AddAsync(changeHistory);
                await _context.ChangeDetails.AddRangeAsync(changeDetails);
                await _context.SaveChangesAsync();

                // Update batch status to Submitted
                _draftStorageService.UpdateBatchStatus(batchId, "Submitted");

                return Ok(new 
                { 
                    ChangeId = changeId, 
                    SharePointUrl = sharePointUrl,
                    Message = "Changes submitted successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting changes for batch {BatchId}", batchId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{changeId}/status")]
        public async Task<IActionResult> GetSubmissionStatus(string changeId)
        {
            try
            {
                var changeHistory = await _context.ChangeHistory
                    .FirstOrDefaultAsync(c => c.ChangeId == changeId);

                if (changeHistory == null)
                {
                    return NotFound("Change history not found");
                }

                return Ok(new
                {
                    ChangeId = changeHistory.ChangeId,
                    Status = changeHistory.ApprovalStatus,
                    Timestamp = changeHistory.Timestamp,
                    ApprovalDate = changeHistory.ApprovalDate,
                    ApprovedBy = changeHistory.ApprovedBy,
                    SharePointUrl = changeHistory.SharePointUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving submission status for change {ChangeId}", changeId);
                return StatusCode(500, "Internal server error");
            }
        }

        // Helper method to get property value by name
        private string? GetPropertyValue(TableDataDTO? data, string propertyName)
        {
            if (data == null)
            {
                return null;
            }

            var property = typeof(TableDataDTO).GetProperty(propertyName);
            if (property == null)
            {
                return null;
            }

            var value = property.GetValue(data);
            return value?.ToString();
        }
    }
}
