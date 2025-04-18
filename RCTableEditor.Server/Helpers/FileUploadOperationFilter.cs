using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;

namespace RCTableEditor.Server.Helpers
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var actionDescriptor = context.ApiDescription.ActionDescriptor as ControllerActionDescriptor;
            if (actionDescriptor == null) return;

            // Check if the action has parameters that are IFormFile
            var formFileParams = actionDescriptor.Parameters
                .Where(p => p.ParameterType == typeof(Microsoft.AspNetCore.Http.IFormFile))
                .Select(p => p.Name)
                .ToList();

            if (formFileParams.Count > 0)
            {
                // Set the content type to multipart/form-data
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = formFileParams.ToDictionary(
                                    name => name,
                                    name => new OpenApiSchema
                                    {
                                        Type = "string",
                                        Format = "binary"
                                    }
                                ),
                                Required = new HashSet<string>(formFileParams)
                            }
                        }
                    }
                };
            }
        }
    }
}
