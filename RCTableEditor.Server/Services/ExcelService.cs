using OfficeOpenXml;
using OfficeOpenXml.Style;
using RCTableEditor.Server.DTOs;
using RCTableEditor.Server.Models;
using System.Drawing;

namespace RCTableEditor.Server.Services
{
    public class ExcelService
    {
        private readonly ILogger<ExcelService> _logger;

        public ExcelService(ILogger<ExcelService> logger)
        {
            _logger = logger;
            // Set EPPlus license context
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public byte[] GenerateExcelFile(List<TableDataDTO> originalData, List<ChangeDTO> changes, string process, string layer)
        {
            try
            {
                using var package = new ExcelPackage();
                
                // Create a worksheet for original data
                var originalSheet = package.Workbook.Worksheets.Add("Original Data");
                
                // Create a worksheet for changes
                var changesSheet = package.Workbook.Worksheets.Add("Changes");
                
                // Headers for both sheets
                var headers = new[]
                {
                    "ID", "Process", "Layer", "Defect Type", "Operation List", "Class Type", "Product",
                    "Entity Confidence", "Comments", "Generic Data 1", "Generic Data 2", "Generic Data 3",
                    "EDI Attribution", "EDI Attribution List", "Security Code", "Original ID", 
                    "Last Modified", "Last Modified By"
                };
                
                // Add headers to original data sheet
                for (int i = 0; i < headers.Length; i++)
                {
                    originalSheet.Cells[1, i + 1].Value = headers[i];
                    originalSheet.Cells[1, i + 1].Style.Font.Bold = true;
                    originalSheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    originalSheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                }
                
                // Add original data rows
                int row = 2;
                foreach (var data in originalData)
                {
                    originalSheet.Cells[row, 1].Value = data.SessionDataId;
                    originalSheet.Cells[row, 2].Value = data.Process;
                    originalSheet.Cells[row, 3].Value = data.Layer;
                    originalSheet.Cells[row, 4].Value = data.DefectType;
                    originalSheet.Cells[row, 5].Value = data.OperationList;
                    originalSheet.Cells[row, 6].Value = data.ClassType;
                    originalSheet.Cells[row, 7].Value = data.Product;
                    originalSheet.Cells[row, 8].Value = data.EntityConfidence;
                    originalSheet.Cells[row, 9].Value = data.Comments;
                    originalSheet.Cells[row, 10].Value = data.GenericData1;
                    originalSheet.Cells[row, 11].Value = data.GenericData2;
                    originalSheet.Cells[row, 12].Value = data.GenericData3;
                    originalSheet.Cells[row, 13].Value = data.EdiAttribution;
                    originalSheet.Cells[row, 14].Value = data.EdiAttributionList;
                    originalSheet.Cells[row, 15].Value = data.SecurityCode;
                    originalSheet.Cells[row, 16].Value = data.OriginalId;
                    originalSheet.Cells[row, 17].Value = data.LastModified;
                    originalSheet.Cells[row, 18].Value = data.LastModifiedBy;
                    
                    row++;
                }
                
                // Add headers to changes sheet with Change Type column
                var changeHeaders = new List<string> { "Change Type" };
                changeHeaders.AddRange(headers);
                
                for (int i = 0; i < changeHeaders.Count; i++)
                {
                    changesSheet.Cells[1, i + 1].Value = changeHeaders[i];
                    changesSheet.Cells[1, i + 1].Style.Font.Bold = true;
                    changesSheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    changesSheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                }
                
                // Add changes to the changes sheet
                row = 2;
                foreach (var change in changes)
                {
                    // Set change type
                    changesSheet.Cells[row, 1].Value = change.ChangeType;
                    
                    // Set cell color based on change type
                    var color = Color.White;
                    switch (change.ChangeType)
                    {
                        case "Add":
                            color = Color.LightGreen;
                            break;
                        case "Edit":
                            color = Color.LightYellow;
                            break;
                        case "Remove":
                            color = Color.LightPink;
                            break;
                    }
                    
                    changesSheet.Cells[row, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    changesSheet.Cells[row, 1].Style.Fill.BackgroundColor.SetColor(color);
                    
                    // For additions and edits, populate with new data
                    if (change.ChangeType == "Add" || change.ChangeType == "Edit")
                    {
                        if (change.NewData != null)
                        {
                            changesSheet.Cells[row, 2].Value = change.NewData.SessionDataId;
                            changesSheet.Cells[row, 3].Value = change.NewData.Process;
                            changesSheet.Cells[row, 4].Value = change.NewData.Layer;
                            changesSheet.Cells[row, 5].Value = change.NewData.DefectType;
                            changesSheet.Cells[row, 6].Value = change.NewData.OperationList;
                            changesSheet.Cells[row, 7].Value = change.NewData.ClassType;
                            changesSheet.Cells[row, 8].Value = change.NewData.Product;
                            changesSheet.Cells[row, 9].Value = change.NewData.EntityConfidence;
                            changesSheet.Cells[row, 10].Value = change.NewData.Comments;
                            changesSheet.Cells[row, 11].Value = change.NewData.GenericData1;
                            changesSheet.Cells[row, 12].Value = change.NewData.GenericData2;
                            changesSheet.Cells[row, 13].Value = change.NewData.GenericData3;
                            changesSheet.Cells[row, 14].Value = change.NewData.EdiAttribution;
                            changesSheet.Cells[row, 15].Value = change.NewData.EdiAttributionList;
                            changesSheet.Cells[row, 16].Value = change.NewData.SecurityCode;
                            changesSheet.Cells[row, 17].Value = change.NewData.OriginalId;
                            changesSheet.Cells[row, 18].Value = change.NewData.LastModified;
                            changesSheet.Cells[row, 19].Value = change.NewData.LastModifiedBy;
                            
                            // For edits, highlight changed fields
                            if (change.ChangeType == "Edit" && change.OriginalData != null && change.ModifiedFields != null)
                            {
                                // Map property names to column indices
                                var propToCol = new Dictionary<string, int>
                                {
                                    { "Process", 3 },
                                    { "Layer", 4 },
                                    { "DefectType", 5 },
                                    { "OperationList", 6 },
                                    { "ClassType", 7 },
                                    { "Product", 8 },
                                    { "EntityConfidence", 9 },
                                    { "Comments", 10 },
                                    { "GenericData1", 11 },
                                    { "GenericData2", 12 },
                                    { "GenericData3", 13 },
                                    { "EdiAttribution", 14 },
                                    { "EdiAttributionList", 15 },
                                    { "SecurityCode", 16 }
                                };
                                
                                foreach (var field in change.ModifiedFields)
                                {
                                    if (propToCol.TryGetValue(field, out int col))
                                    {
                                        changesSheet.Cells[row, col].Style.Fill.PatternType = ExcelFillStyle.Solid;
                                        changesSheet.Cells[row, col].Style.Fill.BackgroundColor.SetColor(Color.LightYellow);
                                        changesSheet.Cells[row, col].Style.Font.Bold = true;
                                    }
                                }
                            }
                        }
                    }
                    // For removals, populate with original data
                    else if (change.ChangeType == "Remove" && change.OriginalData != null)
                    {
                        changesSheet.Cells[row, 2].Value = change.OriginalData.SessionDataId;
                        changesSheet.Cells[row, 3].Value = change.OriginalData.Process;
                        changesSheet.Cells[row, 4].Value = change.OriginalData.Layer;
                        changesSheet.Cells[row, 5].Value = change.OriginalData.DefectType;
                        changesSheet.Cells[row, 6].Value = change.OriginalData.OperationList;
                        changesSheet.Cells[row, 7].Value = change.OriginalData.ClassType;
                        changesSheet.Cells[row, 8].Value = change.OriginalData.Product;
                        changesSheet.Cells[row, 9].Value = change.OriginalData.EntityConfidence;
                        changesSheet.Cells[row, 10].Value = change.OriginalData.Comments;
                        changesSheet.Cells[row, 11].Value = change.OriginalData.GenericData1;
                        changesSheet.Cells[row, 12].Value = change.OriginalData.GenericData2;
                        changesSheet.Cells[row, 13].Value = change.OriginalData.GenericData3;
                        changesSheet.Cells[row, 14].Value = change.OriginalData.EdiAttribution;
                        changesSheet.Cells[row, 15].Value = change.OriginalData.EdiAttributionList;
                        changesSheet.Cells[row, 16].Value = change.OriginalData.SecurityCode;
                        changesSheet.Cells[row, 17].Value = change.OriginalData.OriginalId;
                        changesSheet.Cells[row, 18].Value = change.OriginalData.LastModified;
                        changesSheet.Cells[row, 19].Value = change.OriginalData.LastModifiedBy;
                        
                        // Highlight entire row for removals
                        for (int i = 2; i <= 19; i++)
                        {
                            changesSheet.Cells[row, i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                            changesSheet.Cells[row, i].Style.Fill.BackgroundColor.SetColor(Color.LightPink);
                        }
                    }
                    
                    row++;
                }
                
                // Add summary information to a new sheet
                var summarySheet = package.Workbook.Worksheets.Add("Summary");
                summarySheet.Cells[1, 1].Value = "RC Table Editor - Change Summary";
                summarySheet.Cells[1, 1].Style.Font.Bold = true;
                summarySheet.Cells[1, 1].Style.Font.Size = 14;
                
                summarySheet.Cells[3, 1].Value = "Process:";
                summarySheet.Cells[3, 2].Value = process;
                summarySheet.Cells[4, 1].Value = "Layer:";
                summarySheet.Cells[4, 2].Value = layer;
                summarySheet.Cells[5, 1].Value = "Generated Date:";
                summarySheet.Cells[5, 2].Value = DateTime.Now;
                
                int addCount = changes.Count(c => c.ChangeType == "Add");
                int editCount = changes.Count(c => c.ChangeType == "Edit");
                int removeCount = changes.Count(c => c.ChangeType == "Remove");
                
                summarySheet.Cells[7, 1].Value = "Change Statistics:";
                summarySheet.Cells[7, 1].Style.Font.Bold = true;
                
                summarySheet.Cells[8, 1].Value = "Additions:";
                summarySheet.Cells[8, 2].Value = addCount;
                summarySheet.Cells[8, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                summarySheet.Cells[8, 2].Style.Fill.BackgroundColor.SetColor(Color.LightGreen);
                
                summarySheet.Cells[9, 1].Value = "Modifications:";
                summarySheet.Cells[9, 2].Value = editCount;
                summarySheet.Cells[9, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                summarySheet.Cells[9, 2].Style.Fill.BackgroundColor.SetColor(Color.LightYellow);
                
                summarySheet.Cells[10, 1].Value = "Removals:";
                summarySheet.Cells[10, 2].Value = removeCount;
                summarySheet.Cells[10, 2].Style.Fill.PatternType = ExcelFillStyle.Solid;
                summarySheet.Cells[10, 2].Style.Fill.BackgroundColor.SetColor(Color.LightPink);
                
                summarySheet.Cells[11, 1].Value = "Total Changes:";
                summarySheet.Cells[11, 2].Value = changes.Count;
                summarySheet.Cells[11, 2].Style.Font.Bold = true;
                
                // Auto-fit columns
                originalSheet.Cells[originalSheet.Dimension.Address].AutoFitColumns();
                changesSheet.Cells[changesSheet.Dimension.Address].AutoFitColumns();
                summarySheet.Cells[summarySheet.Dimension.Address].AutoFitColumns();
                
                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Excel file for process {Process}, layer {Layer}", process, layer);
                throw;
            }
        }

        public List<TableDataDTO> ParseExcelFile(Stream fileStream, string username)
        {
            try
            {
                using var package = new ExcelPackage(fileStream);
                var worksheet = package.Workbook.Worksheets[0]; // Assume data is in the first sheet
                
                var data = new List<TableDataDTO>();
                
                // Determine the number of rows and columns
                int rows = worksheet.Dimension.Rows;
                int cols = worksheet.Dimension.Columns;
                
                // Find header row (typically row 1)
                var headerRow = 1;
                
                // Get headers and their column indices
                var headers = new Dictionary<string, int>();
                for (int col = 1; col <= cols; col++)
                {
                    var headerValue = worksheet.Cells[headerRow, col].Value?.ToString();
                    if (!string.IsNullOrEmpty(headerValue))
                    {
                        headers[headerValue.Trim()] = col;
                    }
                }
                
                // Process data rows
                for (int row = headerRow + 1; row <= rows; row++)
                {
                    var tableData = new TableDataDTO
                    {
                        LastModified = DateTime.UtcNow,
                        LastModifiedBy = username
                    };
                    
                    // Map Excel columns to DTO properties based on headers
                    if (headers.TryGetValue("Process", out int processCol))
                        tableData.Process = worksheet.Cells[row, processCol].Value?.ToString() ?? string.Empty;
                    
                    if (headers.TryGetValue("Layer", out int layerCol))
                        tableData.Layer = worksheet.Cells[row, layerCol].Value?.ToString() ?? string.Empty;
                    
                    if (headers.TryGetValue("Defect Type", out int defectTypeCol))
                        tableData.DefectType = worksheet.Cells[row, defectTypeCol].Value?.ToString() ?? string.Empty;
                    
                    if (headers.TryGetValue("Operation List", out int operationListCol))
                        tableData.OperationList = worksheet.Cells[row, operationListCol].Value?.ToString() ?? string.Empty;
                    
                    if (headers.TryGetValue("Class Type", out int classTypeCol))
                        tableData.ClassType = worksheet.Cells[row, classTypeCol].Value?.ToString();
                    
                    if (headers.TryGetValue("Product", out int productCol))
                        tableData.Product = worksheet.Cells[row, productCol].Value?.ToString();
                    
                    if (headers.TryGetValue("Entity Confidence", out int entityConfidenceCol))
                    {
                        var value = worksheet.Cells[row, entityConfidenceCol].Value;
                        if (value != null && int.TryParse(value.ToString(), out int entityConfidence))
                            tableData.EntityConfidence = entityConfidence;
                    }
                    
                    if (headers.TryGetValue("Comments", out int commentsCol))
                        tableData.Comments = worksheet.Cells[row, commentsCol].Value?.ToString();
                    
                    if (headers.TryGetValue("Generic Data 1", out int genericData1Col))
                        tableData.GenericData1 = worksheet.Cells[row, genericData1Col].Value?.ToString();
                    
                    if (headers.TryGetValue("Generic Data 2", out int genericData2Col))
                        tableData.GenericData2 = worksheet.Cells[row, genericData2Col].Value?.ToString();
                    
                    if (headers.TryGetValue("Generic Data 3", out int genericData3Col))
                        tableData.GenericData3 = worksheet.Cells[row, genericData3Col].Value?.ToString();
                    
                    if (headers.TryGetValue("EDI Attribution", out int ediAttributionCol))
                        tableData.EdiAttribution = worksheet.Cells[row, ediAttributionCol].Value?.ToString();
                    
                    if (headers.TryGetValue("EDI Attribution List", out int ediAttributionListCol))
                        tableData.EdiAttributionList = worksheet.Cells[row, ediAttributionListCol].Value?.ToString();
                    
                    if (headers.TryGetValue("Security Code", out int securityCodeCol))
                    {
                        var value = worksheet.Cells[row, securityCodeCol].Value;
                        if (value != null && int.TryParse(value.ToString(), out int securityCode))
                            tableData.SecurityCode = securityCode;
                    }
                    
                    if (headers.TryGetValue("Original ID", out int originalIdCol))
                    {
                        var value = worksheet.Cells[row, originalIdCol].Value;
                        if (value != null && int.TryParse(value.ToString(), out int originalId))
                            tableData.OriginalId = originalId;
                    }
                    
                    // Skip rows that don't have required data
                    if (!string.IsNullOrEmpty(tableData.Process) && 
                        !string.IsNullOrEmpty(tableData.Layer) && 
                        !string.IsNullOrEmpty(tableData.DefectType))
                    {
                        data.Add(tableData);
                    }
                }
                
                return data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing Excel file");
                throw;
            }
        }
    }
}
