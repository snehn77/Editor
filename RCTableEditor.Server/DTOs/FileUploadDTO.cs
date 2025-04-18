using Microsoft.AspNetCore.Http;

namespace RCTableEditor.Server.DTOs
{
    public class FileUploadDTO
    {
        public IFormFile File { get; set; }
    }
}
