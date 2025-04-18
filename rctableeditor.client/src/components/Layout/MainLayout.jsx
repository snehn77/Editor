import { Box, Paper, Typography, Link, useTheme } from '@mui/material';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import { useEffect } from 'react';

// Sidebar width for spacing calculations - match value from Sidebar.jsx
const drawerWidth = 220;

// Custom CSS for full-width footer
const styles = {
  '@global': {
    '.footer-full-width': {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      margin: 0,
      boxSizing: 'border-box',
    }
  }
};

// Apply global styles
const applyGlobalStyles = () => {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .footer-full-width {
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    }
  `;
  document.head.appendChild(styleEl);
  return () => document.head.removeChild(styleEl);
};

const MainLayout = ({ children }) => {
  const theme = useTheme();
  
  // Apply global styles on component mount
  useEffect(() => {
    return applyGlobalStyles();
  }, []);
  
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      pb: '60px', // Space for footer,
    }}>
      {/* App Header */}
      <AppHeader />
      
      {/* Content with sidebar */}
      <Box sx={{
        display: 'flex',
        flexGrow: 1,
        pt: '30px', // Account for fixed header
      }}>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <Box sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: 5,
          p: 0, // No padding
          pl: 0, // No left padding
          pr: { xs: 1, sm: 1 }, // Keep minimal right padding
        }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              overflow: 'auto',
            }}
          >
            {children}
          </Paper>
        </Box>
      </Box>
      
      {/* Footer with direct DOM class */}
      <Box
        component="footer"
        className="footer-full-width"
        sx={{
          py: 2,
          height: '50px',
          bgcolor: theme.palette.background.paper,
          borderTop: '1px solid',
          borderColor: theme.palette.divider,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{
          width: '100%',
          px: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          ml: { md: `${drawerWidth}px` },
        }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} RC Table Editor | All rights reserved
          </Typography>
          <Box sx={{ mt: { xs: 0.5, sm: 0 } }}>
            <Link href="#" color="primary" sx={{ mx: 1, fontSize: '0.875rem' }}>Documentation</Link>
            <Link href="#" color="primary" sx={{ mx: 1, fontSize: '0.875rem' }}>Support</Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
