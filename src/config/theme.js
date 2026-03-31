import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1A237E', // Azul institucional CNA
            light: '#534bae',
            dark: '#000051',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#0288D1', // Cyan oscuro premium
            light: '#5eb8ff',
            dark: '#005b9f',
            contrastText: '#ffffff',
          },
          background: {
            default: '#F8FAFC', // Gris-azul muy claro, super moderno
            paper: '#ffffff',
          },
          text: {
            primary: '#0F172A', // Slate 900
            secondary: '#64748B', // Slate 500
          },
          divider: '#E2E8F0',
        }
      : {
          primary: {
            main: '#818CF8', // Indigo 400
            light: '#A5B4FC',
            dark: '#4F46E5',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#38BDF8', // Light Blue 400
            light: '#7DD3FC',
            dark: '#0284C7',
            contrastText: '#000000',
          },
          background: {
            default: '#0F172A', // Slate 900
            paper: '#1E293B', // Slate 800
          },
          text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
          },
          divider: '#334155',
        }),
    success: { main: '#10B981', light: '#34D399', dark: '#059669' },
    error: { main: '#EF4444', light: '#F87171', dark: '#DC2828' },
    warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
    info: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.025em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.025em' },
    body1: { lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedPrimary: {
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 100%)' // Indigo super profundo
            : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
          color: '#ffffff',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': {
            background: mode === 'light' ? '#E2E8F0' : '#334155',
            color: mode === 'light' ? '#94A3B8' : '#64748B',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: mode === 'light' 
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        },
        elevation2: {
          boxShadow: mode === 'light'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        },
        elevation3: {
          boxShadow: mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Tarjetas más redondeadas
          boxShadow: mode === 'light' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
            : 'none',
          border: mode === 'light' ? '1px solid #F1F5F9' : '1px solid #334155',
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#ffffff' : '#0F172A',
            transition: 'all 0.2s',
            '&:hover fieldset': {
              borderColor: mode === 'light' ? '#94A3B8' : '#64748B',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
            },
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
          padding: '16px 24px',
        },
        head: {
          fontWeight: 600,
          color: mode === 'light' ? '#475569' : '#94A3B8',
          backgroundColor: mode === 'light' ? '#F8FAFC' : '#1E293B',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          letterSpacing: '0.025em',
        }
      }
    }
  },
});

const defaultTheme = createTheme(getDesignTokens('light'));
export default defaultTheme;
