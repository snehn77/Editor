using Microsoft.SharePoint.Client;
using System.Security;
using System.Text;

namespace RCTableEditor.Server.Services
{
    public class SharePointService
    {
        private readonly ILogger<SharePointService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _siteUrl;
        private readonly string _username;
        private readonly string _password;
        private readonly string _libraryName;

        public SharePointService(IConfiguration configuration, ILogger<SharePointService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            
            _siteUrl = _configuration["SharePoint:SiteUrl"] ?? "";
            _username = _configuration["SharePoint:Username"] ?? "";
            _password = _configuration["SharePoint:Password"] ?? "";
            _libraryName = _configuration["SharePoint:LibraryName"] ?? "Documents";
        }

        public async Task<string> UploadFileAsync(byte[] fileContent, string fileName, string folderPath)
        {
            if (string.IsNullOrEmpty(_siteUrl) || string.IsNullOrEmpty(_username) || string.IsNullOrEmpty(_password))
            {
                _logger.LogWarning("SharePoint credentials not configured. File will not be uploaded to SharePoint.");
                return string.Empty;
            }

            return string.Empty;
            //try
            //{
            //    using (var clientContext = new ClientContext(_siteUrl))
            //    {
            //        // Set up the credentials
            //        SecureString securePassword = new SecureString();
            //        foreach (char c in _password)
            //        {
            //            securePassword.AppendChar(c);
            //        }

            //        clientContext.Credentials = new SharePointOnlineCredentials(_username, securePassword);

            //        // Get the SharePoint site
            //        Web web = clientContext.Web;
            //        clientContext.Load(web);
            //        await clientContext.ExecuteQueryAsync();

            //        // Get the document library
            //        List documentLibrary = web.Lists.GetByTitle(_libraryName);
            //        clientContext.Load(documentLibrary);
            //        await clientContext.ExecuteQueryAsync();

            //        // Create folder path if it doesn't exist
            //        Folder folder = EnsureFolderPath(clientContext, web, _libraryName, folderPath);

            //        // Upload the file
            //        using (var ms = new MemoryStream(fileContent))
            //        {
            //            FileCreationInformation fileInfo = new FileCreationInformation
            //            {
            //                Content = fileContent,
            //                Overwrite = true,
            //                Url = fileName
            //            };

            //            Microsoft.SharePoint.Client.File uploadedFile = folder.Files.Add(fileInfo);
            //            clientContext.Load(uploadedFile);
            //            await clientContext.ExecuteQueryAsync();

            //            // Get the file URL
            //            string fileUrl = uploadedFile.ServerRelativeUrl;
            //            return $"{_siteUrl}{fileUrl}";
            //        }
            //    }
            //}
            //catch (Exception ex)
            //{
            //    _logger.LogError(ex, "Error uploading file to SharePoint: {FileName}", fileName);
            //    return string.Empty;
            //}
        }

        private Folder EnsureFolderPath(ClientContext context, Web web, string documentLibraryName, string folderPath)
        {
            //if (string.IsNullOrEmpty(folderPath))
            //{
            //    // Return the root folder of the document library
            //    List documentLibrary = web.Lists.GetByTitle(documentLibraryName);
            //    context.Load(documentLibrary.RootFolder);
            //    context.ExecuteQuery();
            //    return documentLibrary.RootFolder;
            //}

            // Split the folder path into individual folder names
            string[] folderNames = folderPath.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            
            // Start with the root folder of the document library
            List documentLibrary = web.Lists.GetByTitle(documentLibraryName);
            context.Load(documentLibrary.RootFolder);
            context.ExecuteQuery();
            
            Folder currentFolder = documentLibrary.RootFolder;
            return currentFolder;
            // Create each folder in the path if it doesn't exist
            //foreach (string folderName in folderNames)
            //{
            //    // Check if the folder exists
            //    FolderCollection folders = currentFolder.Folders;
            //    context.Load(folders);
            //    context.ExecuteQuery();
                
            //    Folder? targetFolder = null;
            //    foreach (Folder folder in folders)
            //    {
            //        if (folder.Name.Equals(folderName, StringComparison.OrdinalIgnoreCase))
            //        {
            //            targetFolder = folder;
            //            break;
            //        }
            //    }
                
            //    // Create the folder if it doesn't exist
            //    if (targetFolder == null)
            //    {
            //        // Create a new folder
            //        FolderCollection.AddResult result = currentFolder.Folders.Add(folderName);
            //        context.Load(result.Folder);
            //        context.ExecuteQuery();
            //        targetFolder = result.Folder;
            //    }
                
            //    currentFolder = targetFolder;
            //}
            
            //return currentFolder;
        }
    }
}
