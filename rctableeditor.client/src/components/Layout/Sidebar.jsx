import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TableChartIcon from '@mui/icons-material/TableChart';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import { useBatch } from '../../context/BatchContext';

// Sidebar width - reduced from 240 to fix spacing issues
const drawerWidth = 220;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isActive, batchId } = useBatch();
  const theme = useTheme();

  // Define navigation items
  const navItems = [
    {
      path: '/',
      text: 'Dashboard',
      icon: <DashboardIcon />,
      description: 'Return to main dashboard'
    },
    {
      path: '/filters',
      text: 'Filter Selection',
      icon: <FilterAltIcon />,
      description: 'Select filters for data',
      requiresBatch: false
    },
    {
      path: '/import',
      text: 'Import Data',
      icon: <FileUploadIcon />,
      description: 'Import data from Excel',
      requiresBatch: false
    },
    {
      path: '/editor',
      text: 'Table Editor',
      icon: <TableChartIcon />,
      description: 'Edit table data',
      requiresBatch: true
    },
    {
      path: '/review',
      text: 'Review Changes',
      icon: <VisibilityIcon />,
      description: 'Review pending changes',
      requiresBatch: true
    },
    {
      path: '/submit',
      text: 'Submit Changes',
      icon: <CheckCircleIcon />,
      description: 'Submit approved changes',
      requiresBatch: true
    },
    {
      path: '/history',
      text: 'Change History',
      icon: <HistoryIcon />,
      description: 'View change history',
      requiresBatch: false
    }
  ];

  // Only show permanent sidebar on medium and larger screens
  const isMediumUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Drawer
      variant={isMediumUp ? "permanent" : "temporary"}
      open={isMediumUp}
      sx={{
        display: { xs: 'block' },
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          top: '64px', // Start below AppBar
          height: 'calc(100% - 64px)', // Subtract AppBar height
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f5f8fa',
          borderRight: 0, // Remove border to eliminate gap
          zIndex: theme.zIndex.appBar - 1, // Below AppBar
          paddingRight: 0, // Remove right padding
          marginRight: 0 // Ensure no margin
        }
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            textAlign: 'center',
            fontSize: '1rem'
          }}
        >
          RC Table Editor
        </Typography>
      </Box>

      {isActive && batchId && (
        <Box sx={{ p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
            Active Session
          </Typography>
          <Typography variant="body2" noWrap sx={{ mt: 0.5, fontSize: '0.75rem' }}>
            ID: {batchId.substring(0, 8)}...
          </Typography>
        </Box>
      )}

      <List sx={{ pt: 1 }}>
        {navItems.map((item) => {
          // Skip items that require an active batch if none exists
          if (item.requiresBatch && !isActive) {
            return null;
          }

          const isSelected = location.pathname === item.path;

          return (
            <Tooltip 
              key={item.path} 
              title={item.description}
              placement="right"
              arrow
            >
              <ListItem disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    ml: 1,
                    mr: 0, // No right margin
                    my: 0.5, // Add vertical spacing between items
                    py: 0.75, // Reduce padding to make items more compact
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                    '&.Mui-selected .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{ 
                      minWidth: 32, // Reduced from 40 to save space
                      color: isSelected ? 'inherit' : 'primary.main'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontSize: '0.875rem' 
                      } 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ mt: 'auto' }} />
      <Box sx={{ p: 2, fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center' }}>
        Version 1.0.0
      </Box>
    </Drawer>
  );
};

export default Sidebar;
