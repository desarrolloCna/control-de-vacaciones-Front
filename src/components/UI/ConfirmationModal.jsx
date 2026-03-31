import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

/**
 * ConfirmationModal — Modal reutilizable para confirmaciones/alertas
 *
 * @param {boolean} open - Si el modal está visible
 * @param {function} onClose - Callback al cerrar
 * @param {React.ReactNode} icon - Ícono a mostrar en la parte superior
 * @param {string} iconBgColor - Color de fondo del contenedor del ícono (default: "#fff3e0")
 * @param {string} iconColor - Color del ícono (default: "#f57c00")
 * @param {string} title - Título del modal
 * @param {string} titleColor - Color del título (default: hereda de iconColor)
 * @param {string} buttonText - Texto del botón (default: "Entendido")
 * @param {string} buttonColor - Color del botón (default: "#1976d2")
 * @param {React.ReactNode} children - Contenido personalizado del cuerpo
 */
const ConfirmationModal = ({
  open,
  onClose,
  icon,
  iconBgColor = '#fff3e0',
  iconColor = '#f57c00',
  title,
  titleColor,
  buttonText = 'Entendido',
  buttonColor = '#1976d2',
  buttonHoverColor,
  children,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          p: 4,
          width: { xs: '90%', sm: 450 },
          maxWidth: 500,
          borderRadius: 3,
          outline: 'none',
          animation: 'modalFadeIn 0.25s ease-out',
          '@keyframes modalFadeIn': {
            from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
            to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          },
        }}
      >
        {/* Ícono superior */}
        {icon && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                bgcolor: iconBgColor,
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& .MuiSvgIcon-root': {
                  fontSize: 48,
                  color: iconColor,
                },
              }}
            >
              {icon}
            </Box>
          </Box>
        )}

        {/* Título */}
        {title && (
          <Typography
            variant="h5"
            component="h2"
            align="center"
            sx={{
              fontWeight: 700,
              color: titleColor || iconColor,
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Typography>
        )}

        {/* Contenido personalizado */}
        {children && (
          <Box sx={{ mb: 3 }}>
            {children}
          </Box>
        )}

        {/* Botón de acción */}
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            bgcolor: buttonColor,
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: buttonHoverColor || buttonColor,
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            },
          }}
        >
          {buttonText}
        </Button>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
