import React, { useState, useEffect } from "react";
import {
  Container, Grid, Typography, Box, Card, CardContent, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Avatar, Alert
} from "@mui/material";
import Navbar from "../../../components/navBar/NavBar";
import Spinner from "../../../components/spinners/spinner";
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
import { getEstado } from "../../../config/statusConfig";

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

  if (loading) return <Spinner />;

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
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
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

        {error ? (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>{error}</Alert>
        ) : (
          <>
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
              <Grid item xs={12} md={5}>
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

              {/* Bar Chart */}
              <Grid item xs={12} md={7}>
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
