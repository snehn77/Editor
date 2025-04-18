import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Grid,
  Divider,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { format, parseISO, isValid } from 'date-fns';
import LoadingOverlay from '../../components/LoadingIndicator/LoadingOverlay';
import tableService from '../../services/tableService';

const ChangeHistoryDetail = () => {
  const { changeId } = useParams();
  const navigate = useNavigate();
  
  const [changeData, setChangeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load change detail data
  useEffect(() => {
    const fetchData = async () => {
      if (!changeId) return;
      
      try {
        setLoading(true);
        
        // Get change detail data
        const data = await tableService.getChangeDetail(changeId);
        setChangeData(data);
      } catch (error) {
        console.error('Error loading change detail:', error);
        setError('Failed to load change details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [changeId]);

  // Handle back to history
  const handleBackToHistory = () => {
    navigate('/history');
  };

  // Handle download Excel
  const handleDownloadExcel = async () => {
    try {
      await tableService.downloadExcel(changeId);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setError('Failed to download Excel file. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
      default:
        return 'warning';
    }
  };

  // Get change type chip color
  const getChangeTypeColor = (type) => {
    switch (type) {
      case 'Add':
        return 'success';
      case 'Edit':
        return 'warning';
      case 'Remove':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render change history summary
  const renderChangeSummary = () => {
    if (!changeData || !changeData.changeHistory) return null;
    
    const { changeHistory } = changeData;
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Change Summary</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Change ID</Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{changeHistory.changeId}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Process</Typography>
              <Typography variant="body1">{changeHistory.process}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Change Type</Typography>
              <Typography variant="body1">{changeHistory.changeType}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Submitted By</Typography>
              <Typography variant="body1">{changeHistory.username}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Submission Date</Typography>
              <Typography variant="body1">{formatDate(changeHistory.timestamp)}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Approval Status</Typography>
              <Chip 
                label={changeHistory.approvalStatus} 
                color={getStatusColor(changeHistory.approvalStatus)} 
                size="small"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Approved By</Typography>
              <Typography variant="body1">{changeHistory.approvedBy || '-'}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Approval Date</Typography>
              <Typography variant="body1">
                {changeHistory.approvalDate ? formatDate(changeHistory.approvalDate) : '-'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {changeHistory.sharePointUrl && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">SharePoint URL</Typography>
            <Link href={changeHistory.sharePointUrl} target="_blank" rel="noopener noreferrer">
              {changeHistory.sharePointUrl}
            </Link>
          </Box>
        )}
      </Paper>
    );
  };

  // Render change details
  const renderChangeDetails = () => {
    if (!changeData || !changeData.changeDetails || changeData.changeDetails.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No detailed change information available.
        </Alert>
      );
    }
    
    // Group changes by type
    const addChanges = changeData.changeDetails.filter(detail => detail.changeType === 'Add');
    const editChanges = changeData.changeDetails.filter(detail => detail.changeType === 'Edit');
    const removeChanges = changeData.changeDetails.filter(detail => detail.changeType === 'Remove');
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Change Details</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table aria-label="change details table">
            <TableHead>
              <TableRow>
                <TableCell>Change Type</TableCell>
                <TableCell>Defect Type</TableCell>
                <TableCell>Operation List</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Old Value</TableCell>
                <TableCell>New Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {changeData.changeDetails.map((detail, index) => (
                <TableRow 
                  key={detail.changeDetailId || index}
                  sx={{
                    backgroundColor: 
                      detail.changeType === 'Add' 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : detail.changeType === 'Edit' 
                        ? 'rgba(255, 152, 0, 0.1)' 
                        : 'rgba(244, 67, 54, 0.1)'
                  }}
                >
                  <TableCell>
                    <Chip 
                      label={detail.changeType} 
                      color={getChangeTypeColor(detail.changeType)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{detail.defectType}</TableCell>
                  <TableCell>{detail.operationList}</TableCell>
                  <TableCell>{detail.fieldName || '-'}</TableCell>
                  <TableCell>{detail.oldValue || '-'}</TableCell>
                  <TableCell>{detail.newValue || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Box position="relative">
      {loading && <LoadingOverlay message="Loading change details..." />}
      
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link color="inherit" href="#" onClick={() => navigate('/')}>
          Dashboard
        </Link>
        <Link color="inherit" href="#" onClick={() => navigate('/history')}>
          Change History
        </Link>
        <Typography color="text.primary">Change Details</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Change Details
        </Typography>
        {changeData && changeData.changeHistory && changeData.changeHistory.sharePointUrl && (
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleDownloadExcel}
          >
            Download Excel
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {renderChangeSummary()}
      {renderChangeDetails()}
      
      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToHistory}
        >
          Back to History
        </Button>
      </Box>
    </Box>
  );
};

export default ChangeHistoryDetail;
