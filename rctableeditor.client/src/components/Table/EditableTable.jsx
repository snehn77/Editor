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
    { id: 'lastModified', label: 'Last Modified', minWidth: 150 }
  ], []);

  // Format cell values
  const format = (value) => {
    return value !== null && value !== undefined ? value.toString() : '';
  };

  // Check if a row has been modified
  const isRowModified = (row) => {
    if (!changes || changes.length === 0) return false;
    
    return changes.some(change => 
      change.changeType === 'Edit' && 
      change.sessionDataId === row.sessionDataId
    );
  };

  // Check if a row is new (added in this session)
  const isRowAdded = (row) => {
    if (!changes || changes.length === 0) return false;
    
    return changes.some(change => 
      change.changeType === 'Add' && 
      change.newData?.sessionDataId === row.sessionDataId
    );
  };

  // Check if a row has been marked for deletion
  const isRowDeleted = (row) => {
    if (!changes || changes.length === 0) return false;
    
    return changes.some(change => 
      change.changeType === 'Remove' && 
      change.sessionDataId === row.sessionDataId
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
      sessionDataId: uuidv4(), // Generate a new unique ID
      process: '',
      layer: '',
      defectType: '',
      operationList: '',
      classType: '',
      product: '',
      entityConfidence: '',
      comments: '',
      genericData1: '',
      genericData2: '',
      genericData3: '',
      ediAttribution: '',
      ediAttributionList: '',
      securityCode: '',
      lastModified: new Date().toISOString(),
      lastModifiedBy: 'Current User' // This should be the current user
    };
    
    // Add to changes
    const newChange = {
      changeType: 'Add',
      newData: newRow,
      originalData: null // No original data for a new row
    };
    
    onSaveChanges([...changes, newChange]);
  };

  // Delete row handler
  const handleDeleteRow = (row) => {
    setRowToDelete(row);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    // Add to changes
    const newChange = {
      changeType: 'Remove',
      sessionDataId: rowToDelete.sessionDataId,
      originalData: rowToDelete
    };
    
    onSaveChanges([...changes, newChange]);
    setDeleteConfirmOpen(false);
    setRowToDelete(null);
  };

  // Save edited row handler
  const handleSaveEdit = () => {
    // If it's a newly added row that's being edited, update the 'Add' change instead of creating an 'Edit' change
    const isNewlyAdded = changes.some(change => 
      change.changeType === 'Add' && 
      change.newData?.sessionDataId === currentRow.sessionDataId
    );
    
    if (isNewlyAdded) {
      const updatedChanges = changes.map(change => {
        if (change.changeType === 'Add' && change.newData?.sessionDataId === currentRow.sessionDataId) {
          return {
            ...change,
            newData: {
              ...editedRow,
              lastModified: new Date().toISOString(),
              lastModifiedBy: 'Current User' // This should be the current user
            }
          };
        }
        return change;
      });
      
      onSaveChanges(updatedChanges);
    } else {
      // Regular edit for existing row
      const newChange = {
        changeType: 'Edit',
        sessionDataId: currentRow.sessionDataId,
        originalData: currentRow,
        newData: {
          ...editedRow,
          lastModified: new Date().toISOString(),
          lastModifiedBy: 'Current User' // This should be the current user
        }
      };
      
      onSaveChanges([...changes, newChange]);
    }
    
    setEditDialogOpen(false);
    setCurrentRow(null);
    setEditedRow({});
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
    // Only allow editing if not in readonly mode and not a deleted row
    if (readonly || isRowDeleted(row)) {
      return;
    }
    
    // Don't allow editing of lastModified or lastModifiedBy fields
    if (columnId === 'lastModified' || columnId === 'lastModifiedBy') {
      return;
    }
    
    // Check if this is a double-click or just a click
    if (inlineEditCell) {
      // Already editing, ignore
      return;
    }
    
    setInlineEditCell({
      rowId: row.sessionDataId,
      columnId
    });
    
    setInlineEditValue(value !== null && value !== undefined ? value.toString() : '');
    
    // Ref will be set after render, need to focus in useEffect
    setTimeout(() => {
      if (cellInputRef.current) {
        cellInputRef.current.focus();
      }
    }, 50);
  };

  // Handle inline editing save
  const handleInlineEditSave = () => {
    if (!inlineEditCell) return;
    
    const { rowId, columnId } = inlineEditCell;
    const row = rows.find(r => r.sessionDataId === rowId);
    
    if (!row) {
      setInlineEditCell(null);
      setInlineEditValue('');
      return;
    }
    
    // If the value hasn't changed, don't create a change record
    if (row[columnId] === inlineEditValue) {
      setInlineEditCell(null);
      setInlineEditValue('');
      return;
    }
    
    // Update the row with new value
    const updatedRow = {
      ...row,
      [columnId]: inlineEditValue,
      lastModified: new Date().toISOString(),
      lastModifiedBy: 'Current User' // This should be the current user
    };
    
    // Add to changes as an edit
    handleEditRow(row); // Open the edit dialog with the current row
    handleEditFieldChange(columnId, inlineEditValue); // Update the edited field
    setEditDialogOpen(false); // Close the dialog
    
    // Update changes
    const newChange = {
      changeType: 'Edit',
      sessionDataId: rowId,
      originalData: row,
      newData: updatedRow
    };
    
    onSaveChanges([...changes, newChange]);
    
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
      // First save draft changes
      console.log('Saving draft changes and exporting');
      console.log('Batch ID:', batchId);
      console.log('Changes:', changes);
      
      // If there are changes, save them first
      if (changes.length > 0) {
        try {
          await tableService.saveDraftChanges(batchId, changes);
          console.log('Draft changes saved successfully');
        } catch (saveError) {
          console.error('Error saving draft changes:', saveError);
          console.log('Error details:', saveError.response?.data);
          
          // Display detailed error but continue with export attempt
          alert(`Warning: There was an issue saving your changes: ${saveError.message}\n\nAttempting to export anyway.`);
        }
      }
      
      // Then export the data
      const response = await tableService.exportTableData(batchId);
      console.log('Export response received');
      
      // Create a download link for the Excel file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `table_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Navigate back to dashboard after successful export
      // navigate('/');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      // Could show an error message to the user here
      alert('Failed to export data: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        {!readonly && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
          >
            Add Row
          </Button>
        )}
        {!readonly && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleSaveDraft}
          >
            Save & Export to Excel
          </Button>
        )}
        
        {!readonly && (
          <Button
            variant="outlined"
            color="primary"
            onClick={onReviewChanges}
          >
            Review Changes
            {changes.length > 0 && (
              <Chip 
                size="small" 
                label={changes.length} 
                color="primary" 
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
              />
            )}
          </Button>
        )}
      </Box>
      
      {/* Table Container with proper overflow handling */}
      <Box sx={{ 
        width: '100%', 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          height: '8px',
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        },
      }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxHeight: 600, 
            width: '100%',
            boxShadow: 'none', 
            border: '1px solid rgba(224, 224, 224, 1)',
            borderRadius: 1
          }}
        >
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {!readonly && (
                  <TableCell 
                    sx={{ 
                      minWidth: 100, 
                      position: 'sticky', 
                      left: 0, 
                      zIndex: 3,
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    Actions
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ 
                      minWidth: column.minWidth,
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  // check if row is marked for deletion - to apply style
                  const isDeleted = isRowDeleted(row);
                  const isAdded = isRowAdded(row);
                  const isModified = isRowModified(row);
                  
                  return (
                    <TableRow 
                      hover 
                      role="checkbox" 
                      tabIndex={-1} 
                      key={row.sessionDataId}
                      sx={{ 
                        opacity: isDeleted ? 0.5 : 1,
                        bgcolor: isAdded ? 'rgba(46, 125, 50, 0.08)' : 
                                isModified ? 'rgba(255, 193, 7, 0.08)' : 'inherit',
                        textDecoration: isDeleted ? 'line-through' : 'none'
                      }}
                    >
                      {!readonly && (
                        <TableCell 
                          align="center"
                          sx={{ 
                            position: 'sticky', 
                            left: 0, 
                            zIndex: 2,
                            backgroundColor: isAdded ? 'rgba(46, 125, 50, 0.08)' : 
                                      isModified ? 'rgba(255, 193, 7, 0.08)' : 'white',
                            opacity: isDeleted ? 0.5 : 1
                          }}
                        >
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
                              ${isDeleted ? 'deleted-cell' : ''}
                              ${isEditing ? 'editing' : ''}
                              ${column.id !== 'lastModified' && column.id !== 'lastModifiedBy' && !readonly && !isDeleted ? 'editable-cell' : ''}
                            `}
                            sx={{ 
                              padding: isEditing ? '0' : '6px 16px',
                              position: 'relative',
                              '&.editable-cell:hover::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderStyle: 'solid',
                                borderWidth: '0 4px 4px 4px',
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
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  autoFocus
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          onClick={handleInlineEditSave}
                                        >
                                          <CheckIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          onClick={handleInlineEditCancel}
                                        >
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
                            ) : (
                              <>
                                {value !== null && value !== undefined ? format(value) : '—'}
                              </>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Bottom Action Buttons */}
      {!readonly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={onDiscardChanges}
          >
            Discard Changes
          </Button>
        </Box>
      )}
      
      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentRow && isRowAdded(currentRow) ? 'Edit New Row' : 'Edit Row'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, pt: 1 }}>
            <TextField
              label="Process"
              value={editedRow.process || ''}
              onChange={(e) => handleEditFieldChange('process', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Layer"
              value={editedRow.layer || ''}
              onChange={(e) => handleEditFieldChange('layer', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Defect Type"
              value={editedRow.defectType || ''}
              onChange={(e) => handleEditFieldChange('defectType', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Operation List"
              value={editedRow.operationList || ''}
              onChange={(e) => handleEditFieldChange('operationList', e.target.value)}
              fullWidth
              margin="normal"
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
