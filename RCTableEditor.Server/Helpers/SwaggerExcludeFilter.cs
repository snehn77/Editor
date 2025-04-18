using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace RCTableEditor.Server.Helpers
{
    public class SwaggerExcludeFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            // Find and remove the problematic endpoint
            var fileUploadEndpoint = swaggerDoc.Paths
                .Where(x => x.Key.Contains("import") && 
                            x.Value.Operations.Any(o => o.Key == OperationType.Post))
                .Select(x => x.Key)
                .FirstOrDefault();

            if (fileUploadEndpoint != null)
            {
                swaggerDoc.Paths.Remove(fileUploadEndpoint);
            }
        }
    }
}
