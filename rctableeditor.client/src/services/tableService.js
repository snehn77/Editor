import api from './api';

export const tableService = {
  // Filter-related endpoints
  getFilters: async () => {
    const response = await api.get('/filters');
    return response.data;
  },
  
  getProcesses: async () => {
    const response = await api.get('/filters/process');
    return response.data;
  },
  
  getLayersByProcess: async (process) => {
    const response = await api.get(`/filters/layers/${process}`);
    return response.data;
  },
  
  getOperationsByProcessAndLayer: async (process, layer) => {
    const response = await api.get(`/filters/operations/${process}/${layer}`);
    return response.data;
  },

  // Table data endpoints
  queryTableData: async (process, layers, operations) => {
    // Make sure to handle arrays properly
    const response = await api.post('/TableData/query', {
      Process: process,
      Layers: layers, // Send all layers as an array
      Operations: operations // Send all operations as an array
    });
    return response.data;
  },
  
  importTableData: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/tabledata/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  getTableData: async (batchId) => {
    const response = await api.get(`/tabledata/${batchId}`);
    return response.data;
  },
  
  exportTableData: async (batchId) => {
    try {
      // Use fetch with proper binary response handling
      const response = await fetch(`/api/TableData/export/${batchId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header if present
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `TableData_${batchId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error exporting Excel file:', error);
      throw error;
    }
  },
  
  // Draft changes endpoints
  getDraftChanges: async (batchId) => {
    const response = await api.get(`/drafts/${batchId}`);
    return response.data;
  },
  
  saveDraftChanges: async (batchId, changes) => {
    const response = await api.post(`/drafts/${batchId}`, changes);
    return response.data;
  },
  
  discardDraftChanges: async (batchId) => {
    const response = await api.delete(`/drafts/${batchId}`);
    return response.data;
  },
  
  // Review endpoints
  getComparisonData: async (batchId) => {
    const response = await api.get(`/review/${batchId}`);
    return response.data;
  },
  
  // Submit endpoints
  submitChanges: async (batchId, username, notes) => {
    const response = await api.post(`/submit/${batchId}`, {
      batchId,
      username,
      notes
    });
    return response.data;
  },
  
  getSubmissionStatus: async (changeId) => {
    const response = await api.get(`/submit/${changeId}/status`);
    return response.data;
  },
  
  // History endpoints
  getChangeHistory: async (filters = {}) => {
    const response = await api.get('/history', { params: filters });
    return response.data;
  },
  
  getChangeDetail: async (changeId) => {
    const response = await api.get(`/history/${changeId}`);
    return response.data;
  },
  
  downloadExcel: async (changeId) => {
    const response = await api.get(`/history/${changeId}/excel`);
    if (response.data && response.data.downloadUrl) {
      window.open(response.data.downloadUrl, '_blank');
    }
    return response.data;
  }
};

export default tableService;
