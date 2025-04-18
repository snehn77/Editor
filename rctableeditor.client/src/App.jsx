import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BatchProvider } from './context/BatchContext';
import theme from './styles/theme';
import MainLayout from './components/Layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import FilterSelection from './pages/FilterSelection';
import ImportSession from './pages/ImportSession';
import TableEditor from './pages/TableEditor/TableEditor';
import ReviewChanges from './pages/ReviewChanges/ReviewChanges';
import SubmitChanges from './pages/SubmitChanges/SubmitChanges';
import ChangeHistory from './pages/ChangeHistory/ChangeHistory';
import ChangeHistoryDetail from './pages/ChangeHistory/ChangeHistoryDetail';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS */}
      <BatchProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/filters" element={<FilterSelection />} />
              <Route path="/import" element={<ImportSession />} />
              <Route path="/editor" element={<TableEditor />} />
              <Route path="/review" element={<ReviewChanges />} />
              <Route path="/submit" element={<SubmitChanges />} />
              <Route path="/history" element={<ChangeHistory />} />
              <Route path="/history/:changeId" element={<ChangeHistoryDetail />} />
            </Routes>
          </MainLayout>
        </Router>
      </BatchProvider>
    </ThemeProvider>
  );
}

export default App;