using Microsoft.AspNetCore.Mvc;
using RCTableEditor.Server.Data;
using System.Text.Json;

namespace RCTableEditor.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FiltersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FiltersController> _logger;

        public FiltersController(AppDbContext context, ILogger<FiltersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetFilters()
        {
            try
            {
                // In a real application, you would fetch this data from a database
                // For now, we'll return some sample filter options
                var filters = new
                {
                    Processes = new[] { "1274", "1275", "1276", "1277" },
                    Layers = new[] { "BKTCN", "PKVCN", "TTRCN", "MLPCN" },
                    Operations = new[] { "128853/198166", "128854/198167", "128855/198168", "128856/198169" }
                };

                return Ok(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving filter options");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("process")]
        public IActionResult GetProcesses()
        {
            try
            {
                // In a real application, fetch from database
                var processes = new[] { "1274", "1275", "1276", "1277" };
                return Ok(processes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving processes");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("layers/{process}")]
        public IActionResult GetLayersByProcess(string process)
        {
            try
            {
                // In a real application, filter by the process parameter
                var layers = new[] { "BKTCN", "PKVCN", "TTRCN", "MLPCN" };
                return Ok(layers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving layers for process {Process}", process);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("operations/{process}/{layer}")]
        public IActionResult GetOperationsByProcessAndLayer(string process, string layer)
        {
            try
            {
                // In a real application, filter by the process and layer parameters
                var operations = new[] { "128853/198166", "128854/198167", "128855/198168", "128856/198169" };
                return Ok(operations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving operations for process {Process}, layer {Layer}", process, layer);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
