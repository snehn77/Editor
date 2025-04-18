import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Alert, 
  Button, 
  Paper, 
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Link,
  Breadcrumbs,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Stack,
  CircularProgress,
  Backdrop,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Container,
  LinearProgress
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import NotesIcon from '@mui/icons-material/Notes';
import LayersIcon from '@mui/icons-material/Layers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelineIcon from '@mui/icons-material/Timeline';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShareIcon from '@mui/icons-material/Share';
import LinkIcon from '@mui/icons-material/Link';
import { format } from 'date-fns';
import { useBatch } from '../../context/BatchContext';
import tableService from '../../services/tableService';

const SubmitChanges = () => {
  const navigate = useNavigate();
  const { batchId, process, layer, isActive, clearActiveBatch } = useBatch();
  const theme = useTheme();
  
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [username, setUsername] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Redirect if no active batch
  useEffect(() => {
    if (!isActive || !batchId) {
      navigate('/');
    }
  }, [isActive, batchId, navigate]);

  // Load comparison data
  useEffect(() => {
    const fetchData = async () => {
      if (!batchId) return;
      
      try {
        setLoading(true);
        
        // Get comparison data
        const data = await tableService.getComparisonData(batchId);
        setComparisonData(data);
        
        // Set default username (in a real app, this would come from authentication)
        setUsername('Current User');
      } catch (error) {
        console.error('Error loading comparison data:', error);
        setError('Failed to load comparison data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batchId]);

  // Handle back to review
  const handleBackToReview = () => {
    navigate('/review');
  };

  // Handle notes change
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  // Handle username change
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!username) {
      setError('Please enter your username.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Submit changes
      const result = await tableService.submitChanges(batchId, username, notes);
      
      setSubmissionResult(result);
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error submitting changes:', error);
      setError('Failed to submit changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle close success dialog
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    
    // End the active session
    clearActiveBatch();
    
    // Navigate to dashboard
    navigate('/');
  };
  
  // View details in history
  const handleViewHistory = () => {
    if (submissionResult && submissionResult.changeId) {
      setSuccessDialogOpen(false);
      clearActiveBatch();
      navigate(`/history/${submissionResult.changeId}`);
    }
  };

  // Get change type counts
  const getChangeCounts = () => {
    if (!comparisonData || !comparisonData.changes) {
      return { additions: 0, modifications: 0, removals: 0, total: 0 };
    }
    
    const additions = comparisonData.changes.filter(c => c.changeType === 'Add').length;
    const modifications = comparisonData.changes.filter(c => c.changeType === 'Edit').length;
    const removals = comparisonData.changes.filter(c => c.changeType === 'Remove').length;
    
    return {
      additions,
      modifications,
      removals,
      total: additions + modifications + removals
    };
  };

  const changeCounts = getChangeCounts();

  return (
    <Box position="relative">
      {/* Loading and submitting overlays */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={loading || submitting}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">
          {submitting ? 'Submitting changes...' : 'Loading data...'}
        </Typography>
        {submitting && (
          <Box sx={{ width: '60%', maxWidth: 300, mt: 1 }}>
            <LinearProgress color="inherit" />
          </Box>
        )}
      </Backdrop>
      
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
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
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Dashboard
          </Link>
          <Link 
            color="inherit" 
            component="button"
            onClick={() => navigate('/editor')}
            sx={{ 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.875rem'
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
            Table Editor
          </Link>
          <Link 
            color="inherit" 
            component="button"
            onClick={() => navigate('/review')}
            sx={{ 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.875rem'
            }}
          >
            <CompareArrowsIcon fontSize="small" sx={{ mr: 0.5 }} />
            Review Changes
          </Link>
          <Typography color="text.primary" sx={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
            <SaveIcon fontSize="small" sx={{ mr: 0.5 }} />
            Submit Changes
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <UploadFileIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            Submit Changes
          </Typography>
          
          <Chip 
            icon={<DoneIcon />}
            label={`${changeCounts.total} Change${changeCounts.total !== 1 ? 's' : ''}`}
            color="primary"
            variant="filled"
            sx={{ 
              fontWeight: 600, 
              borderRadius: 2,
              px: 1
            }}
          />
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 800 }}>
          Please review the summary of changes below and provide your information before finalizing.
          Once submitted, these changes will be uploaded to SharePoint for approval.
        </Typography>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          variant="filled"
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
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              mb: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardHeader 
              title={
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Change Summary
                </Typography>
              }
              sx={{ 
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.default, 0.7),
                '& .MuiCardHeader-content': {
                  overflow: 'hidden'
                }
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                {/* Session Info */}
                <Box sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'primary.main' }}>
                    Session Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1
                      }}>
                        <DescriptionIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">Process</Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={500}>
                        {process}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1
                      }}>
                        <LayersIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">Layer</Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={500}>
                        {layer}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1 
                      }}>
                        <AssignmentIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">Batch ID</Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        sx={{ 
                          wordBreak: 'break-all',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem'
                        }}
                      >
                        {batchId}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1 
                      }}>
                        <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">Submission Date</Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={500}>
                        {format(new Date(), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Change Counts */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                    Change Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.success.main, 0.3),
                          bgcolor: alpha(theme.palette.success.main, 0.05)
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: alpha(theme.palette.success.main, 0.2),
                              color: 'success.main'
                            }}
                          >
                            <AddIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.75 }}>
                            {changeCounts.additions}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
                          Additions
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.warning.main, 0.3),
                          bgcolor: alpha(theme.palette.warning.main, 0.05)
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: alpha(theme.palette.warning.main, 0.2),
                              color: 'warning.main'
                            }}
                          >
                            <EditIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.75 }}>
                            {changeCounts.modifications}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
                          Edits
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.error.main, 0.3),
                          bgcolor: alpha(theme.palette.error.main, 0.05)
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: alpha(theme.palette.error.main, 0.2),
                              color: 'error.main'
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.75 }}>
                            {changeCounts.removals}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
                          Removals
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center', 
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }}>
                    <Typography variant="subtitle1" fontWeight={600}>Total Changes:</Typography>
                    <Chip 
                      label={changeCounts.total} 
                      color="primary" 
                      sx={{ fontWeight: 'bold', minWidth: 44 }}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              mb: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardHeader 
              title={
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <UploadFileIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Submission Details
                </Typography>
              }
              sx={{ 
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.default, 0.7),
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Alert 
                severity="info" 
                icon={<PersonIcon />}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
                variant="outlined"
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Please provide your information
                </Typography>
                <Typography variant="body2">
                  Your username will be recorded as the author of these changes
                </Typography>
              </Alert>
              
              <TextField
                label="Your Username"
                value={username}
                onChange={handleUsernameChange}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                helperText="Please enter your username for attribution"
              />
              
              <TextField
                label="Notes"
                value={notes}
                onChange={handleNotesChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                variant="outlined"
                placeholder="Enter any notes or comments about these changes..."
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, mt: 1.5, alignSelf: 'flex-start' }}>
                      <NotesIcon color="action" />
                    </Box>
                  )
                }}
                sx={{ 
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              
              <Typography variant="caption" color="text.secondary">
                Optional: Add notes about the purpose of these changes or any special considerations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 4,
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 3
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToReview}
          disabled={submitting}
          size="large"
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.2,
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px'
            }
          }}
        >
          Back to Review
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting || changeCounts.total === 0}
          endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
          size="large"
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.2,
            boxShadow: 2,
            fontWeight: 600
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Changes'}
        </Button>
      </Box>
      
      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ 
          bgcolor: alpha(theme.palette.success.main, 0.1),
          p: 2, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          pt: 4
        }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.success.main, 
              width: 60, 
              height: 60,
              mb: 2,
              boxShadow: 1
            }}
          >
            <CheckCircleIcon fontSize="large" />
          </Avatar>
          
          <Typography variant="h5" fontWeight={600} id="success-dialog-title">
            Changes Submitted Successfully
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Your changes have been processed and saved
          </Typography>
        </Box>
        
        <DialogContent sx={{ px: 3, py: 4 }}>
          <Typography variant="body1" paragraph id="success-dialog-description">
            Your changes have been submitted successfully. An Excel file has been generated and uploaded to SharePoint for approval.
          </Typography>
          
          <Stack spacing={3} sx={{ mt: 3 }}>
            {submissionResult && submissionResult.sharePointUrl && (
              <Card elevation={0} sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1)
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShareIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={600}>SharePoint URL</Typography>
                </Box>
                <Link 
                  href={submissionResult.sharePointUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'primary.main',
                    fontWeight: 500,
                    wordBreak: 'break-all'
                  }}
                >
                  <LinkIcon fontSize="small" />
                  {submissionResult.sharePointUrl}
                </Link>
              </Card>
            )}
            
            <Card elevation={0} sx={{ 
              p: 2, 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.info.main, 0.04),
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.1)
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AssignmentIcon color="info" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>Change ID</Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-all',
                  p: 1,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {submissionResult?.changeId || 'N/A'}
              </Typography>
            </Card>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleViewHistory} 
            color="primary"
            startIcon={<TimelineIcon />}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            View in History
          </Button>
          <Button 
            onClick={handleCloseSuccessDialog} 
            color="primary" 
            autoFocus
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Return to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmitChanges;
