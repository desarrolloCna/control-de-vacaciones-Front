import React, { useState, useMemo, useEffect } from "react";
import { 
    Box, Container, Card, CardContent, TextField, Typography, Button, 
    List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, Alert
} from "@mui/material";
import Navbar from "../../../components/navBar/NavBar";
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BackButton from "../../../components/BackButton/BackButton";
import { useCheckSession } from "../../../services/session/checkSession";
import api from "../../../config/api";
import { jsPDF } from "jspdf";

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
                // Obtener lista completa (incluso bajas si es posible) o empleados regulares
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
                // Filtramos por tipoRegistro = 1 para mostrar solo los periodos de acreditacion base
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

    const generarPdfFiniquito = async () => {
        if (!selectedEmpleado) return;
        const empleado = selectedEmpleado;
        const periodos = historial;
        
        try {
            const totalDiasPendientes = periodos.reduce((acc, p) => acc + (p.diasDisponiblesTotales || 0), 0);
            
            // Usar jsPDF para un documento elegante
            const doc = new jsPDF();
            
            // 1. Membrete
            doc.setFontSize(22);
            doc.setTextColor(26, 35, 126); // Azul institucional
            doc.text("Consejo Nacional de Adopciones", 105, 30, { align: "center" });
            
            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text("Departamento de Recursos Humanos", 105, 40, { align: "center" });
            
            // Línea separadora
            doc.setDrawColor(245, 166, 35); // Naranja institucional
            doc.setLineWidth(1);
            doc.line(20, 45, 190, 45);

            // 2. Título
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text("CONSTANCIA DE SALDOS DE VACACIONES", 105, 60, { align: "center" });

            // 3. Cuerpo del documento
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            const bodyText = `Por medio de la presente se hace constar que el colaborador(a) ${empleado.Nombres}, laborando bajo la unidad de ${empleado.unidad || 'Asignación General'}, tiene a la fecha un saldo total a su favor de ${totalDiasPendientes} día(s) hábiles en concepto de vacaciones acumuladas pre-finiquito.`;
            
            const splitBody = doc.splitTextToSize(bodyText, 170);
            doc.text(splitBody, 20, 80);

            // 4. Detalle
            doc.setFont("helvetica", "bold");
            doc.text("Detalle por período:", 20, 110);
            
            doc.setFont("helvetica", "normal");
            let yPos = 120;
            periodos.forEach((p, index) => {
                const fila = `- Período ${p.periodo}: ${p.diasDisponiblesTotales} días disponibles`;
                doc.text(fila, 25, yPos);
                yPos += 10;
            });

            // 5. Fecha y Firma
            const fechaHoy = new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
            doc.text(`Emitido en Ciudad de Guatemala, el ${fechaHoy}.`, 20, yPos + 20);

            doc.line(70, yPos + 50, 140, yPos + 50);
            doc.text("Firma Autorizada RRHH", 105, yPos + 60, { align: "center" });

            // Generar y descargar PDF forzando el nombre con Blob
            const nombreArchivo = `Finiquito_${empleado.Nombres.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = nombreArchivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
            
        } catch (error) {
            console.error("Error generando PDF: ", error);
            alert("Hubo un problema procesando el PDF.");
        }
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
                    Busque al empleado y genere el documento oficial de constancia de días pendientes (membrado CNA).
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
                                                <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 'bold' }}>
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
                            <Typography variant="h6" fontWeight="bold">Historial Pre-Finiquito: {selectedEmpleado?.Nombres}</Typography>
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
                                    {historial.map((periodo) => (
                                        <Grid item xs={12} key={periodo.idHistorial}>
                                            <Card elevation={0} sx={{ borderRadius: 3, border: "2px solid #e2e8f0" }}>
                                                <CardContent sx={{ p: 3 }}>
                                                    <Typography variant="h6" fontWeight="800" sx={{ color: "#1A237E", display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <CalendarTodayIcon sx={{ mr: 1, fontSize: 'large' }} /> Período: {periodo.periodo}
                                                    </Typography>
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
                                                                <Typography variant="h5" sx={{ fontWeight: 800 }}>{periodo.diasDisponiblesTotales}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseModal} color="inherit" sx={{ mr: 2 }}>
                            Cerrar Ventana
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<PrintIcon />}
                            onClick={generarPdfFiniquito}
                            disabled={loadingHistorial || historial.length === 0}
                            sx={{ fontWeight: 'bold', px: 3, borderRadius: 2, bgcolor: '#0D47A1' }}
                        >
                            Generar Constancia PDF Oficial
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
