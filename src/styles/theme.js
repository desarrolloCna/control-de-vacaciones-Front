import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#334155", // Slate 700 - Más moderno y equilibrado
      light: "#64748B",
      dark: "#0F172A", // Slate 900
      contrastText: "#fff",
    },
    secondary: {
      main: "#6366F1", // Indigo 500 - Acento profesional
      light: "#818CF8",
      dark: "#4F46E5",
      contrastText: "#fff",
    },
    success: {
      main: "#2E7D32", // Verde éxito
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    error: {
      main: "#C62828", // Rojo error
      light: "#EF5350",
      dark: "#B71C1C",
    },
    background: {
      default: "#F8FAFC", // Slate 50 - Fondo limpio y profesional
      paper: "#ffffff",
    },
    text: {
      primary: "#1E293B", // Slate 800
      secondary: "#64748B", // Slate 500
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700, color: "#0F172A" },
    h2: { fontWeight: 700, color: "#0F172A" },
    h3: { fontWeight: 600, color: "#1E293B" },
    h4: { fontWeight: 600, color: "#1E293B" },
    h5: { fontWeight: 500, color: "#334155" },
    h6: { fontWeight: 500, color: "#334155" },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 20px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)", // Indigo Gradient
          boxShadow: "0 2px 4px rgba(79, 70, 229, 0.25)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
