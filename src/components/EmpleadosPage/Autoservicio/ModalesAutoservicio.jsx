import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../../config/enviroment';

export const ModalesAutoservicio = ({ openPassword, setOpenPassword, openCelular, setOpenCelular, idEmpleado, onUpdateSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nuevoCelular, setNuevoCelular] = useState('');

  const handleCambiarPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      await axios.put(`${API_URL}/empleado/cambiar-password`, {
        idEmpleado,
        currentPassword,
        newPassword
      });
      alert("Contraseña actualizada exitosamente. Los cambios surgirán efecto en tu próximo Inicio de Sesión.");
      setOpenPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      alert("Error al cambiar contraseña: " + (e.response?.data?.error || e.message));
    }
  };

  const handleActualizarCelular = async () => {
    if (!nuevoCelular) return;
    try {
      await axios.put(`${API_URL}/empleado/actualizar-celular`, {
        idEmpleado,
        nuevoCelular
      });
      alert("Celular actualizado exitosamente");
      setOpenCelular(false);
      setNuevoCelular("");
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (e) {
      alert("Error al actualizar celular: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <>
      <Dialog open={openPassword} onClose={() => setOpenPassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Contraseña Actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirmar Nueva Contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleCambiarPassword}>Actualizar Contraseña</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCelular} onClose={() => setOpenCelular(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Actualizar Número de Celular</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Nuevo Número de Celular"
              value={nuevoCelular}
              onChange={(e) => setNuevoCelular(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCelular(false)}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleActualizarCelular}>Guardar Cambios</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
