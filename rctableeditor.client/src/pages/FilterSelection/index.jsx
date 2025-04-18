import React, { useState } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Chip,
    FormHelperText,
    IconButton,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useBatch } from '../../context/BatchContext';
import { tableService } from '../../services/tableService';
import {
    FilterContainer,
    SectionHeader,
    ChipContainer,
    InputStack,
    ErrorBox,
    ActionContainer
} from './styles';

const FilterSelection = () => {
    const navigate = useNavigate();
    const { setActiveBatch } = useBatch();

    // State for form inputs
    const [process, setProcess] = useState('');
    const [layers, setLayers] = useState(['']);
    const [operations, setOperations] = useState(['']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Form validation state
    const [formErrors, setFormErrors] = useState({
        process: false,
        layers: false
    });

    // Process input handler
    const handleProcessChange = (event) => {
        setProcess(event.target.value);
        setFormErrors({
            ...formErrors,
            process: !event.target.value
        });
    };

    // Layers input handlers
    const handleLayerChange = (index, value) => {
        const newLayers = [...layers];
        newLayers[index] = value;
        setLayers(newLayers);
        setFormErrors({
            ...formErrors,
            layers: newLayers.filter(layer => layer.trim()).length === 0
        });
    };

    const addLayer = () => {
        setLayers([...layers, '']);
    };

    const removeLayer = (index) => {
        const newLayers = layers.filter((_, i) => i !== index);
        if (newLayers.length === 0) {
            newLayers.push(''); // Keep at least one empty input field
        }
        setLayers(newLayers);
        setFormErrors({
            ...formErrors,
            layers: newLayers.filter(layer => layer.trim()).length === 0
        });
    };

    // Operations input handlers
    const handleOperationChange = (index, value) => {
        const newOperations = [...operations];
        newOperations[index] = value;
        setOperations(newOperations);
    };

    const addOperation = () => {
        setOperations([...operations, '']);
    };

    const removeOperation = (index) => {
        const newOperations = operations.filter((_, i) => i !== index);
        if (newOperations.length === 0) {
            newOperations.push(''); // Keep at least one empty input field
        }
        setOperations(newOperations);
    };

    // Form validation
    const validateForm = () => {
        const errors = {
            process: !process.trim(),
            layers: layers.filter(layer => layer.trim()).length === 0
        };

        setFormErrors(errors);
        return !Object.values(errors).some(Boolean);
    };

    // Submit form and load data
    const handleLoadData = async () => {
        if (!validateForm()) {
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            // Get non-empty values
            const processValue = process.trim();
            const layerValues = layers.filter(l => l.trim());
            const operationValues = operations.filter(o => o.trim());
            
            // Call API to fetch table data
            const tableData = await tableService.queryTableData(
                processValue,
                // Send all layers as an array
                layerValues,
                // Send all operations as an array (can be empty)
                operationValues
            );
            
            // Extract data from the API response
            const batchId = tableData.batchId || Date.now().toString();
            const recordCount = tableData.recordCount || 0;
            
            // Get the actual table data from the response
            const actualTableData = tableData.tableData || [];
            
            console.log('Received data:', { batchId, recordCount, dataCount: actualTableData.length });
            
            // Create batch with the fetched data
            setActiveBatch({
                batchId: batchId,
                process: processValue,
                layer: layerValues,
                operation: operationValues,
                source: 'ManualInput',
                data: actualTableData, // Use the actual table data array
                recordCount: recordCount
            });
            
            // Navigate to editor with the data
            navigate('/editor');
        } catch (e) {
            console.error('Error fetching data:', e);
            setError('Failed to fetch data from server. Please check your inputs and try again.');
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Filter Selection
            </Typography>

            <Typography variant="body1" paragraph>
                Enter your process, layers, and operation suspects to load data for editing.
            </Typography>

            {error && (
                <ErrorBox>
                    {error}
                </ErrorBox>
            )}

            <FilterContainer elevation={3}>
                <Grid container spacing={4}>
                    {/* Process Input - Single text field */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="500" gutterBottom>Process</Typography>
                        <TextField
                            fullWidth
                            value={process}
                            onChange={handleProcessChange}
                            placeholder="Enter process name"
                            error={formErrors.process}
                            helperText={formErrors.process ? 'Process is required' : ''}
                            sx={{ mb: 1 }}
                        />
                    </Grid>

                    {/* Layers Input - Multiple text fields with add/remove */}
                    <Grid item xs={12}>
                        <SectionHeader>
                            <Typography variant="subtitle1" fontWeight="500">Layers</Typography>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addLayer}
                                size="small"
                            >
                                Add Layer
                            </Button>
                        </SectionHeader>

                        {formErrors.layers && (
                            <FormHelperText error sx={{ mt: -1, mb: 1 }}>At least one layer is required</FormHelperText>
                        )}

                        <InputStack spacing={2}>
                            {layers.map((layer, index) => (
                                <TextField
                                    key={index}
                                    fullWidth
                                    value={layer}
                                    onChange={(e) => handleLayerChange(index, e.target.value)}
                                    placeholder={`Layer ${index + 1}`}
                                    error={formErrors.layers && index === 0 && !layer.trim()}
                                    InputProps={{
                                        endAdornment: layers.length > 1 && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => removeLayer(index)} edge="end" size="small">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            ))}
                        </InputStack>

                        {/* Render layer chips for better visual feedback */}
                        <ChipContainer>
                            {layers.filter(layer => layer.trim()).map((layer, index) => (
                                <Chip
                                    key={index}
                                    label={layer}
                                    onDelete={() => removeLayer(index)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </ChipContainer>
                    </Grid>

                    {/* Operations Input - Multiple text fields with add/remove */}
                    <Grid item xs={12}>
                        <SectionHeader>
                            <Typography variant="subtitle1" fontWeight="500">Operation Suspect (Optional)</Typography>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addOperation}
                                size="small"
                            >
                                Add Operation
                            </Button>
                        </SectionHeader>

                        <InputStack spacing={2}>
                            {operations.map((operation, index) => (
                                <TextField
                                    key={index}
                                    fullWidth
                                    value={operation}
                                    onChange={(e) => handleOperationChange(index, e.target.value)}
                                    placeholder={`Operation ${index + 1}`}
                                    InputProps={{
                                        endAdornment: operations.length > 1 && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => removeOperation(index)} edge="end" size="small">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            ))}
                        </InputStack>

                        {/* Render operation chips for better visual feedback */}
                        <ChipContainer>
                            {operations.filter(op => op.trim()).map((operation, index) => (
                                <Chip
                                    key={index}
                                    label={operation}
                                    onDelete={() => removeOperation(index)}
                                    color="secondary"
                                    variant="outlined"
                                />
                            ))}
                        </ChipContainer>
                    </Grid>
                </Grid>

                <ActionContainer>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleLoadData}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                Loading...
                            </>
                        ) : 'Load Data'}
                    </Button>
                </ActionContainer>
            </FilterContainer>
        </Box>
    );
};

export default FilterSelection;