import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Alert, 
  Button, 
  Paper, 
  Tabs, 
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Stack,
  CircularProgress,
  Backdrop,
  Badge,
  Container,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import TimelineIcon from '@mui/icons-material/Timeline';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { useBatch } from '../../context/BatchContext';
import tableService from '../../services/tableService';

// Custom component to show key differences
const DiffHighlighter = ({ oldValue, newValue }) => {
  const theme = useTheme();
  
  if (oldValue === newValue) return newValue || '-';
  if (oldValue === null || oldValue === undefined) oldValue = '';
  if (newValue === null || newValue === undefined) newValue = '';
  
  return (
    <Box sx={{ 
      backgroundColor: alpha(theme.palette.warning.main, 0.1), 
      padding: '4px 8px', 
      borderRadius: theme.shape.borderRadius,
      border: '1px solid',
      borderColor: alpha(theme.palette.warning.main, 0.3),
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      fontSize: '0.875rem'
    }}>
      <Box sx={{ 
        textDecoration: 'line-through', 
        color: theme.palette.error.main, 
        backgroundColor: alpha(theme.palette.error.main, 0.05),
        p: 0.5,
        borderRadius: 1,
        fontSize: '0.875rem',
        fontFamily: 'monospace'
      }}>
        {oldValue}
      </Box>
      <Box sx={{ 
        color: theme.palette.success.main, 
        backgroundColor: alpha(theme.palette.success.main, 0.05),
        p: 0.5,
        borderRadius: 1,
        fontSize: '0.875rem',
        fontFamily: 'monospace',
        fontWeight: 'medium'
      }}>
        {newValue}
      </Box>
    </Box>
  );
};

const ReviewChanges = () => {
  const navigate = useNavigate();
  const { batchId, process, layer, isActive } = useBatch();
  const theme = useTheme();
  
  const [comparisonData, setComparisonData] = useState({
    originalData: [],
    modifiedData: [],
    changes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChange, setSelectedChange] = useState(null);

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
        
        // Set first change as selected by default if changes exist
        if (data.changes && data.changes.length > 0) {
          setSelectedChange(data.changes[0]);
        }
      } catch (error) {
        console.error('Error loading comparison data:', error);
        setError('Failed to load comparison data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batchId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle change selection
  const handleChangeSelect = (change) => {
    setSelectedChange(change);
  };

  // Handle back to editor
  const handleBackToEditor = () => {
    navigate('/editor');
  };

  // Handle submit changes
  const handleSubmitChanges = () => {
    navigate('/submit');
  };

  // Get appropriate chip color for change type
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

  // Find a row by session data ID
  const findRowById = (dataArray, sessionDataId) => {
    return dataArray.find(row => row.sessionDataId === sessionDataId);
  };

  // Render the changes summary
  const renderChangesSummary = () => {
    const { changes } = comparisonData;
    
    if (!changes || changes.length === 0) {
      return (
        <Alert 
          severity="info" 
          sx={{ my: 2, borderRadius: 2 }}
          variant="standard"
        >
          No changes have been made to the data.
        </Alert>
      );
    }
    
    // Count changes by type
    const counts = {
      Add: changes.filter(c => c.changeType === 'Add').length,
      Edit: changes.filter(c => c.changeType === 'Edit').length,
      Remove: changes.filter(c => c.changeType === 'Remove').length
    };
    
    return (
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3, 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center' 
          }}
        >
          <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
          Change Summary
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.3),
                backgroundColor: alpha(theme.palette.success.main, 0.05)
              }}
            >
              <Avatar 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  mb: 1.5, 
                  mx: 'auto',
                  bgcolor: alpha(theme.palette.success.main, 0.2),
                  color: 'success.main'
                }}
              >
                <AddIcon />
              </Avatar>
              <Typography variant="h3" fontWeight="bold">{counts.Add}</Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Additions</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.warning.main, 0.3),
                backgroundColor: alpha(theme.palette.warning.main, 0.05)
              }}
            >
              <Avatar 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  mb: 1.5, 
                  mx: 'auto',
                  bgcolor: alpha(theme.palette.warning.main, 0.2),
                  color: 'warning.main'
                }}
              >
                <EditIcon />
              </Avatar>
              <Typography variant="h3" fontWeight="bold">{counts.Edit}</Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Modifications</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.3),
                backgroundColor: alpha(theme.palette.error.main, 0.05)
              }}
            >
              <Avatar 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  mb: 1.5, 
                  mx: 'auto',
                  bgcolor: alpha(theme.palette.error.main, 0.2),
                  color: 'error.main'
                }}
              >
                <DeleteIcon />
              </Avatar>
              <Typography variant="h3" fontWeight="bold">{counts.Remove}</Typography>
              <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Removals</Typography>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Changes List
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select an item below to view detailed comparison
          </Typography>
        </Box>
        
        <Card 
          elevation={0} 
          sx={{ 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          <List 
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              p: 0,
              '& .MuiListItem-root': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}
          >
          {changes.map((change, index) => (
            <ListItem
              key={index}
              button
              selected={selectedChange && selectedChange.sessionDataId === change.sessionDataId && selectedChange.changeType === change.changeType}
              onClick={() => handleChangeSelect(change)}
            >
              <Grid container alignItems="center">
                <Grid item xs={8}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={change.changeType} 
                          size="small"
                          color={getChangeTypeColor(change.changeType)}
                        />
                        <span>
                          {change.changeType === 'Add' 
                            ? 'New Row' 
                            : change.changeType === 'Remove' 
                            ? `Remove: ${change.originalData?.defectType || 'Row'}` 
                            : `Edit: ${change.originalData?.defectType || 'Row'}`}
                        </span>
                      </Box>
                    }
                    secondary={
                      change.changeType === 'Edit' && change.modifiedFields
                        ? `Modified fields: ${change.modifiedFields.join(', ')}`
                        : format(new Date(change.timestamp), 'MMM dd, yyyy HH:mm')
                    }
                  />
                </Grid>
                <Grid item xs={4} container justifyContent="flex-end">
                  <Typography variant="body2" color="text.secondary">
                    {change.changeType === 'Edit' 
                      ? format(new Date(change.timestamp), 'MMM dd, yyyy HH:mm')
                      : ''}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
        </Card>
      </Box>
    );
  };

  // Render the side-by-side comparison
  const renderSideBySideComparison = () => {
    const { originalData, modifiedData } = comparisonData;
    
    if (!selectedChange) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Select a change from the list to view the comparison.
        </Alert>
      );
    }
    
    // Find original and modified rows
    let originalRow, modifiedRow;
    
    switch (selectedChange.changeType) {
      case 'Add':
        originalRow = null;
        modifiedRow = selectedChange.newData;
        break;
      case 'Edit':
        originalRow = selectedChange.originalData;
        modifiedRow = selectedChange.newData;
        break;
      case 'Remove':
        originalRow = selectedChange.originalData;
        modifiedRow = null;
        break;
      default:
        break;
    }
    
    const fieldDefinitions = [
      { field: 'process', label: 'Process' },
      { field: 'layer', label: 'Layer' },
      { field: 'defectType', label: 'Defect Type' },
      { field: 'operationList', label: 'Operation List' },
      { field: 'classType', label: 'Class Type' },
      { field: 'product', label: 'Product' },
      { field: 'entityConfidence', label: 'Entity Confidence' },
      { field: 'comments', label: 'Comments' },
      { field: 'genericData1', label: 'Generic Data 1' },
      { field: 'genericData2', label: 'Generic Data 2' },
      { field: 'genericData3', label: 'Generic Data 3' },
      { field: 'ediAttribution', label: 'EDI Attribution' },
      { field: 'ediAttributionList', label: 'EDI Attribution List' },
      { field: 'securityCode', label: 'Security Code' }
    ];
    
    return (
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" gutterBottom>
          {selectedChange.changeType === 'Add' ? 'New Record' : 
           selectedChange.changeType === 'Edit' ? 'Record Changes' : 
           'Removed Record'}
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Original Value</TableCell>
                <TableCell>Modified Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldDefinitions.map((field) => {
                const isModified = selectedChange.changeType === 'Edit' && 
                                  selectedChange.modifiedFields && 
                                  selectedChange.modifiedFields.includes(field.field);
                                
                return (
                  <TableRow 
                    key={field.field}
                    sx={{
                      backgroundColor: isModified 
                        ? 'rgba(255, 152, 0, 0.1)' 
                        : 'inherit'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {field.label}
                      {isModified && (
                        <Chip 
                          label="Modified" 
                          size="small"
                          color="warning"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {originalRow ? String(originalRow[field.field] || '-') : '-'}
                    </TableCell>
                    <TableCell>
                      {selectedChange.changeType === 'Edit' ? (
                        <DiffHighlighter 
                          oldValue={originalRow ? originalRow[field.field] : null} 
                          newValue={modifiedRow ? modifiedRow[field.field] : null} 
                        />
                      ) : (
                        modifiedRow ? String(modifiedRow[field.field] || '-') : '-'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Render the full data comparison
  const renderFullDataComparison = () => {
    const { originalData, modifiedData } = comparisonData;
    
    if (!originalData || !modifiedData) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No data available for comparison.
        </Alert>
      );
    }
    
    // Column definitions
    const columns = [
      { id: 'defectType', label: 'Defect Type' },
      { id: 'classType', label: 'Class Type' },
      { id: 'product', label: 'Product' },
      { id: 'entityConfidence', label: 'Entity Confidence' },
      { id: 'comments', label: 'Comments' }
    ];
    
    return (
      <Grid container spacing={2} sx={{ my: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Original Data</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id}>{column.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {originalData.map((row) => (
                  <TableRow key={row.sessionDataId}>
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {row[column.id] !== null && row[column.id] !== undefined ? row[column.id].toString() : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Modified Data</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id}>{column.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {modifiedData.map((row) => {
                  // Find if this is a new or modified row
                  const isNew = !originalData.some(r => r.sessionDataId === row.sessionDataId);
                  const isModified = comparisonData.changes.some(
                    c => c.changeType === 'Edit' && c.sessionDataId === row.sessionDataId
                  );
                  
                  return (
                    <TableRow 
                      key={row.sessionDataId}
                      sx={{
                        backgroundColor: isNew 
                          ? 'rgba(76, 175, 80, 0.1)' 
                          : isModified 
                          ? 'rgba(255, 152, 0, 0.1)' 
                          : 'inherit'
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.id}>
                          {row[column.id] !== null && row[column.id] !== undefined ? row[column.id].toString() : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box position="relative">
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
        <Typography variant="h6">Loading comparison data...</Typography>
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
          <Typography color="text.primary" sx={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
            <CompareArrowsIcon fontSize="small" sx={{ mr: 0.5 }} />
            Review Changes
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CompareArrowsIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            Review Changes
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Chip 
              icon={<DescriptionIcon />}
              label={`Process: ${process}`} 
              color="primary" 
              sx={{ 
                fontWeight: 500,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}
            />
            <Chip 
              icon={<TimelineIcon />}
              label={`Layer: ${layer}`} 
              color="secondary" 
              sx={{ 
                fontWeight: 500,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.secondary.main,
                bgcolor: alpha(theme.palette.secondary.main, 0.1)
              }}
            />
          </Stack>
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary">
          Compare your modifications with the original data before submitting changes
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

      {comparisonData.changes && comparisonData.changes.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: 'primary.main'
            }
          }}
          icon={<WarningIcon />}
          variant="outlined"
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>No Changes Detected</Typography>
          <Typography variant="body2">
            No changes have been made to the data. Return to the editor to make modifications.
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<EditIcon />} 
            onClick={handleBackToEditor}
            sx={{ mt: 1.5 }}
          >
            Back to Editor
          </Button>
        </Alert>
      ) : (
        <>
          <Card 
            elevation={0} 
            sx={{ 
              mb: 4, 
              borderRadius: 3, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Paper 
              elevation={0} 
              sx={{
                borderRadius: 0,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 56,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    px: 3
                  },
                  '& .Mui-selected': {
                    color: 'primary.main'
                  }
                }}
              >
                <Tab 
                  label="Changes Summary" 
                  icon={<EditIcon />} 
                  iconPosition="start" 
                />
                <Tab 
                  label="Side-by-Side View" 
                  icon={<CompareArrowsIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Full Data Comparison" 
                  icon={<VisibilityIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {activeTab === 0 && renderChangesSummary()}
              {activeTab === 1 && renderSideBySideComparison()}
              {activeTab === 2 && renderFullDataComparison()}
            </Box>
          </Card>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToEditor}
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1
              }}
            >
              Back to Editor
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitChanges}
              disabled={comparisonData.changes.length === 0}
              endIcon={<ArrowForwardIcon />}
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1
              }}
            >
              Continue to Submit
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReviewChanges;
