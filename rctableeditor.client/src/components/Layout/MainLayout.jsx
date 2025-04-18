import { Box, Container, Paper, Typography, Link, Divider } from '@mui/material';
import AppHeader from './AppHeader';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <AppHeader />
      <Box sx={{ 
        flex: 1, 
        py: { xs: 2, sm: 3 }, 
        px: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Container maxWidth="xl" sx={{ flex: 1 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}
          >
            {children}
          </Paper>
        </Container>
      </Box>
      
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} RC Table Editor | All rights reserved
            </Typography>
            <Box sx={{ mt: { xs: 1, sm: 0 } }}>
              <Link href="#" color="primary" sx={{ mx: 1, fontSize: '0.875rem' }}>Documentation</Link>
              <Link href="#" color="primary" sx={{ mx: 1, fontSize: '0.875rem' }}>Support</Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
