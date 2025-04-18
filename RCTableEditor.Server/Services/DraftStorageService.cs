using LiteDB;
using RCTableEditor.Server.DTOs;
using System.IO;
// Use full qualified type names to avoid ambiguous reference

namespace RCTableEditor.Server.Services
{
    public class DraftStorageService
    {
        private readonly string _dbPath;
        private readonly ILogger<DraftStorageService> _logger;

        public DraftStorageService(IConfiguration configuration, ILogger<DraftStorageService> logger)
        {
            _dbPath = configuration["LiteDB:Path"] ?? "App_Data/drafts.db";
            _logger = logger;
            
            // Ensure directory exists
            var directory = Path.GetDirectoryName(_dbPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
        }

        public void SaveDraftChanges(string batchId, List<ChangeDTO> changes)
        {
            try
            {
                // Log the start of the operation
                _logger.LogInformation("Starting to save draft changes for batch {BatchId}, change count: {ChangeCount}", 
                    batchId, changes?.Count ?? 0);
                
                using var db = new LiteDatabase(_dbPath);
                var draftChanges = db.GetCollection<BsonDocument>("draft_changes");
                
                // Remove existing changes for this batch
                draftChanges.DeleteMany(Query.EQ("BatchId", batchId));
                _logger.LogInformation("Deleted old changes for batch {BatchId}", batchId);

                // Insert new changes
                if (changes == null || changes.Count == 0)
                {
                    _logger.LogInformation("No changes to save for batch {BatchId}", batchId);
                    return;
                }
                
                foreach (var change in changes)
                {
                    // Create value for SessionDataId 
                    BsonValue sessionDataId;
                    if (change.SessionDataId.HasValue)
                    {
                        sessionDataId = change.SessionDataId.Value;
                    }
                    else
                    {
                        sessionDataId = BsonValue.Null;
                    }
                    
                    var doc = new BsonDocument
                    {
                        ["BatchId"] = batchId,
                        ["ChangeType"] = change.ChangeType,
                        ["SessionDataId"] = sessionDataId,
                        ["OriginalData"] = change.OriginalData != null 
                            ? System.Text.Json.JsonSerializer.Serialize(change.OriginalData) 
                            : BsonValue.Null,
                        ["NewData"] = change.NewData != null 
                            ? System.Text.Json.JsonSerializer.Serialize(change.NewData) 
                            : BsonValue.Null,
                        ["ModifiedFields"] = change.ModifiedFields != null 
                            ? System.Text.Json.JsonSerializer.Serialize(change.ModifiedFields) 
                            : BsonValue.Null,
                        ["Timestamp"] = change.Timestamp,
                        ["IsDiscarded"] = false
                    };
                    
                    draftChanges.Insert(doc);
                    _logger.LogDebug("Inserted change {ChangeType} for SessionDataId {SessionDataId}", 
                        change.ChangeType, change.SessionDataId);
                }
                
                _logger.LogInformation("Successfully saved {Count} changes for batch {BatchId}", 
                    changes.Count, batchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving draft changes for batch {BatchId}: {Message}", 
                    batchId, ex.Message);
                throw;
            }
        }

        public List<ChangeDTO> GetDraftChanges(string batchId)
        {
            try
            {
                using var db = new LiteDatabase(_dbPath);
                var draftChanges = db.GetCollection<BsonDocument>("draft_changes");
                
                var changes = new List<ChangeDTO>();
                var docs = draftChanges.Find(Query.And(
                    Query.EQ("BatchId", batchId),
                    Query.EQ("IsDiscarded", false)
                ));
                
                foreach (var doc in docs)
                {
                    // Handle SessionDataId properly based on its type in the database
                    int? sessionDataId = null;
                    if (doc["SessionDataId"] != BsonValue.Null)
                    {
                        if (doc["SessionDataId"].IsInt32)
                        {
                            sessionDataId = doc["SessionDataId"].AsInt32;
                        }
                        else if (doc["SessionDataId"].IsString)
                        {
                            if (int.TryParse(doc["SessionDataId"].AsString, out int parsedId))
                            {
                                sessionDataId = parsedId;
                            }
                        }
                    }
                    
                    var change = new ChangeDTO
                    {
                        ChangeType = doc["ChangeType"].AsString,
                        SessionDataId = sessionDataId,
                        Timestamp = doc["Timestamp"].AsDateTime
                    };
                    
                    if (doc["OriginalData"] != BsonValue.Null)
                    {
                        change.OriginalData = System.Text.Json.JsonSerializer.Deserialize<TableDataDTO>(
                            doc["OriginalData"].AsString);
                    }
                    
                    if (doc["NewData"] != BsonValue.Null)
                    {
                        change.NewData = System.Text.Json.JsonSerializer.Deserialize<TableDataDTO>(
                            doc["NewData"].AsString);
                    }
                    
                    if (doc["ModifiedFields"] != BsonValue.Null)
                    {
                        change.ModifiedFields = System.Text.Json.JsonSerializer.Deserialize<List<string>>(
                            doc["ModifiedFields"].AsString);
                    }
                    
                    changes.Add(change);
                }
                
                return changes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving draft changes for batch {BatchId}", batchId);
                throw;
            }
        }

        public void DiscardDraftChanges(string batchId)
        {
            try
            {
                using var db = new LiteDatabase(_dbPath);
                var draftChanges = db.GetCollection<BsonDocument>("draft_changes");
                
                // Mark all changes for this batch as discarded
                var docs = draftChanges.Find(Query.EQ("BatchId", batchId));
                foreach (var doc in docs)
                {
                    doc["IsDiscarded"] = true;
                    draftChanges.Update(doc);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error discarding draft changes for batch {BatchId}", batchId);
                throw;
            }
        }

        public void SaveBatchMetadata(string batchId, string source, string? fileName, string process, string layer, string operationList, string username)
        {
            try
            {
                using var db = new LiteDatabase(_dbPath);
                var batchMetadata = db.GetCollection<BsonDocument>("batch_metadata");
                
                // Check if batch already exists
                var existingBatch = batchMetadata.FindOne(Query.EQ("BatchId", batchId));
                if (existingBatch != null)
                {
                    // Update existing metadata
                    existingBatch["Status"] = "Active";
                    batchMetadata.Update(existingBatch);
                    return;
                }
                
                // Create new metadata
                var doc = new BsonDocument
                {
                    ["BatchId"] = batchId,
                    ["Source"] = source,
                    ["CreatedDate"] = DateTime.UtcNow,
                    ["FileName"] = string.IsNullOrEmpty(fileName) ? BsonValue.Null : fileName,
                    ["Process"] = process,
                    ["Layer"] = layer,
                    ["OperationList"] = operationList,
                    ["Status"] = "Active",
                    ["Username"] = username
                };
                
                batchMetadata.Insert(doc);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving batch metadata for batch {BatchId}", batchId);
                throw;
            }
        }

        public void UpdateBatchStatus(string batchId, string status)
        {
            try
            {
                using var db = new LiteDatabase(_dbPath);
                var batchMetadata = db.GetCollection<BsonDocument>("batch_metadata");
                
                var batch = batchMetadata.FindOne(Query.EQ("BatchId", batchId));
                if (batch != null)
                {
                    batch["Status"] = status;
                    batchMetadata.Update(batch);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating batch status for batch {BatchId}", batchId);
                throw;
            }
        }
    }
}
