import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, CssBaseline,
  ThemeProvider, IconButton, useMediaQuery, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Container
} from '@mui/material';
import { Bell, Inbox, Sun, Moon, Menu } from 'lucide-react';
import { Log } from './utils/logger';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';
import getTheme from './theme';

function NavContent({ darkMode, toggleDarkMode, mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');

  const navItems = [
    { label: 'Notifications', path: '/', icon: <Bell size={16} /> },
    { label: 'Priority Inbox', path: '/priority', icon: <Inbox size={16} /> },
  ];

  const drawerContent = (
    <Box sx={{ width: 260, pt: 3 }}>
      <Box sx={{ px: 3, pb: 2, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Campus Notification System
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                mx: 1,
                borderRadius: 1.5,
                mb: 0.5,
                py: 1,
                '&.Mui-selected': {
                  bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: location.pathname === item.path ? 500 : 400 }}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(9, 9, 11, 0.7)'
              : 'rgba(250, 250, 250, 0.7)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ maxWidth: 1100, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, minHeight: { xs: 56 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={(e) => {
                if (e.currentTarget) e.currentTarget.blur();
                setMobileOpen(true);
              }}
              sx={{ mr: 1, color: 'text.secondary' }}
              size="small"
            >
              <Menu size={18} />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: 'text.primary',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            Campus Notification System
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, mr: 1.5 }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Box
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1.5,
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive
                        ? (t) => t.palette.mode === 'dark' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(124, 58, 237, 0.06)'
                        : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(167, 139, 250, 0.08)' : 'rgba(124, 58, 237, 0.04)',
                      },
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Box>
                );
              })}
            </Box>
          )}
          <IconButton
            onClick={toggleDarkMode}
            size="small"
            sx={{
              color: 'text.secondary',
              width: 32,
              height: 32,
              '&:hover': { color: 'primary.main' },
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'background.default',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved ? saved === 'dark' : prefersDark;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('themeMode', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    Log("info", "component", "App mounted");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <NavContent
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
          <Container
            maxWidth={false}
            sx={{
              maxWidth: 1100,
              py: { xs: 3, md: 4 },
              px: { xs: 2, md: 3 },
            }}
          >
            <Routes>
              <Route path="/" element={<AllNotifications />} />
              <Route path="/priority" element={<PriorityInbox />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;