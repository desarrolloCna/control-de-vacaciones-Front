import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { getLocalStorageData } from '../../services/session/getLocalStorageData';

const BackButton = ({ sx }) => {
  const navigate = useNavigate();
  const userData = getLocalStorageData();
  const idRol = userData?.idRol;

  const handleBack = () => {
    // Si es Administrador o RRHH (1 o 3), ir al panel administrativo
    if (idRol === 1 || idRol === 3) {
      navigate('/panel');
    } else {
      // De lo contrario, ir al home del empleado
      navigate('/empleados/home');
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={handleBack}
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        fontWeight: 600,
        color: 'text.secondary',
        borderColor: 'divider',
        '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'text.primary',
            color: 'text.primary'
        },
        ...sx 
      }}
    >
      Volver
    </Button>
  );
};

export default BackButton;
