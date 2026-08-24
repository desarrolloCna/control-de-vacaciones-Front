import React from 'react';
import { Button, Typography, Box, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BackButton from '../BackButton/BackButton';

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

// 2. Botón de Volver — Re-exportado desde el componente unificado
export { default as BackButton } from '../BackButton/BackButton';

export const PageHeader = ({ title, subtitle, showBack = true, actionElement }) => {
  return (
    <Box 
      sx={{ 
        mb: 4, 
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        border: '1px solid #e0e7ff',
        borderLeft: '6px solid #4f46e5',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.05)',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 3,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flex: 1, zIndex: 1 }}>
        {showBack && (
          <Box>
            <BackButton 
              sx={{ 
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                bgcolor: '#ffffff',
                '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-2px)' }
              }} 
            />
          </Box>
        )}
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#1e1b4b',
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              mb: 0.5
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#64748b' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {actionElement && (
        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          {actionElement}
        </Box>
      )}
    </Box>
  );
};
