using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace RCTableEditor.Server.Helpers
{
    public class SchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            // This is a blank implementation that doesn't do any filtering
            // We're using this class to register an ISchemaFilter to bypass Swagger validation
            // without actually modifying any schemas
        }
    }
}
