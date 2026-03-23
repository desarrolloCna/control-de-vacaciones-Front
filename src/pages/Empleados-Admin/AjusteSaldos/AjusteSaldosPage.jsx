import React, { useState, useMemo, useEffect } from "react";
import { 
    Box, Container, Alert, AlertTitle, Card, CardContent, TextField, Typography, Button, 
    List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, Tooltip, Divider
} from "@mui/material";
import Navbar from "../../../components/navBar/NavBar";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { PageHeader } from "../../../components/UI/UIComponents";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { useCheckSession } from "../../../services/session/checkSession";
import api from "../../../config/api";

const AjusteSaldosPage = () => {
    useCheckSession();
    const userData = getLocalStorageData();
    const [empleadosU, setEmpleadosU] = useState([]);
    const [loadingEmpleados, setLoadingEmpleados] = useState(true);
    
    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const response = await api.get('/employeesList');
                setEmpleadosU(response.data.responseData.emplloyeesList || []);
            } catch (error) {
                console.error("Error al obtener empleados", error);
            } finally {
                setLoadingEmpleados(false);
            }
        };
        fetchEmpleados();
    }, []);
    
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    
    // Estado para los inputs en edición
    const [editandoId, setEditandoId] = useState(null);
    const [formValues, setFormValues] = useState({
        diasAcreditados: 0,
        diasDebitados: 0,
        diasDisponibles: 0,
        justificacion: ''
    });

    useEffect(() => {
        if (mensaje.tipo === 'success' && mensaje.texto) {
            const timer = setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    const empleadosFiltrados = useMemo(() => {
        if (!terminoBusqueda.trim()) return empleadosU;
        const terminoLower = terminoBusqueda.toLowerCase().trim();
        return empleadosU?.filter(empleado => 
            empleado.Nombres?.toLowerCase().includes(terminoLower)
        );
    }, [empleadosU, terminoBusqueda]);

    const handleOpenModal = async (empleado) => {
        setSelectedEmpleado(empleado);
        setModalOpen(true);
        setEditandoId(null);
        setHistorial([]);
        setLoadingHistorial(true);
        setMensaje({ tipo: '', texto: '' });
        
        try {
            const response = await api.get(`/getHistorial?idEmpleado=${empleado.idEmpleado}`);
            if (response.data && response.data.historial) {
                // Filtramos por tipoRegistro = 1 para mostrar solo los periodos de acreditacion base
                const periods = response.data.historial.filter(h => h.tipoRegistro === 1);
                setHistorial(periods);
            }
        } catch (error) {
            console.error("Error obteniendo historial:", error);
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar el historial del empleado.' });
        } finally {
            setLoadingHistorial(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmpleado(null);
        setEditandoId(null);
    };

    const handleEditClick = (periodo) => {
        setEditandoId(periodo.idHistorial);
        setFormValues({
            diasAcreditados: periodo.totalDiasAcreditados ?? 0,
            diasDebitados: periodo.totalDiasDebitados ?? 0,
            diasDisponibles: periodo.diasDisponiblesTotales ?? 0,
            justificacion: ''
        });
    };

    const handleCancelEdit = () => {
        setEditandoId(null);
    };

    const handleSavePeriod = async (idHistorial) => {
        if (!formValues.justificacion.trim()) {
            alert("Es necesario justificar el motivo del cambio manual.");
            return;
        }

        try {
            const payload = {
                idHistorial,
                diasAcreditados: Number(formValues.diasAcreditados),
                diasDebitados: Number(formValues.diasDebitados),
                diasDisponibles: Number(formValues.diasDisponibles),
                justificacion: formValues.justificacion,
                idUsuarioSession: userData?.idUsuario || userData?.idEmpleado,
                usuarioSession: userData?.usuario || "Admin"
            };

            await api.put('/UpdateSaldoManual', payload);
            
            // Actualizar el estado local para reflejar el cambio en la tabla
            setHistorial(prev => prev.map(p => {
                if(p.idHistorial === idHistorial) {
                    return {
                        ...p,
                        totalDiasAcreditados: payload.diasAcreditados,
                        totalDiasDebitados: payload.diasDebitados,
                        diasDisponiblesTotales: payload.diasDisponibles
                    };
                }
                return p;
            }));

            setEditandoId(null);
            setMensaje({ tipo: 'success', texto: 'Saldo de vacaciones actualizado correctamente.' });
        } catch (error) {
            console.error(error);
            alert("Hubo un error al guardar los cambios.");
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            <Navbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <PageHeader
                title="Regularización de Vacaciones"
                subtitle="Ajuste manual de saldos por periodos vencidos (Exclusivo Super-Admin)"
            />

            {mensaje.texto && (
                <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>
                    <AlertTitle>{mensaje.tipo === 'success' ? 'Éxito' : 'Atención'}</AlertTitle>
                    {mensaje.texto}
                </Alert>
            )}

            <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ p: 4 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar empleado por nombre..."
                        value={terminoBusqueda}
                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                        sx={{ mb: 4 }}
                    />

                    {loadingEmpleados ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            {empleadosFiltrados?.map((empleado, index) => (
                                <React.Fragment key={empleado.idEmpleado}>
                                    <ListItem 
                                        button 
                                        onClick={() => handleOpenModal(empleado)}
                                        sx={{ 
                                            py: 2.5,
                                            px: 3,
                                            borderRadius: 2,
                                            mb: 1,
                                            border: '1px solid transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: '#f1f5f9',
                                                borderColor: 'primary.light',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ 
                                                bgcolor: 'primary.main', 
                                                width: 52, 
                                                height: 52,
                                                fontSize: '1.2rem',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 8px rgba(26, 35, 126, 0.2)'
                                            }}>
                                                {empleado.Nombres ? empleado.Nombres.charAt(0) : 'E'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            sx={{ ml: 2 }}
                                            primary={
                                                <Typography variant="h6" fontWeight="800" color="#1A237E">
                                                    {empleado.Nombres}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main', mr: 1 }}>Ingreso:</Box> {empleado.fechaIngresoLabores || 'Desconocida'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {empleado.unidad || 'Sin unidad'}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            sx={{ 
                                                borderRadius: 4, 
                                                textTransform: 'none',
                                                fontWeight: 'bold',
                                                px: 3,
                                                bgcolor: '#1976d2'
                                            }}
                                        >
                                            Ver Historial
                                        </Button>
                                    </ListItem>
                                </React.Fragment>
                            ))}
                            {empleadosFiltrados?.length === 0 && (
                                <Box p={3} textAlign="center">
                                    <Typography color="text.secondary">No se encontraron empleados</Typography>
                                </Box>
                            )}
                        </List>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Historial */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">Historial de: {selectedEmpleado?.Nombres}</Typography>
                        <IconButton onClick={handleCloseModal}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: 3 }}>
                    {loadingHistorial ? (
                        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                    ) : historial.length === 0 ? (
                        <Alert severity="info">Este empleado no tiene registros de vacaciones acumuladas.</Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {historial.map((periodo) => (
                                <Grid item xs={12} key={periodo.idHistorial}>
                                    <Card elevation={0} sx={{ 
                                        borderRadius: 3, 
                                        border: "2px solid",
                                        borderColor: editandoId === periodo.idHistorial ? 'primary.main' : '#e2e8f0',
                                        transition: 'all 0.3s',
                                        backgroundColor: editandoId === periodo.idHistorial ? '#fff' : '#fafafa'
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                                <Typography variant="h6" fontWeight="800" sx={{ color: "#1A237E", display: 'flex', alignItems: 'center' }}>
                                                    <CalendarTodayIcon sx={{ mr: 1, fontSize: 'large' }} /> Período: {periodo.periodo}
                                                </Typography>
                                                {editandoId !== periodo.idHistorial ? (
                                                    <Button 
                                                        variant="text"
                                                        startIcon={<EditIcon />}
                                                        color="primary"
                                                        sx={{ fontWeight: 'bold' }}
                                                        onClick={() => handleEditClick(periodo)}
                                                    >
                                                        Ajustar Saldos
                                                    </Button>
                                                ) : (
                                                    <Box>
                                                        <Button 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={handleCancelEdit}
                                                            sx={{ mr: 1, fontWeight: 'bold' }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            variant="contained" 
                                                            color="success"
                                                            startIcon={<SaveIcon />}
                                                            onClick={() => handleSavePeriod(periodo.idHistorial)}
                                                            sx={{ fontWeight: 'bold', px: 2 }}
                                                        >
                                                            Aplicar Ajuste
                                                        </Button>
                                                    </Box>
                                                )}
                                            </Box>
                                            
                                            {editandoId === periodo.idHistorial ? (
                                                <Grid container spacing={3} sx={{ bgcolor: '#f1f5f9', p: 2, borderRadius: 2 }}>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField 
                                                            label="Días Acreditados" 
                                                            type="number"
                                                            fullWidth 
                                                            variant="filled"
                                                            value={formValues.diasAcreditados}
                                                            onChange={(e) => setFormValues({...formValues, diasAcreditados: e.target.value})}
                                                            helperText="Base anual (+)"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField 
                                                            label="Días Debitados" 
                                                            type="number"
                                                            fullWidth 
                                                            variant="filled"
                                                            value={formValues.diasDebitados}
                                                            onChange={(e) => setFormValues({...formValues, diasDebitados: e.target.value})}
                                                            helperText="Gozados (-)"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField 
                                                            label="Saldo Final" 
                                                            type="number"
                                                            fullWidth 
                                                            variant="filled"
                                                            sx={{ "& .MuiFilledInput-root": { bgcolor: "#e0f2f1" } }}
                                                            value={formValues.diasDisponibles}
                                                            onChange={(e) => setFormValues({...formValues, diasDisponibles: e.target.value})}
                                                            helperText="Resultado (=)"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField 
                                                            label="Motivo o Justificación del Ajuste" 
                                                            fullWidth 
                                                            multiline
                                                            rows={2}
                                                            variant="outlined"
                                                            required
                                                            value={formValues.justificacion}
                                                            onChange={(e) => setFormValues({...formValues, justificacion: e.target.value})}
                                                            placeholder="Ej: Corrección por saldos manuales previos o auditoría..."
                                                        />
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <Grid container spacing={2}>
                                                    <Grid item xs={4}>
                                                        <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f0f4f8', borderRadius: 2 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACREDITADOS</Typography>
                                                            <Typography variant="h4" sx={{ fontWeight: 800, color: "success.main" }}>{periodo.totalDiasAcreditados}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f0f4f8', borderRadius: 2 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DEBITADOS</Typography>
                                                            <Typography variant="h4" sx={{ fontWeight: 800, color: "error.main" }}>{periodo.totalDiasDebitados || 0}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#1A237E', borderRadius: 2, color: '#fff' }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', opacity: 0.8 }}>DISPONIBLES</Typography>
                                                            <Typography variant="h4" sx={{ fontWeight: 800 }}>{periodo.diasDisponiblesTotales}</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseModal} color="inherit">
                        Cerrar Ventana
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
        </Box>
    );
};

export default AjusteSaldosPage;
