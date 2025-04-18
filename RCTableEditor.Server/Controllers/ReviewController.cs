using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RCTableEditor.Server.Data;
using RCTableEditor.Server.DTOs;
using RCTableEditor.Server.Services;

namespace RCTableEditor.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DraftStorageService _draftStorageService;
        private readonly ILogger<ReviewController> _logger;

        public ReviewController(
            AppDbContext context,
            DraftStorageService draftStorageService,
            ILogger<ReviewController> logger)
        {
            _context = context;
            _draftStorageService = draftStorageService;
            _logger = logger;
        }

        [HttpGet("{batchId}")]
        public async Task<IActionResult> GetComparisonData(string batchId)
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
                var originalData = sessionData.Select(s => new TableDataDTO
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

                // Calculate the modified data based on draft changes
                var modifiedData = new List<TableDataDTO>(originalData); // Start with a copy of the original data

                // Apply changes to modified data
                foreach (var change in draftChanges)
                {
                    switch (change.ChangeType)
                    {
                        case "Add":
                            if (change.NewData != null)
                            {
                                modifiedData.Add(change.NewData);
                            }
                            break;

                        case "Edit":
                            if (change.SessionDataId.HasValue && change.NewData != null)
                            {
                                var index = modifiedData.FindIndex(d => d.SessionDataId == change.SessionDataId);
                                if (index >= 0)
                                {
                                    modifiedData[index] = change.NewData;
                                }
                            }
                            break;

                        case "Remove":
                            if (change.SessionDataId.HasValue)
                            {
                                var index = modifiedData.FindIndex(d => d.SessionDataId == change.SessionDataId);
                                if (index >= 0)
                                {
                                    modifiedData.RemoveAt(index);
                                }
                            }
                            break;
                    }
                }

                // Return comparison data
                return Ok(new
                {
                    OriginalData = originalData,
                    ModifiedData = modifiedData,
                    Changes = draftChanges
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comparison data for batch {BatchId}", batchId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
