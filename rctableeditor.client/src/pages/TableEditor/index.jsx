import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Alert,
    Snackbar,
    Breadcrumbs,
    Link,
    Chip,
    Button,
    Divider,
    IconButton,
    CardContent,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Backdrop,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateIcon from '@mui/icons-material/Create';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RestoreIcon from '@mui/icons-material/Restore';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LayersIcon from '@mui/icons-material/Layers';
import DomainIcon from '@mui/icons-material/Domain';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import EditableTable from '../../components/Table/EditableTable';
import { useBatch } from '../../context/BatchContext';
import tableService from '../../services/tableService';
import {
    PageContainer,
    HeaderContainer,
    TitleContainer,
    HeaderActionsContainer,
    ChipsStack,
    ActionPanel,
    ActionPanelContainer,
    ChangesIndicator,
    ChangesBadge,
    ChangesChipsContainer,
    ActionButtonsContainer,
    TableCard,
    MenuPaper,
    DialogPaper,
    DialogTitleContainer,
    DialogActionsContainer
} from './styles';
import { Box } from '@mui/material';

const TableEditor = () => {
    const navigate = useNavigate();
    const { batchId, process, layer, source, isActive, updateChangesFlag } = useBatch();

    const [tableData, setTableData] = useState([]);
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        confirmAction: null
    });

    // Redirect if no active batch
    useEffect(() => {
        if (!isActive || !batchId) {
            navigate('/');
        }
    }, [isActive, batchId, navigate]);

    // Load table data
    useEffect(() => {
        const fetchData = async () => {
            if (!batchId) return;

            try {
                setLoading(true);

                // Get table data
                const data = await tableService.getTableData(batchId);
                setTableData(data);

                // Get any saved draft changes
                const savedChanges = await tableService.getDraftChanges(batchId);
                setChanges(savedChanges);

                // Update batch context with changes flag
                updateChangesFlag(savedChanges.length > 0);
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Failed to load table data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId, updateChangesFlag]);

    // Handle saving changes
    const handleSaveChanges = async (newChanges) => {
        try {
            setLoading(true);

            // Combine existing changes with new changes
            const updatedChanges = [...changes];

            newChanges.forEach(newChange => {
                // For edits and deletes, remove any existing changes for the same row
                if (newChange.sessionDataId) {
                    const index = updatedChanges.findIndex(
                        c => c.sessionDataId === newChange.sessionDataId
                    );

                    if (index >= 0) {
                        updatedChanges.splice(index, 1);
                    }
                }

                // Add the new change
                updatedChanges.push(newChange);
            });

            // Save changes to server
            await tableService.saveDraftChanges(batchId, updatedChanges);

            setChanges(updatedChanges);
            updateChangesFlag(updatedChanges.length > 0);

            setSnackbar({
                open: true,
                message: 'Changes saved successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error saving changes:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save changes',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle reviewing changes
    const handleReviewChanges = () => {
        navigate('/review');
    };

    // Handle snackbar close
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    // Handle export to Excel
    const handleExportExcel = async () => {
        try {
            setLoading(true);

            await tableService.exportToExcel(batchId);

            setSnackbar({
                open: true,
                message: 'Data exported to Excel successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setSnackbar({
                open: true,
                message: 'Failed to export data to Excel',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setConfirmDialog({ ...confirmDialog, open: false });
    };

    // Handle action menu
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Theme and responsive hooks
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Handle discarding changes
    const handleDiscardChanges = async () => {
        setConfirmDialog({
            open: true,
            title: 'Discard All Changes',
            message: 'Are you sure you want to discard all changes? This action cannot be undone.',
            confirmAction: async () => {
                try {
                    setLoading(true);

                    // Discard changes on server
                    await tableService.discardDraftChanges(batchId);

                    setChanges([]);
                    updateChangesFlag(false);

                    setSnackbar({
                        open: true,
                        message: 'All changes discarded',
                        severity: 'info'
                    });
                } catch (error) {
                    console.error('Error discarding changes:', error);
                    setSnackbar({
                        open: true,
                        message: 'Failed to discard changes',
                        severity: 'error'
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // Calculate changes summary
    const getChangesSummary = () => {
        const added = changes.filter(c => c.changeType === 'Add').length;
        const edited = changes.filter(c => c.changeType === 'Edit').length;
        const deleted = changes.filter(c => c.changeType === 'Delete').length;
        return { added, edited, deleted, total: changes.length };
    };

    const changesSummary = getChangesSummary();

    // Return the component JSX
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
                <Typography variant="h6">Processing data...</Typography>
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
                        Table Editor
                    </Typography>
                </Breadcrumbs>

                <HeaderActionsContainer>
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <EditIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                            Table Editor
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Edit data for {process} - {layer}
                        </Typography>
                    </Box>

                    <ChipsStack direction="row" spacing={1}>
                        <Chip
                            icon={<DomainIcon />}
                            label={process}
                            color="primary"
                            sx={{ fontWeight: 500 }}
                        />
                        <Chip
                            icon={<LayersIcon />}
                            label={layer}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                        {source && (
                            <Chip
                                icon={<FilterAltIcon />}
                                label={source}
                                color="secondary"
                                sx={{ fontWeight: 500 }}
                            />
                        )}
                    </ChipsStack>
                </HeaderActionsContainer>
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

            {/* Action Panel */}
            <ActionPanel hasChanges={changes.length > 0}>
                <ActionPanelContainer>
                    <ChangesIndicator>
                        <ChangesBadge
                            badgeContent={changesSummary.total}
                            color="primary"
                            sx={{ mr: 2 }}
                        >
                            <Typography variant="subtitle1" fontWeight={600}>
                                Changes
                            </Typography>
                        </ChangesBadge>

                        {changesSummary.total > 0 && (
                            <ChangesChipsContainer>
                                {changesSummary.added > 0 && (
                                    <Chip
                                        size="small"
                                        icon={<AddIcon />}
                                        label={`${changesSummary.added} Added`}
                                        color="success"
                                        variant="outlined"
                                    />
                                )}
                                {changesSummary.edited > 0 && (
                                    <Chip
                                        size="small"
                                        icon={<EditIcon />}
                                        label={`${changesSummary.edited} Edited`}
                                        color="warning"
                                        variant="outlined"
                                    />
                                )}
                                {changesSummary.deleted > 0 && (
                                    <Chip
                                        size="small"
                                        icon={<DeleteIcon />}
                                        label={`${changesSummary.deleted} Deleted`}
                                        color="error"
                                        variant="outlined"
                                    />
                                )}
                            </ChangesChipsContainer>
                        )}
                    </ChangesIndicator>

                    <ActionButtonsContainer
                        direction="row"
                        spacing={1}
                    >
                        <Button
                            size="small"
                            startIcon={<SaveIcon />}
                            variant="outlined"
                            color="primary"
                            disabled={changes.length === 0}
                            onClick={() => {
                                setSnackbar({
                                    open: true,
                                    message: 'Changes are automatically saved',
                                    severity: 'info'
                                });
                            }}
                        >
                            Saved
                        </Button>

                        <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                            color="secondary"
                            disabled={changes.length === 0}
                            onClick={handleReviewChanges}
                        >
                            Review Changes
                        </Button>

                        <Button
                            size="small"
                            startIcon={<UndoIcon />}
                            variant="outlined"
                            color="error"
                            disabled={changes.length === 0}
                            onClick={handleDiscardChanges}
                        >
                            Discard
                        </Button>

                        <IconButton
                            id="table-menu-button"
                            aria-controls={openMenu ? 'table-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={openMenu ? 'true' : undefined}
                            onClick={handleMenuOpen}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </ActionButtonsContainer>
                </ActionPanelContainer>
            </ActionPanel>

            {/* Table with data */}
            <TableCard>
                <EditableTable
                    data={tableData}
                    onSaveChanges={handleSaveChanges}
                    onDiscardChanges={handleDiscardChanges}
                    onReviewChanges={handleReviewChanges}
                    changes={changes}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'grey.50',
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0))'
                        },
                        '& .MuiDataGrid-cell.modified': {
                            bgcolor: 'rgba(25, 118, 210, 0.08)'
                        },
                        '& .MuiDataGrid-cell.deleted': {
                            bgcolor: 'rgba(211, 47, 47, 0.08)',
                            textDecoration: 'line-through'
                        },
                        '& .MuiDataGrid-row.added': {
                            bgcolor: 'rgba(46, 125, 50, 0.08)'
                        }
                    }}
                />
            </TableCard>

            {/* Dropdown Menu */}
            <Menu
                id="table-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                MenuListProps={{
                    'aria-labelledby': 'table-menu-button',
                }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        borderRadius: 2,
                        minWidth: 200,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }
                }}
            >
                <MenuItem onClick={() => {
                    handleExportExcel();
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <FileDownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export to Excel</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => {
                    navigate('/');
                    handleMenuClose();
                }}>
                    <ListItemIcon>
                        <CloseIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Exit Editor</ListItemText>
                </MenuItem>
            </Menu>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        boxShadow: 3
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 600
                }}>
                    <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            confirmDialog.confirmAction();
                            handleCloseDialog();
                        }}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Discard Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default TableEditor;