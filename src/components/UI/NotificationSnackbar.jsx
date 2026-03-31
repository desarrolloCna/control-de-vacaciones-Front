import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * NotificationSnackbar — Componente reutilizable de notificaciones
 *
 * @param {boolean} open - Si el snackbar está visible
 * @param {function} onClose - Callback al cerrar
 * @param {string} message - Mensaje a mostrar
 * @param {"success"|"error"|"warning"|"info"} severity - Tipo de alerta
 * @param {number} autoHideDuration - Tiempo en ms para auto-ocultar (default: 4000)
 * @param {"top"|"bottom"} vertical - Posición vertical
 * @param {"left"|"center"|"right"} horizontal - Posición horizontal
 */

const SEVERITY_STYLES = {
  success: {
    backgroundColor: '#059669',
    color: '#ffffff',
    icon: <CheckCircleOutlineIcon />,
  },
  error: {
    backgroundColor: '#DC2626',
    color: '#ffffff',
    icon: <ErrorOutlineIcon />,
  },
  warning: {
    backgroundColor: '#D97706',
    color: '#ffffff',
    icon: <WarningAmberIcon />,
  },
  info: {
    backgroundColor: '#2563EB',
    color: '#ffffff',
    icon: <InfoOutlinedIcon />,
  },
};

const NotificationSnackbar = ({
  open,
  onClose,
  message,
  severity = 'success',
  autoHideDuration = 4000,
  vertical = 'top',
  horizontal = 'right',
}) => {
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.success;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical, horizontal }}
      TransitionComponent={Slide}
      sx={{
        '& .MuiSnackbarContent-root': {
          padding: '8px 16px',
          minWidth: '200px',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        icon={styles.icon}
        sx={{
          width: '100%',
          fontSize: '0.95rem',
          fontWeight: 600,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          '& .MuiAlert-icon': {
            color: styles.color,
          },
          '& .MuiAlert-action': {
            color: styles.color,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
