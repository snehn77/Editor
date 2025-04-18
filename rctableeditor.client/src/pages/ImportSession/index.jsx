import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Alert,
    CircularProgress,
    FormHelperText,
    Grid,
    Link,
    Breadcrumbs,
    Divider,
    IconButton,
    Chip,
    Backdrop,
    useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useBatch } from '../../context/BatchContext';
import tableService from '../../services/tableService';
import {
    PageContainer,
    HeaderContainer,
    UploadCard,
    CardHeaderContainer,
    UploadAreaContainer,
    DropZone,
    FilePreviewContainer,
    FilePreviewCard,
    FileInfoContainer,
    FileTextContainer,
    ButtonContainer,
    InfoCard,
    InfoCardContent,
    LoadingBackdrop
} from './styles';
import { Button, Box } from '@mui/material';

const ImportSession = () => {
    const navigate = useNavigate();
    const { setActiveBatch } = useBatch();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        // Check if file is an Excel file
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(fileExtension)) {
            setError('Please select a valid Excel file (.xlsx or .xls)');
            setFile(null);
            return;
        }

        setError('');
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await tableService.importTableData(file);

            // Set active batch context
            setActiveBatch({
                batchId: result.batchId,
                process: '', // These details will be retrieved when data is loaded in Table Editor
                layer: '',
                operation: '',
                source: 'Excel',
                fileName: file.name
            });

            // Navigate to the table editor page
            navigate('/editor');
        } catch (error) {
            console.error('Error importing Excel data:', error);
            setError('Failed to import data. Please ensure your Excel file has the correct format.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    const fileInputRef = useRef(null);
    const theme = useTheme();

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const clearFileSelection = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const downloadTemplateFile = () => {
        // In a real implementation, this would download a template Excel file
        // For now, we'll just log a message
        console.log('Downloading template file...');
        // You would implement the actual download functionality here
    };

    return (
        <PageContainer>
            {/* Loading Overlay */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    flexDirection: 'column',
                    gap: 2
                }}
                open={loading}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6">Importing your data...</Typography>
            </Backdrop>

            {/* Page Header */}
            <HeaderContainer>
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" color="disabled" />}
                    sx={{ mb: 1.5 }}
                >
                    <Link
                        color="inherit"
                        component="button"
                        onClick={() => navigate('/')}
                        sx={{
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.875rem'
                        }}
                    >
                        Dashboard
                    </Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
                        Import Session
                    </Typography>
                </Breadcrumbs>

                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1
                    }}
                >
                    <FileUploadIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                    Import Excel Data
                </Typography>

                <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 800 }}>
                    Upload an Excel file containing tabular data to begin an editing session.
                    The file must include the required columns for processing.
                </Typography>
            </HeaderContainer>

            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: 2 }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setError('')}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    {/* Main Upload Area */}
                    <UploadCard>
                        <CardHeaderContainer>
                            <Typography variant="h6" fontWeight={600}>
                                Upload Excel File
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Select and upload your Excel file to begin the data import process
                            </Typography>
                        </CardHeaderContainer>

                        <UploadAreaContainer>
                            <input
                                accept=".xlsx,.xls"
                                style={{ display: 'none' }}
                                id="excel-file-upload"
                                type="file"
                                onChange={handleFileChange}
                                disabled={loading}
                                ref={fileInputRef}
                            />

                            {!file ? (
                                <DropZone onClick={openFileDialog}>
                                    <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.8, mb: 2 }} />

                                    <Typography variant="h6" gutterBottom fontWeight={600}>
                                        Drag & Drop or Click to Upload
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Support for Excel files (.xlsx, .xls)
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        startIcon={<FileUploadIcon />}
                                        sx={{ mt: 1 }}
                                    >
                                        Select File
                                    </Button>
                                </DropZone>
                            ) : (
                                <FilePreviewContainer>
                                    <FilePreviewCard>
                                        <FileInfoContainer>
                                            <DescriptionIcon
                                                sx={{
                                                    fontSize: 40,
                                                    color: 'success.main',
                                                    mr: 2
                                                }}
                                            />
                                            <FileTextContainer>
                                                <Typography variant="subtitle1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                                                    {file.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            </FileTextContainer>
                                            <IconButton
                                                color="error"
                                                onClick={clearFileSelection}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </FileInfoContainer>

                                        <Divider sx={{ my: 2 }} />

                                        <Box sx={{ textAlign: 'right' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleUpload}
                                                disabled={loading}
                                                endIcon={loading ? <CircularProgress size={16} /> : <ArrowForwardIcon />}
                                                size="large"
                                                sx={{ px: 3 }}
                                            >
                                                {loading ? 'Uploading...' : 'Import Data'}
                                            </Button>
                                        </Box>
                                    </FilePreviewCard>
                                </FilePreviewContainer>
                            )}
                        </UploadAreaContainer>
                    </UploadCard>

                    <ButtonContainer>
                        <Button
                            startIcon={<HomeIcon />}
                            variant="text"
                            onClick={handleCancel}
                        >
                            Return to Dashboard
                        </Button>

                        <Button
                            startIcon={<DownloadIcon />}
                            variant="text"
                            color="primary"
                            onClick={downloadTemplateFile}
                        >
                            Download Template
                        </Button>
                    </ButtonContainer>
                </Grid>

                <Grid item xs={12} md={5}>
                    {/* Info Card */}
                    <InfoCard>
                        <InfoCardContent>
                            <Typography variant="subtitle1" fontWeight={600} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                <InfoOutlinedIcon sx={{ mr: 1, color: 'info.main' }} />
                                Import Information
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="body2" paragraph>
                                Importing data from Excel files allows you to start a new editing session with existing data.
                                Follow these guidelines for a successful import:
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Required Excel Format:
                                </Typography>
                                <Typography variant="body2" component="div">
                                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                                        <li>File must be in <strong>.xlsx</strong> or <strong>.xls</strong> format</li>
                                        <li>The first row must contain column headers</li>
                                        <li>Must include required columns: <Chip size="small" label="Process" />, <Chip size="small" label="Layer" />, etc.</li>
                                        <li>Data should start from the second row</li>
                                    </ul>
                                </Typography>
                            </Box>

                            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                                After importing, you'll be able to review and edit the data in the Table Editor.
                            </Alert>
                        </InfoCardContent>
                    </InfoCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default ImportSession;