import React, { useState, useEffect } from "react";
import {
  Container, Grid, Typography, Box, Card, CardContent, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Avatar, Alert, Button, CircularProgress,
  Menu, MenuItem, ListItemIcon, ListItemText, FormControl, InputLabel, Select
} from "@mui/material";
import Navbar from "../../../components/navBar/NavBar";
import { PageLoader, ContentLoader } from "../../../components/Loaders/Loaders";
import api from "../../../config/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import BackButton from "../../../components/BackButton/BackButton";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import TableViewIcon from "@mui/icons-material/TableView";
import TvIcon from "@mui/icons-material/Tv";
import { getEstado } from "../../../config/statusConfig";
import AlertasWidget from "../../../components/AlertasAcumulacion/AlertasWidget";

// Colores institucionales para el gráfico de pie
const ESTADO_COLORS = {
  enviada: "#FF9800",
  autorizadas: "#4CAF50",
  rechazada: "#F44336",
  finalizadas: "#2196F3",
  reprogramacion: "#9C27B0",
  cancelada: "#795548",
};

// KPI Card premium
const KpiCard = ({ icon, title, value, subtitle, gradient, iconBg }) => (
  <Card
    sx={{
      borderRadius: 4,
      overflow: "hidden",
      position: "relative",
      background: gradient,
      color: "#fff",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 28px rgba(0,0,0,0.15)" },
    }}
  >
    <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.75, mt: 1, display: "block" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: iconBg || "rgba(255,255,255,0.2)",
            width: 56, height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
    {/* Decorative circle */}
    <Box
      sx={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.08)",
      }}
    />
  </Card>
);

export default function DashboardRRHH() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const downloadMenuOpen = Boolean(anchorEl);

  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("Todas");

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const response = await api.get(`/unidades`);
        const data = response.data.departamentos.filter((u) => u.estado === "A");
        setUnidades(data);
      } catch (error) {
        console.log("Error al obtener las unidades", error);
      }
    };
    fetchUnidades();
  }, []);

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadPDF = async () => {
    handleDownloadClose();
    try {
      setDownloadingPdf(true);
      const res = await api.get("/reportes/pdf-ejecutivo", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte-ejecutivo-cna.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando el PDF:", err);
      setError("No se pudo generar el reporte PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async (tipo) => {
    handleDownloadClose();
    try {
      setDownloadingPdf(true);
      let endpoint = tipo === 'saldos' ? '/reportes/excel/saldos' : '/reportes/excel/solicitudes';
      if (selectedUnidad !== "Todas") {
          endpoint += `?unidad=${encodeURIComponent(selectedUnidad)}`;
      }
      const fileNameSuffix = selectedUnidad !== "Todas" ? `_${selectedUnidad.replace(/ /g, '_')}` : "";
      const filename = tipo === 'saldos' ? `Saldos_Empleados${fileNameSuffix}.xlsx` : `Solicitudes_Mes${fileNameSuffix}.xlsx`;
      
      const res = await api.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error descargando el Excel de ${tipo}:`, err);
      setError(`No se pudo generar el Excel de ${tipo}.`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/reportes/dashboard");
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("No se pudo cargar la información del dashboard. Verifique que la API esté disponible.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <PageLoader />;

  // Pie chart data
  const pieData = dashboardData?.distribucionEstados
    ? Object.keys(dashboardData.distribucionEstados)
        .filter((k) => dashboardData.distribucionEstados[k] > 0)
        .map((key) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: dashboardData.distribucionEstados[key],
          color: ESTADO_COLORS[key] || "#607D8B",
        }))
    : [];

  // Bar chart data (same data, different visualization)
  const barData = pieData.map((d) => ({ name: d.name, cantidad: d.value }));

  const kpis = dashboardData?.kpis || {};
  const recientes = dashboardData?.solicitudesRecientes || [];
  
  // Lógica de Cumplimiento Institucional
  const conVacaciones = kpis.empleadosConVacaciones || 0;
  const totalEmpleados = kpis.totalEmpleados || 1;
  const cumplimientoPct = Math.round((conVacaciones / totalEmpleados) * 100);
  const gaugeColor = cumplimientoPct >= 70 ? "#10B981" : cumplimientoPct >= 40 ? "#F59E0B" : "#EF4444";
  const statusLabel = cumplimientoPct >= 70 ? "Excelente" : cumplimientoPct >= 40 ? "En progreso" : "Alerta";
  const gaugeData = [
    { name: "Con Vacaciones", value: cumplimientoPct },
    { name: "Sin Vacaciones", value: 100 - cumplimientoPct }
  ];

  const renderEstadoChip = (estado) => {
    const key = (estado || "").toLowerCase();
    const config = getEstado(key) || { color: "#9e9e9e", label: estado || "?", textColor: "#fff" };
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{ bgcolor: config.color, color: config.textColor, fontWeight: 700, fontSize: "0.7rem" }}
      />
    );
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return d; }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f2f5" }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <BackButton />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.5px" }}>
                Dashboard de Recursos Humanos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Panorama general del sistema de vacaciones del CNA
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<TvIcon />}
              onClick={() => window.open("/kiosco", "_blank")}
              sx={{
                mr: 2,
                color: "#4F46E5",
                borderColor: "#4F46E5",
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: "rgba(79, 70, 229, 0.08)", borderColor: "#4338CA" }
              }}
            >
              Pantalla Kiosco
            </Button>
            
            <FormControl sx={{ minWidth: 220, mr: 2 }} size="small">
              <InputLabel id="filtro-unidad-label">Filtrar Unidad</InputLabel>
              <Select
                labelId="filtro-unidad-label"
                value={selectedUnidad}
                label="Filtrar Unidad"
                onChange={(e) => setSelectedUnidad(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              >
                <MenuItem value="Todas"><strong>📋 Todas las Unidades</strong></MenuItem>
                {unidades.map(u => (
                  <MenuItem key={u.idUnidad} value={u.nombreUnidad}>{u.nombreUnidad}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              startIcon={downloadingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDownloadClick}
              disabled={downloadingPdf}
              sx={{ 
                bgcolor: "#1A237E", 
                color: "white", 
                fontWeight: 700,
                borderRadius: "20px",
                textTransform: "none",
                '&:hover': { bgcolor: "#0D47A1" }
              }}
            >
              {downloadingPdf ? "Generando..." : "Exportar"}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={downloadMenuOpen}
              onClose={handleDownloadClose}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1, borderRadius: 2, minWidth: 200 }
              }}
            >
              <MenuItem onClick={handleDownloadPDF}>
                <ListItemIcon>
                  <PictureAsPdfIcon fontSize="small" sx={{ color: '#EF4444' }} />
                </ListItemIcon>
                <ListItemText primary="Reporte Ejecutivo (PDF)" />
              </MenuItem>
              <MenuItem onClick={() => handleDownloadExcel('saldos')}>
                <ListItemIcon>
                  <TableViewIcon fontSize="small" sx={{ color: '#10B981' }} />
                </ListItemIcon>
                <ListItemText primary="Saldos de Empleados (Excel)" />
              </MenuItem>
              <MenuItem onClick={() => handleDownloadExcel('solicitudes')}>
                <ListItemIcon>
                  <TableViewIcon fontSize="small" sx={{ color: '#10B981' }} />
                </ListItemIcon>
                <ListItemText primary="Solicitudes del Mes (Excel)" />
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
            {/* Widget de Alertas */}
            <AlertasWidget />

            {/* KPI Cards Row */}
            <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                  icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
                  title="Solicitudes Totales"
                  value={kpis.totalGlobal || 0}
                  subtitle={`${kpis.totalMes || 0} este mes`}
                  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                  icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
                  title="Tasa de Aprobación"
                  value={`${kpis.tasaAprobacion || 0}%`}
                  subtitle="Autorizadas + Finalizadas"
                  gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                  icon={<CalendarTodayIcon sx={{ fontSize: 28 }} />}
                  title="Promedio Días/Solicitud"
                  value={kpis.promedioDias || 0}
                  subtitle="Días hábiles promedio"
                  gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                  icon={<PeopleIcon sx={{ fontSize: 28 }} />}
                  title="Empleados Activos"
                  value={kpis.totalEmpleados || 0}
                  subtitle="En el sistema actual"
                  gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                />
              </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Pie Chart */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <TrendingUpIcon sx={{ color: "#4F46E5", mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                        Distribución de Estados
                      </Typography>
                    </Box>
                    {pieData.length === 0 ? (
                      <Alert severity="info">No hay solicitudes para graficar.</Alert>
                    ) : (
                      <Box sx={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={110}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Cumplimiento Institucional */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <TrendingUpIcon sx={{ color: gaugeColor, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                        Cumplimiento Institucional
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <Box sx={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={gaugeData}
                              cx="50%"
                              cy="100%"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={0}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell key="cell-completed" fill={gaugeColor} />
                              <Cell key="cell-pending" fill="#E5E7EB" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Box sx={{ position: "absolute", bottom: 20, textAlign: "center" }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: gaugeColor }}>
                          {cumplimientoPct}%
                        </Typography>
                        <Chip 
                          label={statusLabel} 
                          size="small" 
                          sx={{ mt: 1, bgcolor: `${gaugeColor}22`, color: gaugeColor, fontWeight: 700 }} 
                        />
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{conVacaciones}</strong> de {totalEmpleados} empleados han tomado vacaciones este año.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Bar Chart */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AssignmentIcon sx={{ color: "#4F46E5", mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                        Solicitudes por Estado
                      </Typography>
                    </Box>
                    {barData.length === 0 ? (
                      <Alert severity="info">No hay datos para mostrar.</Alert>
                    ) : (
                      <Box sx={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                              {barData.map((entry, index) => (
                                <Cell key={`bar-${index}`} fill={pieData[index]?.color || "#4F46E5"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Solicitudes Recientes Table */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <AssignmentIcon sx={{ color: "#4F46E5", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                    Solicitudes Recientes
                  </Typography>
                </Box>
                {recientes.length === 0 ? (
                  <Alert severity="info">No hay solicitudes recientes.</Alert>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8e8e8" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f9ff" }}>
                          {["Correlativo", "Empleado", "Estado", "Días", "Inicio", "Fin"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, color: "#4F46E5", fontSize: "0.8rem" }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recientes.map((sol, i) => (
                          <TableRow
                            key={sol.idSolicitud || i}
                            hover
                            sx={{
                              "&:last-child td": { border: 0 },
                              transition: "background 0.2s",
                            }}
                          >
                            <TableCell sx={{ fontWeight: 600, color: "#333" }}>
                              {sol.correlativo || `SOL-${sol.idSolicitud}`}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "#4F46E5", mr: 1 }}>
                                  {(sol.nombreEmpleado || "?").charAt(0)}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {sol.nombreEmpleado || "—"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{renderEstadoChip(sol.estadoSolicitud)}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700}>
                                {sol.cantidadDiasSolicitados || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                                {formatDate(sol.fechaInicioVacaciones)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                                {formatDate(sol.fechaFinVacaciones)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}
