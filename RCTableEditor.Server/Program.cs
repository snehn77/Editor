using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using RCTableEditor.Server.Data;
using RCTableEditor.Server.Helpers;
using RCTableEditor.Server.Services;
using System.IO;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Configure SQLite
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "App_Data", "rctableeditor.db");
var dbDirectory = Path.GetDirectoryName(dbPath);
if (!Directory.Exists(dbDirectory))
{
    Directory.CreateDirectory(dbDirectory!);
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Configure LiteDB path
builder.Configuration["LiteDB:Path"] = Path.Combine(builder.Environment.ContentRootPath, "App_Data", "drafts.db");

// Configure SharePoint settings (empty for now, to be configured in production)
builder.Configuration["SharePoint:SiteUrl"] = "";
builder.Configuration["SharePoint:Username"] = "";
builder.Configuration["SharePoint:Password"] = "";
builder.Configuration["SharePoint:LibraryName"] = "Documents";

// Register application services
builder.Services.AddScoped<DraftStorageService>();
builder.Services.AddScoped<ExcelService>();
builder.Services.AddScoped<SharePointService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger to handle file uploads
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RC Table Editor API", Version = "v1" });
    
    // Ignore endpoints with SwaggerIgnore attribute
    c.DocInclusionPredicate((docName, apiDesc) => {
        if (apiDesc.ActionDescriptor is Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor controllerActionDescriptor)
        {
            var methodInfo = controllerActionDescriptor.MethodInfo;
            var hasIgnoreAttribute = methodInfo.GetCustomAttributes(typeof(RCTableEditor.Server.Helpers.SwaggerIgnoreAttribute), true).Any();
            return !hasIgnoreAttribute;
        }
        return true;
    });
    
    // We've configured it to ignore file upload endpoints
});

var app = builder.Build();

// Ensure the database is created
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
