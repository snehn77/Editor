import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Divider, 
  Chip, 
  Avatar, 
  Tooltip,
  useMediaQuery,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ReviewsIcon from '@mui/icons-material/Reviews';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import LogoutIcon from '@mui/icons-material/Logout';
import { useBatch } from '../../context/BatchContext';

const AppHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isActive, batchId, process, layer, clearActiveBatch, hasChanges } = useBatch();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleNavigation = (path) => {
    // If there are unsaved changes, prompt the user
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
      return;
    }

    // If navigating away from an active editing session
    if (isActive && (path === '/' || path.startsWith('/history'))) {
      if (window.confirm('This will end your current editing session. Continue?')) {
        clearActiveBatch();
        navigate(path);
      }
    } else {
      navigate(path);
    }
    setDrawerOpen(false);
  };

  const handleDiscardSession = () => {
    if (window.confirm('Are you sure you want to discard the current session?')) {
      clearActiveBatch();
      navigate('/');
    }
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname === '/'} 
            onClick={() => handleNavigation('/')}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname === '/filter'} 
            onClick={() => handleNavigation('/filter')}
          >
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Start New Edit Session" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname === '/import'} 
            onClick={() => handleNavigation('/import')}
          >
            <ListItemIcon>
              <FileUploadIcon />
            </ListItemIcon>
            <ListItemText primary="Import Session" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname.startsWith('/history')} 
            onClick={() => handleNavigation('/history')}
          >
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Change History" />
          </ListItemButton>
        </ListItem>
      </List>
      {isActive && (
        <>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton 
                selected={location.pathname === '/editor'} 
                onClick={() => handleNavigation('/editor')}
              >
                <ListItemIcon>
                  <TableChartIcon />
                </ListItemIcon>
                <ListItemText primary="Current Editing Session" secondary={`${process} / ${layer}`} />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={2}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h5" 
            component={RouterLink} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600, 
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <TableChartIcon sx={{ mr: 1.5 }} />
            RC Table Editor
          </Typography>
          
          {isActive && (
            <>
              {!isMobile && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mr: 3,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  py: 0.5,
                  px: 2
                }}>
                  <Tooltip title="Batch ID">
                    <Chip 
                      size="small"
                      label={`ID: ${batchId?.substring(0, 8)}`}
                      sx={{ 
                        mr: 1.5, 
                        fontWeight: 500,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  </Tooltip>
                  
                  <Tooltip title="Process">
                    <Chip 
                      size="small"
                      label={process}
                      sx={{ 
                        mr: 1.5, 
                        fontWeight: 500,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  </Tooltip>
                  
                  <Tooltip title="Layer">
                    <Chip 
                      size="small"
                      label={layer}
                      sx={{ 
                        fontWeight: 500,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  </Tooltip>
                </Box>
              )}
              
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDiscardSession}
                startIcon={<LogoutIcon />}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  bgcolor: 'error.dark',
                  '&:hover': { bgcolor: 'error.main' }
                }}
              >
                Exit Session
              </Button>
              
              {isMobile && (
                <IconButton color="error" onClick={handleDiscardSession}>
                  <LogoutIcon />
                </IconButton>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Empty toolbar to push content below AppBar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {list()}
      </Drawer>
    </>
  );
};

export default AppHeader;
