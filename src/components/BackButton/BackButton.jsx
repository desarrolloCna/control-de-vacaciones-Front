import React from 'react';
import { Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { getLocalStorageData } from '../../services/session/getLocalStorageData';

/**
 * Componente BackButton Parametrizado y Unificado
 * 
 * @param {string} to - Ruta destino. Si no se proporciona, navega al menú según rol.
 * @param {string} label - Texto del botón (default: "Menú Principal")
 * @param {"full"|"icon"} variant - "full" = botón con texto, "icon" = solo ícono circular
 * @param {object} sx - Estilos adicionales de MUI
 */
const BackButton = ({ to, label = 'Menú Principal', variant = 'icon', sx }) => {
  const navigate = useNavigate();

  const getDefaultRoute = () => {
    const userData = getLocalStorageData();
    const idRol = userData?.idRol;
    // Admin (1) o RRHH (3) → panel administrativo
    if (idRol === 1 || idRol === 3) return '/panel';
    // Empleados y coordinadores → home empleado
    return '/empleados/home';
  };

  const handleBack = () => {
    navigate(to || getDefaultRoute());
  };

  if (variant === 'full') {
    return (
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          mb: 2,
          borderRadius: '10px',
          fontWeight: 600,
          textTransform: 'none',
          padding: '8px 20px',
          color: 'text.secondary',
          borderColor: 'divider',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'text.primary',
            color: 'text.primary',
            transform: 'translateX(-4px)',
          },
          ...sx
        }}
      >
        {label}
      </Button>
    );
  }

  // Variante "icon" — botón circular con glassmorphism
  return (
    <IconButton
      onClick={handleBack}
      size="medium"
      aria-label={label}
      sx={{
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(0,0,0,0.06)',
        '&:hover': {
          bgcolor: '#fff',
          transform: 'translateX(-4px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
        ...sx
      }}
    >
      <ArrowBackIcon fontSize="medium" color="primary" />
    </IconButton>
  );
};

export default BackButton;
