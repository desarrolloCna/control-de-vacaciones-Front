import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Box, Typography, CircularProgress, 
    Alert
} from '@mui/material';
import { darBajaEmpleado } from '../../../services/empleados/movimientos.service';

export default function ModalBajaEmpleado({ open, onClose, empleado, onSuccess }) {
    const [fechaBaja, setFechaBaja] = useState('');
    const [motivoBaja, setMotivoBaja] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!window.confirm(`¿Está completamente seguro de dar de baja a ${empleado?.Nombres}? Esta acción deshabilitará su acceso al sistema y pausará sus vacaciones.`)) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await darBajaEmpleado({
                idEmpleado: empleado.idEmpleado,
                fechaBaja,
                motivoBaja
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Error al dar de baja al empleado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle component="div">
                <Typography variant="h6" fontWeight="bold" color="error">Registrar Baja de Empleado</Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Dar de baja a un empleado deshabilitará su cuenta de usuario y pausará la acreditación automática de sus días de vacaciones.
                    </Alert>

                    <Box sx={{ mb: 2, bgcolor: '#f1f5f9', p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Empleado: <strong>{empleado?.Nombres}</strong></Typography>
                        <Typography variant="body2" color="text.secondary">CUI: <strong>{empleado?.numeroDocumento}</strong></Typography>
                    </Box>
                    
                    <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Baja Efectiva"
                        variant="outlined"
                        margin="normal"
                        required
                        InputLabelProps={{ shrink: true }}
                        value={fechaBaja}
                        onChange={(e) => setFechaBaja(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Motivo de la Baja"
                        variant="outlined"
                        margin="normal"
                        required
                        value={motivoBaja}
                        onChange={(e) => setMotivoBaja(e.target.value)}
                        placeholder="Ej. Renuncia voluntaria, Despido justificado, Jubilación, etc."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={loading}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="error" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Baja"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
