using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RCTableEditor.Server.Data;
using RCTableEditor.Server.DTOs;
using RCTableEditor.Server.Services;

namespace RCTableEditor.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ExcelService _excelService;
        private readonly ILogger<HistoryController> _logger;

        public HistoryController(
            AppDbContext context,
            ExcelService excelService,
            ILogger<HistoryController> logger)
        {
            _context = context;
            _excelService = excelService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetChangeHistory([FromQuery] string? process, [FromQuery] string? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                IQueryable<ChangeHistoryDTO> query = _context.ChangeHistory
                    .Select(ch => new ChangeHistoryDTO
                    {
                        ChangeId = ch.ChangeId,
                        BatchId = ch.BatchId,
                        Timestamp = ch.Timestamp,
                        Username = ch.Username,
                        ChangeType = ch.ChangeType,
                        Process = ch.Process,
                        SharePointUrl = ch.SharePointUrl ?? string.Empty,
                        ApprovalStatus = ch.ApprovalStatus,
                        ApprovalDate = ch.ApprovalDate,
                        ApprovedBy = ch.ApprovedBy
                    });

                // Apply filters
                if (!string.IsNullOrEmpty(process))
                {
                    query = query.Where(ch => ch.Process == process);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(ch => ch.ApprovalStatus == status);
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(ch => ch.Timestamp >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(ch => ch.Timestamp <= toDate.Value);
                }

                // Order by most recent first
                query = query.OrderByDescending(ch => ch.Timestamp);

                var result = await query.ToListAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving change history");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{changeId}")]
        public async Task<IActionResult> GetChangeDetail(string changeId)
        {
            try
            {
                var changeHistory = await _context.ChangeHistory
                    .FirstOrDefaultAsync(ch => ch.ChangeId == changeId);

                if (changeHistory == null)
                {
                    return NotFound("Change history not found");
                }

                var changeDetails = await _context.ChangeDetails
                    .Where(cd => cd.ChangeId == changeId)
                    .ToListAsync();

                return Ok(new
                {
                    ChangeHistory = new ChangeHistoryDTO
                    {
                        ChangeId = changeHistory.ChangeId,
                        BatchId = changeHistory.BatchId,
                        Timestamp = changeHistory.Timestamp,
                        Username = changeHistory.Username,
                        ChangeType = changeHistory.ChangeType,
                        Process = changeHistory.Process,
                        SharePointUrl = changeHistory.SharePointUrl ?? string.Empty,
                        ApprovalStatus = changeHistory.ApprovalStatus,
                        ApprovalDate = changeHistory.ApprovalDate,
                        ApprovedBy = changeHistory.ApprovedBy
                    },
                    ChangeDetails = changeDetails.Select(cd => new
                    {
                        cd.ChangeDetailId,
                        cd.ChangeType,
                        cd.SessionDataId,
                        cd.Process,
                        cd.Layer,
                        cd.DefectType,
                        cd.OperationList,
                        cd.FieldName,
                        cd.OldValue,
                        cd.NewValue,
                        cd.CreatedDate
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving change details for change {ChangeId}", changeId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{changeId}/excel")]
        public async Task<IActionResult> DownloadExcel(string changeId)
        {
            try
            {
                var changeHistory = await _context.ChangeHistory
                    .FirstOrDefaultAsync(ch => ch.ChangeId == changeId);

                if (changeHistory == null)
                {
                    return NotFound("Change history not found");
                }

                // In a real application, you would retrieve the Excel file from storage
                // For now, we'll return a simple message
                if (string.IsNullOrEmpty(changeHistory.SharePointUrl))
                {
                    return NotFound("Excel file not found");
                }

                return Ok(new
                {
                    DownloadUrl = changeHistory.SharePointUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Excel file for change {ChangeId}", changeId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
