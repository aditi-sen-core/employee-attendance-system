import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0066CC',
      light: '#E3F2FD',
      dark: '#0052A3',
    },
    secondary: {
      main: '#9C27B0',
      light: '#F3E5F5',
    },
    success: {
      main: '#4CAF50',
      light: '#E8F5E9',
    },
    warning: {
      main: '#FF9800',
      light: '#FFF3E0',
    },
    error: {
      main: '#F44336',
      light: '#FFEBEE',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2332',
      secondary: '#657786',
    },
    divider: '#E1E8ED',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      letterSpacing: '-0.5px',
      color: '#1A2332',
    },
    h2: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#1A2332',
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
      color: '#1A2332',
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#1A2332',
    },
    h5: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#1A2332',
    },
    h6: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#1A2332',
    },
    body1: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#1A2332',
    },
    body2: {
      fontSize: '13px',
      lineHeight: '1.5',
      color: '#657786',
    },
    caption: {
      fontSize: '12px',
      color: '#657786',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E1E8ED',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '6px',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#0066CC',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E1E8ED',
          fontSize: '14px',
        },
        head: {
          backgroundColor: '#F5F7FA',
          fontWeight: 600,
          color: '#1A2332',
        },
      },
    },
  },
});

export default theme;
