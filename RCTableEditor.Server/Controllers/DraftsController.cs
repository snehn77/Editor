using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RCTableEditor.Server.Data;
using RCTableEditor.Server.DTOs;
using RCTableEditor.Server.Services;

namespace RCTableEditor.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DraftsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DraftStorageService _draftStorageService;
        private readonly ILogger<DraftsController> _logger;

        public DraftsController(
            AppDbContext context,
            DraftStorageService draftStorageService,
            ILogger<DraftsController> logger)
        {
            _context = context;
            _draftStorageService = draftStorageService;
            _logger = logger;
        }

        [HttpGet("{batchId}")]
        public IActionResult GetDraftChanges(string batchId)
        {
            try
            {
                var changes = _draftStorageService.GetDraftChanges(batchId);
                return Ok(changes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving draft changes for batch {BatchId}", batchId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{batchId}")]
        public IActionResult SaveDraftChanges(string batchId, [FromBody] List<ChangeDTO> changes)
        {
            try
            {
                _draftStorageService.SaveDraftChanges(batchId, changes);
                return Ok(new { Message = "Draft changes saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving draft changes for batch {BatchId}", batchId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{batchId}")]
        public IActionResult DiscardDraftChanges(string batchId)
        {
            try
            {
                _draftStorageService.DiscardDraftChanges(batchId);
                return Ok(new { Message = "Draft changes discarded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error discarding draft changes for batch {BatchId}", batchId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
