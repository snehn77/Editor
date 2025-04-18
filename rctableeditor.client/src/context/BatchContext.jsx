import { createContext, useContext, useState } from 'react';

// Create the context
const BatchContext = createContext();

// Create a custom hook to use the batch context
export const useBatch = () => {
  const context = useContext(BatchContext);
  if (!context) {
    throw new Error('useBatch must be used within a BatchProvider');
  }
  return context;
};

// Create the provider component
export const BatchProvider = ({ children }) => {
  const [batchId, setBatchId] = useState('');
  const [process, setProcess] = useState('');
  const [layer, setLayer] = useState('');
  const [operation, setOperation] = useState('');
  const [source, setSource] = useState(''); // 'ExternalDB' or 'Excel'
  const [fileName, setFileName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Function to set batch data
  const setActiveBatch = (data) => {
    setBatchId(data.batchId || '');
    setProcess(data.process || '');
    setLayer(data.layer || '');
    setOperation(data.operation || '');
    setSource(data.source || '');
    setFileName(data.fileName || '');
    setIsActive(true);
    setHasChanges(false);
  };

  // Function to clear batch data
  const clearActiveBatch = () => {
    setBatchId('');
    setProcess('');
    setLayer('');
    setOperation('');
    setSource('');
    setFileName('');
    setIsActive(false);
    setHasChanges(false);
  };

  // Function to update changes flag
  const updateChangesFlag = (hasChanges) => {
    setHasChanges(hasChanges);
  };

  // Value object to be provided to consumers
  const value = {
    batchId,
    process,
    layer,
    operation,
    source,
    fileName,
    isActive,
    hasChanges,
    setActiveBatch,
    clearActiveBatch,
    updateChangesFlag
  };

  return (
    <BatchContext.Provider value={value}>
      {children}
    </BatchContext.Provider>
  );
};

export default BatchContext;
