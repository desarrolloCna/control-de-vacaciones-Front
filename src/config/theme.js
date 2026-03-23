import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Paleta para modo claro
          primary: {
            main: '#1A237E', // Azul institucional principal
            light: '#534bae',
            dark: '#000051',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#1565C0', // Azul secundario
            light: '#5e92f3',
            dark: '#003c8f',
            contrastText: '#ffffff',
          },
          background: {
            default: '#F5F7FA',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        }
      : {
          // Paleta para modo oscuro
          primary: {
            main: '#5c6bc0', // Azul más claro para no dañar la vista en dark mode
            light: '#8e99f3',
            dark: '#26418f',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#42a5f5', 
            light: '#80d6ff',
            dark: '#0077c2',
            contrastText: '#000000',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }),
    success: { main: '#43A047' },
    error: { main: '#E53935' },
    warning: { main: '#FFB300' },
    info: { main: '#039BE5' },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #1A237E 0%, #1565C0 100%)'
            : 'linear-gradient(135deg, #3949ab 0%, #1e88e5 100%)',
          boxShadow: mode === 'light' ? '0 4px 6px rgba(26, 35, 126, 0.2)' : 'none',
          '&:hover': {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #000051 0%, #003c8f 100%)'
              : 'linear-gradient(135deg, #5c6bc0 0%, #42a5f5 100%)',
          },
        },
        containedSecondary: {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #1565C0 0%, #039BE5 100%)'
              : 'linear-gradient(135deg, #1e88e5 0%, #29b6f6 100%)',
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none', // Prevenir la superposición blanca de MUI en dark mode
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 4px 20px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          }
        }
      }
    }
  },
});

// Mantener compatibilidad exportando un default fijo si alguna vista lo lee por error
const defaultTheme = createTheme(getDesignTokens('light'));
export default defaultTheme;
