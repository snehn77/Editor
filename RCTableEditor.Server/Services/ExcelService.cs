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
                
                // Create only a single worksheet for the final data with changes applied
                var finalDataSheet = package.Workbook.Worksheets.Add("Table Data");
                
                // Headers for the sheet
                var headers = new[]
                {
                    "ID", "Process", "Layer", "Defect Type", "Operation List", "Class Type", "Product",
                    "Entity Confidence", "Comments", "Generic Data 1", "Generic Data 2", "Generic Data 3",
                    "EDI Attribution", "EDI Attribution List", "Security Code", "Original ID", 
                    "Last Modified", "Last Modified By"
                };
                
                // Add headers to the data sheet
                for (int i = 0; i < headers.Length; i++)
                {
                    finalDataSheet.Cells[1, i + 1].Value = headers[i];
                    finalDataSheet.Cells[1, i + 1].Style.Font.Bold = true;
                    finalDataSheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    finalDataSheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                }
                
                // Create the data with all changes applied
                var finalData = new List<TableDataDTO>();
                foreach (var item in originalData)
                {
                    finalData.Add(new TableDataDTO
                    {
                        SessionDataId = item.SessionDataId,
                        BatchId = item.BatchId,
                        Process = item.Process,
                        Layer = item.Layer,
                        DefectType = item.DefectType,
                        OperationList = item.OperationList,
                        ClassType = item.ClassType,
                        Product = item.Product,
                        EntityConfidence = item.EntityConfidence,
                        Comments = item.Comments,
                        GenericData1 = item.GenericData1,
                        GenericData2 = item.GenericData2,
                        GenericData3 = item.GenericData3,
                        EdiAttribution = item.EdiAttribution,
                        EdiAttributionList = item.EdiAttributionList,
                        SecurityCode = item.SecurityCode,
                        OriginalId = item.OriginalId,
                        LastModified = item.LastModified,
                        LastModifiedBy = item.LastModifiedBy
                    });
                }
                
                // Apply all changes to the final data
                foreach (var change in changes)
                {
                    switch (change.ChangeType)
                    {
                        case "Add":
                            if (change.NewData != null)
                            {
                                finalData.Add(change.NewData);
                            }
                            break;
                            
                        case "Edit":
                            if (change.NewData != null && change.SessionDataId.HasValue)
                            {
                                var sessionIdToEdit = change.SessionDataId.Value;
                                var index = finalData.FindIndex(d => d.SessionDataId == sessionIdToEdit);
                                if (index >= 0)
                                {
                                    finalData[index] = change.NewData;
                                }
                            }
                            break;
                            
                        case "Remove":
                            if (change.SessionDataId.HasValue)
                            {
                                var sessionIdToRemove = change.SessionDataId.Value;
                                finalData.RemoveAll(d => d.SessionDataId == sessionIdToRemove);
                            }
                            break;
                    }
                }
                
                // Add data rows
                int row = 2;
                foreach (var data in finalData)
                {
                    finalDataSheet.Cells[row, 1].Value = data.SessionDataId;
                    finalDataSheet.Cells[row, 2].Value = data.Process;
                    finalDataSheet.Cells[row, 3].Value = data.Layer;
                    finalDataSheet.Cells[row, 4].Value = data.DefectType;
                    finalDataSheet.Cells[row, 5].Value = data.OperationList;
                    finalDataSheet.Cells[row, 6].Value = data.ClassType;
                    finalDataSheet.Cells[row, 7].Value = data.Product;
                    finalDataSheet.Cells[row, 8].Value = data.EntityConfidence;
                    finalDataSheet.Cells[row, 9].Value = data.Comments;
                    finalDataSheet.Cells[row, 10].Value = data.GenericData1;
                    finalDataSheet.Cells[row, 11].Value = data.GenericData2;
                    finalDataSheet.Cells[row, 12].Value = data.GenericData3;
                    finalDataSheet.Cells[row, 13].Value = data.EdiAttribution;
                    finalDataSheet.Cells[row, 14].Value = data.EdiAttributionList;
                    finalDataSheet.Cells[row, 15].Value = data.SecurityCode;
                    finalDataSheet.Cells[row, 16].Value = data.OriginalId;
                    finalDataSheet.Cells[row, 17].Value = data.LastModified;
                    finalDataSheet.Cells[row, 18].Value = data.LastModifiedBy;
                    
                    row++;
                }
                
                // Auto-size columns
                finalDataSheet.Cells.AutoFitColumns();
                
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
