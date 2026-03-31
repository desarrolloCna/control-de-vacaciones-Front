import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de repuesto.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData && Number(userData.idRol) === 1) {
          window.location.href = "/panel";
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/empleados/home";
  };

  render() {
    if (this.state.hasError) {
      // UI de repuesto personalizada
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            bgcolor: '#f8f9fa',
            textAlign: 'center',
            p: 3,
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 80, color: '#f5a623', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
            ¡Ups! Algo salió mal.
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mb: 4, maxWidth: 500 }}>
            Ocurrió un error inesperado al cargar esta pantalla. No te preocupes, tus datos están seguros.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={this.handleReload}
              sx={{ bgcolor: '#f5a623', '&:hover': { bgcolor: '#e8852d' }, color: '#fff', fontWeight: 600 }}
            >
              Recargar Página
            </Button>
            <Button 
              variant="outlined" 
              onClick={this.handleHome}
              sx={{ color: '#1a1a2e', borderColor: '#1a1a2e', fontWeight: 600 }}
            >
              Volver al Inicio
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
