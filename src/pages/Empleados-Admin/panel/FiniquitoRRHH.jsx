import React, { useState, useMemo, useEffect } from "react";
import { 
    Box, Container, Card, CardContent, TextField, Typography, Button, 
    List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, Alert, Chip
} from "@mui/material";
import Navbar from "../../../components/navBar/NavBar";
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BackButton from "../../../components/BackButton/BackButton";
import { useCheckSession } from "../../../services/session/checkSession";
import api from "../../../config/api";

export default function FiniquitoRRHH() {
    useCheckSession();
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const response = await api.get('/employeesList');
                setEmpleados(response.data.responseData.emplloyeesList || []);
            } catch (error) {
                console.error("Error al obtener empleados", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmpleados();
    }, []);

    const empleadosFiltrados = useMemo(() => {
        if (!terminoBusqueda.trim()) return empleados;
        const terminoLower = terminoBusqueda.toLowerCase().trim();
        return empleados?.filter(empleado => 
            empleado.Nombres?.toLowerCase().includes(terminoLower)
        );
    }, [empleados, terminoBusqueda]);

    const handleOpenModal = async (empleado) => {
        setSelectedEmpleado(empleado);
        setModalOpen(true);
        setHistorial([]);
        setLoadingHistorial(true);
        
        try {
            const response = await api.get(`/getHistorial?idEmpleado=${empleado.idEmpleado}`);
            if (response.data && response.data.historial) {
                const periods = response.data.historial.filter(h => h.tipoRegistro === 1);
                setHistorial(periods);
            }
        } catch (error) {
            console.error("Error obteniendo historial:", error);
            alert("No se pudo cargar el historial del empleado.");
        } finally {
            setLoadingHistorial(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmpleado(null);
    };

    /**
     * Descarga el finiquito desde el BACKEND (mismo formato que el del empleado).
     * Usa el endpoint /descargarFiniquito/:idEmpleado/:periodo que genera
     * el PDF con PDFKit, logo CNA, colores institucionales, firmas, etc.
     */
    const handleDownloadFiniquito = async (periodo) => {
        if (!selectedEmpleado) return;
        try {
            const response = await api.get(
                `/descargarFiniquito/${selectedEmpleado.idEmpleado}/${periodo}`,
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(
                new Blob([response.data], { type: 'application/pdf' })
            );
            // Abrir en nueva pestaña para previsualizar (mismo comportamiento que VacationPage)
            const pdfWindow = window.open("", "_blank");
            if (pdfWindow) {
                pdfWindow.document.write(
                    `<html><head><title>Finiquito_${periodo}_${selectedEmpleado.Nombres}</title>
                     <style>body { margin: 0; overflow: hidden; } iframe { width: 100vw; height: 100vh; border: none; }</style></head>
                     <body><iframe src="${url}"></iframe></body></html>`
                );
                pdfWindow.document.close();
            }
            setTimeout(() => window.URL.revokeObjectURL(url), 5000);
        } catch (error) {
            console.error("Error al descargar finiquito:", error);
            alert("No se pudo generar el finiquito. Verifique que el período tenga registros.");
        }
    };

    // Calcular resumen por período
    const getPeriodosSummary = () => {
        const summary = {};
        historial.forEach(item => {
            const p = item.periodo;
            if (!summary[p]) { summary[p] = { creditos: 0, debitos: 0 }; }
            summary[p].creditos += Number(item.totalDiasAcreditados) || 0;
        });
        // Ahora recorrer todos los registros de historial (no solo tipo 1)
        return Object.keys(summary).map(p => ({
            periodo: p,
            saldo: summary[p].creditos - summary[p].debitos
        })).sort((a, b) => Number(b.periodo) - Number(a.periodo));
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            <Navbar />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BackButton />
                    <Typography variant="h4" sx={{ fontWeight: "bold", ml: 2, color: "#1a1a2e" }}>
                        Generación de Finiquitos (PDF)
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Busque al empleado, revise su historial completo y genere la constancia oficial de finiquito por período.
                </Typography>

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

                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                {empleadosFiltrados?.map((empleado) => (
                                    <React.Fragment key={empleado.idEmpleado}>
                                        <ListItem 
                                            sx={{ 
                                                py: 2.5, px: 3, borderRadius: 2, mb: 1,
                                                border: '1px solid transparent',
                                                '&:hover': { bgcolor: '#f1f5f9' }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: '#4F46E5', fontWeight: 'bold' }}>
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
                                                secondary={`Ingreso: ${empleado.fechaIngresoLabores || 'N/A'}`}
                                            />
                                            <Button 
                                                variant="outlined" 
                                                startIcon={<SearchIcon />}
                                                color="primary"
                                                onClick={() => handleOpenModal(empleado)}
                                                sx={{ borderRadius: 4, textTransform: 'none', fontWeight: 'bold' }}
                                            >
                                                Ver Historial y Finiquito
                                            </Button>
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de Historial y Generación */}
                <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">
                                Historial Pre-Finiquito: {selectedEmpleado?.Nombres}
                            </Typography>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: 3 }}>
                        {loadingHistorial ? (
                            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                        ) : historial.length === 0 ? (
                            <Alert severity="info" sx={{ mb: 2 }}>Este empleado no tiene registros de periodos de vacaciones.</Alert>
                        ) : (
                            <Box>
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    <Typography variant="body2">
                                        Total acumulado actual:{' '}
                                        <Box component="span" fontWeight="bold" fontSize="1.1rem">
                                            {historial.reduce((acc, p) => acc + (p.diasDisponiblesTotales || 0), 0)} días pendientes
                                        </Box>
                                    </Typography>
                                </Alert>
                                <Grid container spacing={2}>
                                    {historial.map((periodo) => {
                                        const saldo = periodo.diasDisponiblesTotales || 0;
                                        const agotado = saldo <= 0;
                                        return (
                                            <Grid item xs={12} key={periodo.idHistorial}>
                                                <Card elevation={0} sx={{ borderRadius: 3, border: "2px solid", borderColor: agotado ? '#ef5350' : '#4F46E5' }}>
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                            <Typography variant="h6" fontWeight="800" sx={{ color: "#1A237E", display: 'flex', alignItems: 'center' }}>
                                                                <CalendarTodayIcon sx={{ mr: 1 }} /> Período: {periodo.periodo}
                                                            </Typography>
                                                            <Chip 
                                                                label={agotado ? `Agotado (${saldo} días)` : `Activo (${saldo} días)`}
                                                                color={agotado ? "error" : "success"}
                                                                size="small"
                                                                sx={{ fontWeight: 'bold' }}
                                                            />
                                                        </Box>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={4}>
                                                                <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f0f4f8', borderRadius: 2 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACREDITADOS</Typography>
                                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: "success.main" }}>{periodo.totalDiasAcreditados}</Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f0f4f8', borderRadius: 2 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DEBITADOS</Typography>
                                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: "error.main" }}>{periodo.totalDiasDebitados || 0}</Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#1A237E', borderRadius: 2, color: '#fff' }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', opacity: 0.8 }}>DISPONIBLES</Typography>
                                                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{saldo}</Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>

                                                        {/* Botón de descargar finiquito por período */}
                                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={<PrintIcon />}
                                                                onClick={() => handleDownloadFiniquito(periodo.periodo)}
                                                                sx={{ 
                                                                    borderRadius: 2, 
                                                                    textTransform: 'none', 
                                                                    fontWeight: 'bold',
                                                                    bgcolor: '#4F46E5',
                                                                    '&:hover': { bgcolor: '#3730A3' }
                                                                }}
                                                            >
                                                                Descargar Finiquito - Período {periodo.periodo}
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
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
}
