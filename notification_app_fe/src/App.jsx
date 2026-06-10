import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import { Log } from './utils/logger';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    background: { default: '#f5f5f5' }
  },
});

function App() {
  useEffect(() => {
    Log("info", "component", "App initialized");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Campus Notifications
            </Typography>
            <Button color="inherit" component={Link} to="/" startIcon={<NotificationsIcon />}>
              All Notifications
            </Button>
            <Button color="inherit" component={Link} to="/priority" startIcon={<StarIcon />}>
              Priority Inbox
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md">
          <Box sx={{ my: 4 }}>
            <Routes>
              <Route path="/" element={<AllNotifications />} />
              <Route path="/priority" element={<PriorityInbox />} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;