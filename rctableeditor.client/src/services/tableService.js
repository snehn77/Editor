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
  queryTableData: async (process, layer, operation) => {
    const response = await api.post('/tabledata/query', {
      process,
      layer,
      operation
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
    // This will download the file directly
    window.open(`/api/tabledata/export/${batchId}`, '_blank');
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
