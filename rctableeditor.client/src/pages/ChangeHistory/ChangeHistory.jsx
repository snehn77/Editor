import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TablePagination,
  Chip,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  InputAdornment,
  Breadcrumbs,
  Link
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LoadingOverlay from '../../components/LoadingIndicator/LoadingOverlay';
import tableService from '../../services/tableService';

const ChangeHistory = () => {
  const navigate = useNavigate();
  
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    process: '',
    status: '',
    fromDate: '',
    toDate: ''
  });
  
  // Processes for filter dropdown
  const [processes, setProcesses] = useState([]);

  // Load history data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get history data
        const data = await tableService.getChangeHistory(filters);
        setHistoryData(data);
        
        // Extract unique processes for filter dropdown
        const uniqueProcesses = [...new Set(data.map(item => item.process))];
        setProcesses(uniqueProcesses);
      } catch (error) {
        console.error('Error loading history data:', error);
        setError('Failed to load history data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      process: '',
      status: '',
      fromDate: '',
      toDate: ''
    });
  };

  // Toggle filter display
  const handleToggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Handle view details
  const handleViewDetails = (changeId) => {
    navigate(`/history/${changeId}`);
  };

  // Handle download Excel
  const handleDownloadExcel = async (changeId) => {
    try {
      await tableService.downloadExcel(changeId);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setError('Failed to download Excel file. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
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

  return (
    <Box position="relative">
      {loading && <LoadingOverlay message="Loading history data..." />}
      
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link color="inherit" href="#" onClick={() => navigate('/')}>
          Dashboard
        </Link>
        <Typography color="text.primary">Change History</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Change History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleToggleFilters}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="process-filter-label">Process</InputLabel>
                <Select
                  labelId="process-filter-label"
                  value={filters.process}
                  onChange={(e) => handleFilterChange('process', e.target.value)}
                  label="Process"
                >
                  <MenuItem value="">
                    <em>All Processes</em>
                  </MenuItem>
                  {processes.map((process) => (
                    <MenuItem key={process} value={process}>
                      {process}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">
                    <em>All Statuses</em>
                  </MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="From Date"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="To Date"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              sx={{ mr: 1 }}
            >
              Reset Filters
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* History Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="history table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Process</TableCell>
                <TableCell>Change Type</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approved By</TableCell>
                <TableCell>Approval Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.length > 0 ? (
                historyData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.changeId} hover>
                      <TableCell>{formatDate(row.timestamp)}</TableCell>
                      <TableCell>{row.process}</TableCell>
                      <TableCell>{row.changeType}</TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.approvalStatus} 
                          color={getStatusColor(row.approvalStatus)} 
                          size="small"
                          sx={{ minWidth: 80 }}
                        />
                      </TableCell>
                      <TableCell>{row.approvedBy || '-'}</TableCell>
                      <TableCell>
                        {row.approvalDate ? formatDate(row.approvalDate) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleViewDetails(row.changeId)}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {row.sharePointUrl && (
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleDownloadExcel(row.changeId)}
                            title="Download Excel"
                          >
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {loading ? 'Loading data...' : 'No history data found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={historyData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ChangeHistory;
