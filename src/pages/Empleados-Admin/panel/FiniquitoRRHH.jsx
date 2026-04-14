import React, { useState, useMemo, useEffect } from "react";
import { 
    Box, Container, Card, CardContent, TextField, Typography, Button, 
    List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, IconButton, Alert, Chip,
    LinearProgress, Tooltip as MuiTooltip, Paper, Tabs, Tab, Stack
} from "@mui/material";
import Navbar from "../../../components/navBar/NavBar";
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BackButton from "../../../components/BackButton/BackButton";
import { useCheckSession } from "../../../services/session/checkSession";
import api from "../../../config/api";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TimelineIcon from "@mui/icons-material/Timeline";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import dayjs from "dayjs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';



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
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const CustomTabPanel = (props) => {
        const { children, value, index, ...other } = props;
        return (
            <div role="tabpanel" hidden={value !== index} {...other}>
                {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
            </div>
        );
    };


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
        // Primero agrupar créditos y débitos globales para los KPIs
        let totalCreditos = 0;
        let totalDebitos = 0;

        historial.forEach(item => {
            const p = item.periodo;
            if (!summary[p]) { summary[p] = { creditos: 0, debitos: 0 }; }
            
            if (item.tipoRegistro === 1) {
                const cred = Number(item.totalDiasAcreditados) || 0;
                summary[p].creditos += cred;
                totalCreditos += cred;
            } else if (item.tipoRegistro === 2) {
                const deb = Number(item.diasSolicitados) || 0;
                summary[p].debitos += deb;
                totalDebitos += deb;
            }
        });

        const periodos = Object.keys(summary).map(p => ({
            periodo: p,
            creditos: summary[p].creditos,
            debitos: summary[p].debitos,
            percentage: summary[p].creditos > 0 ? Math.min(100, (summary[p].debitos / summary[p].creditos) * 100) : 0,
            saldo: summary[p].creditos - summary[p].debitos
        })).sort((a, b) => Number(b.periodo) - Number(a.periodo));

        return { periodos, totalCreditos, totalDebitos };
    };

    const { periodos, totalCreditos, totalDebitos } = getPeriodosSummary();
    const saldoActual = totalCreditos - totalDebitos;

    // Analítica para RRHH
    const getAnaliticaData = () => {
        if (!historial || historial.length === 0) return { monthlyData: [], metrics: { maxDias: 0, avgPerRequest: 0, peakMonth: "N/A", totalRequests: 0 } };
        const debitos = historial.filter(item => item.tipoRegistro === 2);
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const monthlyData = months.map(m => ({ name: m, dias: 0 }));
        let maxDias = 0;
        let totalDias = 0;
        let monthCounts = {};

        debitos.forEach(item => {
            const date = dayjs(item.fechaDebito);
            const monthIdx = date.month();
            const dias = Number(item.diasSolicitados) || 0;
            monthlyData[monthIdx].dias += dias;
            totalDias += dias;
            if (dias > maxDias) maxDias = dias;
            const monthLabel = months[monthIdx];
            monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + dias;
        });

        const avgPerRequest = debitos.length > 0 ? (totalDias / debitos.length).toFixed(1) : 0;
        const peakMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
        return { monthlyData, metrics: { maxDias, avgPerRequest, peakMonth, totalRequests: debitos.length } };
    };

    const { monthlyData, metrics } = getAnaliticaData();



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
                    <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: 4 }}>
                        {loadingHistorial ? (
                            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                        ) : historial.length === 0 ? (
                            <Alert severity="info" sx={{ mb: 2 }}>Este empleado no tiene registros de periodos de vacaciones.</Alert>
                        ) : (
                            <Box>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                    <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" textColor="primary" indicatorColor="primary">
                                        <Tab icon={<AccountBalanceWalletIcon />} label="Resumen" sx={{ fontWeight: 700 }} />
                                        <Tab icon={<TimelineIcon />} label="Analítica" sx={{ fontWeight: 700 }} />
                                    </Tabs>
                                </Box>

                                <CustomTabPanel value={tabValue} index={0}>
                                    {/* Resumen Global (Estado de Cuenta) */}
                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={0} sx={{ p: 2, textAlign: "center", bgcolor: "#E8F5E9", borderRadius: 3, border: "1px solid #C8E6C9" }}>
                                                <Typography variant="overline" sx={{ fontWeight: 700, color: "#2E7D32" }}>Acreditado</Typography>
                                                <Typography variant="h5" sx={{ color: "#1B5E20", fontWeight: 800 }}>+{totalCreditos} días</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={0} sx={{ p: 2, textAlign: "center", bgcolor: "#FFEBEE", borderRadius: 3, border: "1px solid #FFCDD2" }}>
                                                <Typography variant="overline" sx={{ fontWeight: 700, color: "#D32F2F" }}>Consumido</Typography>
                                                <Typography variant="h5" sx={{ color: "#B71C1C", fontWeight: 800 }}>-{totalDebitos} días</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Paper elevation={0} sx={{ p: 2, textAlign: "center", bgcolor: "#E3F2FD", borderRadius: 3, border: "1px solid #BBDEFB" }}>
                                                <Typography variant="overline" sx={{ fontWeight: 700, color: "#1976D2" }}>Saldo Actual</Typography>
                                                <Typography variant="h5" sx={{ color: "#0D47A1", fontWeight: 800 }}>{saldoActual} días</Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight={800} color="#334155">
                                            Balance Detallado por Período
                                        </Typography>
                                        <MuiTooltip title="Cálculo basado en ingresos y solicitudes autorizadas">
                                            <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
                                        </MuiTooltip>
                                    </Box>

                                    <Grid container spacing={2}>
                                        {periodos.map((p) => {
                                            const agotado = p.saldo <= 0;
                                            return (
                                                <Grid item xs={12} sm={6} key={`p-${p.periodo}`}>
                                                    <Card elevation={0} sx={{ 
                                                        borderRadius: 3, 
                                                        border: "1px solid", 
                                                        borderColor: agotado ? '#FEE2E2' : '#E2E8F0',
                                                        bgcolor: agotado ? '#FFF5F5' : 'white'
                                                    }}>
                                                        <CardContent sx={{ p: 2.5 }}>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                                                <Typography variant="subtitle1" fontWeight="800" sx={{ color: "#1E293B" }}>
                                                                    Período {p.periodo}
                                                                </Typography>
                                                                <Chip 
                                                                    label={agotado ? "Agotado" : "Activo"}
                                                                    size="small"
                                                                    sx={{ 
                                                                        fontWeight: 'bold',
                                                                        bgcolor: agotado ? "#EF4444" : "#10B981",
                                                                        color: "white"
                                                                    }}
                                                                />
                                                            </Box>
                                                            
                                                            <Box sx={{ mb: 2 }}>
                                                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                                    <Typography variant="caption" color="text.secondary">Consumo del período</Typography>
                                                                    <Typography variant="caption" fontWeight={700}>{p.debitos} de {p.creditos} días</Typography>
                                                                </Box>
                                                                <LinearProgress 
                                                                    variant="determinate" 
                                                                    value={p.percentage} 
                                                                    sx={{ 
                                                                        height: 6, 
                                                                        borderRadius: 3, 
                                                                        bgcolor: "#F1F5F9",
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: p.percentage >= 100 ? "#EF4444" : "#4F46E5",
                                                                            borderRadius: 3
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>

                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                                    Disponible: {p.saldo} días
                                                                </Typography>
                                                                {agotado && (
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        startIcon={<PrintIcon />}
                                                                        onClick={() => handleDownloadFiniquito(p.periodo)}
                                                                        sx={{ 
                                                                            borderRadius: 2, 
                                                                            textTransform: 'none', 
                                                                            fontSize: '0.75rem',
                                                                            bgcolor: '#EF4444',
                                                                            '&:hover': { bgcolor: '#DC2626' }
                                                                        }}
                                                                    >
                                                                        PDF
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </CustomTabPanel>

                                <CustomTabPanel value={tabValue} index={1}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={7}>
                                            <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0" }}>
                                                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 3 }}>Meses de Mayor Actividad</Typography>
                                                <Box sx={{ height: 300, width: '100%' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={monthlyData}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                            <YAxis axisLine={false} tickLine={false} />
                                                            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                            <Bar dataKey="dias" radius={[4, 4, 0, 0]}>
                                                                {monthlyData?.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.dias > 0 ? '#4F46E5' : '#E2E8F0'} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <Stack spacing={2}>
                                                <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2 }}>
                                                    <TimelineIcon color="primary" />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Mes pico</Typography>
                                                        <Typography variant="h6" fontWeight={800}>{metrics.peakMonth}</Typography>
                                                    </Box>
                                                </Paper>
                                                <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2 }}>
                                                    <ScheduleIcon sx={{ color: "#10B981" }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Promedio solicitud</Typography>
                                                        <Typography variant="h6" fontWeight={800}>{metrics.avgPerRequest} días</Typography>
                                                    </Box>
                                                </Paper>
                                                <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2 }}>
                                                    <AccountBalanceWalletIcon sx={{ color: "#F59E0B" }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Días máximos</Typography>
                                                        <Typography variant="h6" fontWeight={800}>{metrics.maxDias} días</Typography>
                                                    </Box>
                                                </Paper>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CustomTabPanel>
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
