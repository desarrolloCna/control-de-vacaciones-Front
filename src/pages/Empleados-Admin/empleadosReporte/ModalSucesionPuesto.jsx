import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Box, Typography, CircularProgress, 
    FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { cambiarPuestoEmpleado } from '../../../services/empleados/movimientos.service';

export default function ModalSucesionPuesto({ open, onClose, empleado, onSuccess }) {
    const [puestoNuevo, setPuestoNuevo] = useState('');
    const [fechaIngresoPuestoNuevo, setFechaIngresoPuestoNuevo] = useState('');
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await cambiarPuestoEmpleado({
                idEmpleado: empleado.idEmpleado,
                idInfoPersonal: empleado.idInfoPersonal,
                puestoNuevo,
                fechaIngresoPuestoNuevo,
                motivo
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Error al procesar el cambio de puesto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle component="div">
                <Typography variant="h6" fontWeight="bold">Cambio de Puesto (Sucesión)</Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <Box sx={{ mb: 2, bgcolor: '#f1f5f9', p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Empleado: <strong>{empleado?.Nombres}</strong></Typography>
                        <Typography variant="body2" color="text.secondary">Puesto Anterior: <strong>{empleado?.puesto}</strong></Typography>
                    </Box>

                    <TextField
                        fullWidth
                        label="Nuevo Puesto"
                        variant="outlined"
                        margin="normal"
                        required
                        value={puestoNuevo}
                        onChange={(e) => setPuestoNuevo(e.target.value)}
                    />
                    
                    <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Ingreso al Nuevo Puesto"
                        variant="outlined"
                        margin="normal"
                        required
                        InputLabelProps={{ shrink: true }}
                        value={fechaIngresoPuestoNuevo}
                        onChange={(e) => setFechaIngresoPuestoNuevo(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Motivo del Cambio (Justificación de Continuidad)"
                        variant="outlined"
                        margin="normal"
                        required
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej. Ascenso por mérito, reestructuración, etc."
                    />
                    
                    <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 1 }}>
                        Nota: La "Fecha de Ingreso Institucional" para cálculo de vacaciones se mantendrá intacta para no afectar el historial.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={loading}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Sucesión"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
