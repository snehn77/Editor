import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import tableService from '../../services/tableService';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Chip,
  ClickAwayListener,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

const EditableTable = ({
  data,
  onSaveChanges,
  onDiscardChanges,
  onReviewChanges,
  changes = [], // Array of changes made to the table
  readonly = false,
  batchId // For exporting data as Excel
}) => {
  const navigate = useNavigate(); // For navigation after Excel export
  const [rows, setRows] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  // For inline editing
  const [inlineEditCell, setInlineEditCell] = useState(null); // {rowId, columnId}
  const [inlineEditValue, setInlineEditValue] = useState('');
  const cellInputRef = useRef(null);
  
  // For tracking whether a selection has occurred to distinguish between click and double-click
  const [cellSelection, setCellSelection] = useState(null);

  // Initialize rows from data
  useEffect(() => {
    if (data) {
      // Apply any existing changes to the data
      let updatedData = [...data];
      
      // Apply changes
      if (changes && changes.length > 0) {
        changes.forEach(change => {
          switch (change.changeType) {
            case 'Add':
              if (change.newData) {
                updatedData.push(change.newData);
              }
              break;
            case 'Edit':
              if (change.sessionDataId && change.newData) {
                const index = updatedData.findIndex(row => row.sessionDataId === change.sessionDataId);
                if (index >= 0) {
                  updatedData[index] = change.newData;
                }
              }
              break;
            case 'Remove':
              if (change.sessionDataId) {
                updatedData = updatedData.filter(row => row.sessionDataId !== change.sessionDataId);
              }
              break;
            default:
              break;
          }
        });
      }
      
      setRows(updatedData);
    }
  }, [data, changes]);

  // Column definitions
  const columns = useMemo(() => [
    { id: 'process', label: 'Process', minWidth: 100 },
    { id: 'layer', label: 'Layer', minWidth: 100 },
    { id: 'defectType', label: 'Defect Type', minWidth: 120 },
    { id: 'operationList', label: 'Operation List', minWidth: 150 },
    { id: 'classType', label: 'Class Type', minWidth: 100 },
    { id: 'product', label: 'Product', minWidth: 100 },
    { id: 'entityConfidence', label: 'Entity Confidence', minWidth: 130 },
    { id: 'comments', label: 'Comments', minWidth: 200 },
    { id: 'genericData1', label: 'Generic Data 1', minWidth: 120 },
    { id: 'genericData2', label: 'Generic Data 2', minWidth: 120 },
    { id: 'genericData3', label: 'Generic Data 3', minWidth: 120 },
    { id: 'ediAttribution', label: 'EDI Attribution', minWidth: 120 },
    { id: 'ediAttributionList', label: 'EDI Attribution List', minWidth: 150 },
    { id: 'securityCode', label: 'Security Code', minWidth: 120 },
    { id: 'lastModified', label: 'Last Modified', minWidth: 150, format: (value) => value && new Date(value).toLocaleString() },
    { id: 'lastModifiedBy', label: 'Last Modified By', minWidth: 150 },
  ], []);

  // Check if a row has been modified
  const isRowModified = (row) => {
    return changes.some(
      change => 
        (change.changeType === 'Edit' && change.sessionDataId === row.sessionDataId) ||
        (change.changeType === 'Remove' && change.sessionDataId === row.sessionDataId) ||
        (change.changeType === 'Add' && change.newData && change.newData.sessionDataId === row.sessionDataId)
    );
  };

  // Check if a row is new (added in this session)
  const isRowAdded = (row) => {
    return changes.some(
      change => change.changeType === 'Add' && change.newData && change.newData.sessionDataId === row.sessionDataId
    );
  };

  // Check if a row has been marked for deletion
  const isRowDeleted = (row) => {
    return changes.some(
      change => change.changeType === 'Remove' && change.sessionDataId === row.sessionDataId
    );
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Edit row handler
  const handleEditRow = (row) => {
    setCurrentRow(row);
    setEditedRow({ ...row });
    setEditDialogOpen(true);
  };

  // Add new row handler
  const handleAddRow = () => {
    const newRow = {
      sessionDataId: `temp-${uuidv4()}`, // Temporary ID for new row
      batchId: data && data.length > 0 ? data[0].batchId : '',
      process: data && data.length > 0 ? data[0].process : '',
      layer: data && data.length > 0 ? data[0].layer : '',
      defectType: '',
      operationList: data && data.length > 0 ? data[0].operationList : '',
      classType: '',
      product: '',
      entityConfidence: null,
      comments: '',
      genericData1: '',
      genericData2: '',
      genericData3: '',
      ediAttribution: '',
      ediAttributionList: '',
      securityCode: null,
      originalId: null,
      lastModified: new Date().toISOString(),
      lastModifiedBy: 'Current User', // This would be replaced with the actual user
    };
    
    setCurrentRow(null);
    setEditedRow(newRow);
    setEditDialogOpen(true);
  };

  // Delete row handler
  const handleDeleteRow = (row) => {
    setRowToDelete(row);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    const change = {
      changeType: 'Remove',
      sessionDataId: rowToDelete.sessionDataId,
      originalData: rowToDelete,
      timestamp: new Date().toISOString()
    };
    
    onSaveChanges([change]);
    setDeleteConfirmOpen(false);
  };

  // Save edited row handler
  const handleSaveEdit = () => {
    let change;
    
    if (currentRow) {
      // Editing existing row
      const modifiedFields = [];
      
      // Determine which fields have been modified
      Object.keys(editedRow).forEach(key => {
        if (JSON.stringify(editedRow[key]) !== JSON.stringify(currentRow[key])) {
          modifiedFields.push(key);
        }
      });
      
      if (modifiedFields.length > 0) {
        change = {
          changeType: 'Edit',
          sessionDataId: currentRow.sessionDataId,
          originalData: currentRow,
          newData: editedRow,
          modifiedFields: modifiedFields,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // Adding new row
      change = {
        changeType: 'Add',
        newData: editedRow,
        timestamp: new Date().toISOString()
      };
    }
    
    if (change) {
      onSaveChanges([change]);
    }
    
    setEditDialogOpen(false);
  };

  // Edit dialog field change handler
  const handleEditFieldChange = (field, value) => {
    setEditedRow(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle cell click for inline editing
  const handleCellClick = (row, columnId, value) => {
    // Don't allow editing of these meta fields
    if (columnId === 'lastModified' || columnId === 'lastModifiedBy' || readonly) {
      return;
    }
    
    // Don't allow editing deleted rows
    if (isRowDeleted(row)) {
      return;
    }
    
    // Initialize cell editing
    setInlineEditCell({ rowId: row.sessionDataId, columnId });
    setInlineEditValue(value !== undefined && value !== null ? value.toString() : '');
    
    // Focus the input field after a small delay to ensure it's rendered
    setTimeout(() => {
      if (cellInputRef.current) {
        cellInputRef.current.focus();
      }
    }, 50);
  };

  // Handle inline editing save
  const handleInlineEditSave = () => {
    if (!inlineEditCell) return;
    
    // Find the row being edited
    const rowIndex = rows.findIndex(r => r.sessionDataId === inlineEditCell.rowId);
    if (rowIndex === -1) return;
    
    const row = rows[rowIndex];
    
    // Create a copy of the row with the updated field
    const updatedRow = { ...row };
    updatedRow[inlineEditCell.columnId] = inlineEditValue;
    
    // Save changes
    onSaveChanges([{
      changeType: 'Edit',
      sessionDataId: row.sessionDataId,
      originalData: row,
      newData: updatedRow
    }]);
    
    // Clear inline editing state
    setInlineEditCell(null);
    setInlineEditValue('');
  };

  // Handle cancel inline editing
  const handleInlineEditCancel = () => {
    setInlineEditCell(null);
    setInlineEditValue('');
  };
  
  // Handle save to Excel and navigate to dashboard
  const handleSaveDraft = async () => {
    try {
      // First save any pending changes
      if (inlineEditCell) {
        await handleInlineEditSave();
      }
      
      // Save any draft changes first (if needed)
      if (changes.length > 0 && onSaveChanges) {
        await onSaveChanges(changes);
      }
      
      // Export data to Excel
      if (batchId) {
        console.log('Exporting data for batch:', batchId);
        
        // Show loading or notification here if needed
        
        // Export to Excel using the table service
        const result = await tableService.exportTableData(batchId);
        
        if (result) {
          console.log('Excel export successful');
          
          // Navigate back to dashboard after a brief delay to ensure download starts
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } else {
        console.error('No batch ID provided for export');
        // Could show an error message to the user here
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      // Could show an error message to the user here
      alert('Failed to export data: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2 }}>
        <TableContainer 
          sx={{ 
            maxHeight: 500,
            '& .MuiTableHead-root': {
              position: 'sticky',
              top: 0,
              zIndex: 2
            },
            '& .MuiTableCell-stickyHeader': {
              backgroundColor: '#f5f5f5',
              boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)'
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {!readonly && (
                  <TableCell
                    key="actions"
                    align="center"
                    style={{ minWidth: 100 }}
                  >
                    Actions
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align="left"
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isModified = isRowModified(row);
                  const isAdded = isRowAdded(row);
                  const isDeleted = isRowDeleted(row);
                  
                  // Skip deleted rows in view mode
                  if (readonly && isDeleted) {
                    return null;
                  }
                  
                  return (
                    <TableRow 
                      hover 
                      role="checkbox" 
                      tabIndex={-1} 
                      key={row.sessionDataId || index}
                      sx={{
                        backgroundColor: isDeleted 
                          ? 'rgba(244, 67, 54, 0.1)' 
                          : isAdded 
                          ? 'rgba(76, 175, 80, 0.1)' 
                          : isModified 
                          ? 'rgba(255, 152, 0, 0.1)' 
                          : 'inherit'
                      }}
                    >
                      {!readonly && (
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditRow(row)}
                            disabled={isDeleted}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteRow(row)}
                            disabled={isDeleted}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = row[column.id];
                        const isEditing = inlineEditCell && 
                          inlineEditCell.rowId === row.sessionDataId && 
                          inlineEditCell.columnId === column.id;
                          
                        return (
                          <TableCell 
                            key={column.id} 
                            align="left"
                            onClick={() => handleCellClick(row, column.id, value)}
                            className={`
                              ${isDeleted ? 'deleted' : ''} 
                              ${isModified && column.id !== 'lastModified' && column.id !== 'lastModifiedBy' ? 'modified' : ''}
                              ${isEditing ? 'editing' : ''}
                              ${column.id !== 'lastModified' && column.id !== 'lastModifiedBy' && !readonly && !isDeleted ? 'editable-cell' : ''}
                            `}
                            sx={{ 
                              padding: isEditing ? '0' : '6px 16px',
                              position: 'relative',
                              '&.editable-cell:hover::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                borderWidth: '0 0 8px 8px',
                                borderColor: 'transparent transparent rgba(25, 118, 210, 0.5) transparent',
                                pointerEvents: 'none'
                              }
                            }}
                          >
                            {isEditing ? (
                              <ClickAwayListener onClickAway={handleInlineEditSave}>
                                <TextField
                                  inputRef={cellInputRef}
                                  value={inlineEditValue}
                                  onChange={(e) => setInlineEditValue(e.target.value)}
                                  fullWidth
                                  variant="standard"
                                  size="small"
                                  autoFocus
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleInlineEditSave}>
                                          <CheckIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={handleInlineEditCancel}>
                                          <CloseIcon fontSize="small" />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleInlineEditSave();
                                    } else if (e.key === 'Escape') {
                                      handleInlineEditCancel();
                                    }
                                  }}
                                  sx={{ m: 0 }}
                                />
                              </ClickAwayListener>
                            ) : (column.format && value !== null && value !== undefined
                               ? column.format(value)
                               : value === null || value === undefined
                               ? ''
                               : value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {!readonly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={onDiscardChanges}
          >
            Discard Changes
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSaveChanges([])}
          >
            Save Draft
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleSaveDraft}
          >
            Save & Export to Excel
          </Button>
        </Box>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentRow ? 'Edit Row' : 'Add New Row'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              label="Process"
              value={editedRow.process || ''}
              onChange={(e) => handleEditFieldChange('process', e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Layer"
              value={editedRow.layer || ''}
              onChange={(e) => handleEditFieldChange('layer', e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Defect Type"
              value={editedRow.defectType || ''}
              onChange={(e) => handleEditFieldChange('defectType', e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Operation List"
              value={editedRow.operationList || ''}
              onChange={(e) => handleEditFieldChange('operationList', e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Class Type"
              value={editedRow.classType || ''}
              onChange={(e) => handleEditFieldChange('classType', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Product"
              value={editedRow.product || ''}
              onChange={(e) => handleEditFieldChange('product', e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="entity-confidence-label">Entity Confidence</InputLabel>
              <Select
                labelId="entity-confidence-label"
                value={editedRow.entityConfidence || ''}
                onChange={(e) => handleEditFieldChange('entityConfidence', e.target.value)}
                label="Entity Confidence"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {[1, 2, 3, 4, 5].map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Comments"
              value={editedRow.comments || ''}
              onChange={(e) => handleEditFieldChange('comments', e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              label="Generic Data 1"
              value={editedRow.genericData1 || ''}
              onChange={(e) => handleEditFieldChange('genericData1', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Generic Data 2"
              value={editedRow.genericData2 || ''}
              onChange={(e) => handleEditFieldChange('genericData2', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Generic Data 3"
              value={editedRow.genericData3 || ''}
              onChange={(e) => handleEditFieldChange('genericData3', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="EDI Attribution"
              value={editedRow.ediAttribution || ''}
              onChange={(e) => handleEditFieldChange('ediAttribution', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="EDI Attribution List"
              value={editedRow.ediAttributionList || ''}
              onChange={(e) => handleEditFieldChange('ediAttributionList', e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="security-code-label">Security Code</InputLabel>
              <Select
                labelId="security-code-label"
                value={editedRow.securityCode || ''}
                onChange={(e) => handleEditFieldChange('securityCode', e.target.value)}
                label="Security Code"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {[1, 2, 3].map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this row? This action can be undone by discarding changes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditableTable;
