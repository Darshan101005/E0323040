import { createTheme } from '@mui/material';

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: { main: '#A78BFA' },
            background: {
              default: '#09090B',
              paper: '#18181B',
            },
            text: {
              primary: '#FAFAFA',
              secondary: '#A1A1AA',
            },
            divider: 'rgba(255, 255, 255, 0.06)',
          }
        : {
            primary: { main: '#7C3AED' },
            background: {
              default: '#FAFAFA',
              paper: '#FFFFFF',
            },
            text: {
              primary: '#09090B',
              secondary: '#71717A',
            },
            divider: 'rgba(0, 0, 0, 0.06)',
          }),
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h4: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.025em' },
      h5: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em' },
      h6: { fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' },
      body1: { fontSize: '0.875rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem' },
      subtitle2: { fontWeight: 500, fontSize: '0.8125rem' },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.2s ease, color 0.2s ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8125rem',
            borderRadius: 6,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            fontSize: '0.6875rem',
            height: 22,
            borderRadius: 4,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#A78BFA' : '#7C3AED',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? '#A78BFA' : '#7C3AED',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

export default getTheme;
