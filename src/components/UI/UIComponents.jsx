import React from 'react';
import { Button, IconButton, Typography, Box, styled } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

// 1. Botón Estilizado con Micro-animaciones
export const StyledButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    filter: 'brightness(1.1)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

// 2. Botón de Volver Universal
export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <IconButton 
      onClick={() => navigate(-1)}
      size="medium"
      sx={{ 
        bgcolor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
        '&:hover': { 
          bgcolor: '#fff',
          transform: 'translateX(-4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }
      }}
    >
      <ArrowBackIcon fontSize="medium" color="primary" />
    </IconButton>
  );
};

// 3. Encabezado de Página Unificado
export const PageHeader = ({ title, subtitle, showBack = true }) => {
  return (
    <Box 
      sx={{ 
        mb: 4, 
        p: 2.5,
        borderRadius: '12px',
        bgcolor: 'rgba(26, 35, 126, 0.04)',
        borderLeft: '6px solid #1A237E',
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        position: 'relative'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {showBack && <Box sx={{ mt: 0.5 }}><BackButton /></Box>}
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#1A237E',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              mb: 0.5
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
