import React from 'react';
import { Box, Typography, Avatar, Paper, styled, Chip } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  background: 'linear-gradient(135deg, #1A237E 0%, #3949AB 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(26, 35, 126, 0.3)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  marginRight: theme.spacing(4),
  fontSize: '3.5rem',
  fontWeight: 900,
  backgroundColor: theme.palette.primary.light,
}));

const ContactProfile = ({ infoPersonal, infoDpi }) => {
  const p = infoPersonal || {};
  
  // Construcción del nombre completo
  const nombreCompleto = [
    p.primerNombre,
    p.segundoNombre,
    p.tercerNombre,
    p.primerApellido,
    p.segundoApellido,
    p.apellidoCasada
  ].filter(Boolean).join(' ') || "Cargando...";

  const iniciales = ((p.primerNombre?.charAt(0) || "") + (p.primerApellido?.charAt(0) || "")).toUpperCase() || "?";

  // El CUI viene de numeroDocumento en el hook de DPI (infoDpi)
  // Buscamos en varias posibles ubicaciones por seguridad
  const cuiValue = 
    infoDpi?.numeroDocumento || 
    infoDpi?.responseData?.numeroDocumento || 
    infoDpi?.cui || 
    infoDpi?.responseData?.cui ||
    p.cui || 
    "---";

  return (
    <ProfileCard elevation={0}>
      <ProfileAvatar>
        {iniciales}
      </ProfileAvatar>

      <Box sx={{ zIndex: 1 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 900, 
            letterSpacing: '-1px', 
            mb: 1,
            fontSize: { xs: '1.5rem', md: '2.5rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            lineHeight: 1.2
          }}
        >
          {nombreCompleto}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Chip 
            icon={<BadgeIcon sx={{ color: 'white !important' }} />} 
            label={`CUI: ${cuiValue}`}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.15)', 
              color: 'white', 
              fontWeight: 800,
              borderRadius: 2,
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)',
              px: 1,
              fontSize: '1rem'
            }} 
          />
        </Box>
      </Box>
    </ProfileCard>
  );
};

export default ContactProfile;
