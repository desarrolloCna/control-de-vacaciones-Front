import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Paper, 
  IconButton, Accordion, AccordionSummary, AccordionDetails, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, 
  InputAdornment, Chip, Tooltip as MuiTooltip, Autocomplete
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import DateRangeIcon from "@mui/icons-material/DateRange";
import Sidebar from "../../components/EmpleadosPage/SideBar/SideBar";
import { getLocalStorageData } from "../../services/session/getLocalStorageData";
import { useCheckSession } from "../../services/session/checkSession";
import api from "../../config/api";
import MenuIcon from "@mui/icons-material/Menu";
import dayjs from "dayjs";

export default function DashboardEjecutivo() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isSessionVerified = useCheckSession();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Agrupar empleados por unidad
  const groupedUnits = React.useMemo(() => {
    if (!data?.detalleUnidades) return {};
    return data.detalleUnidades.reduce((acc, emp) => {
      if (!acc[emp.unidad]) acc[emp.unidad] = [];
      acc[emp.unidad].push(emp);
      return acc;
    }, {});
  }, [data]);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get("/reportes/dashboard-ejecutivo");
        setData(res.data);
      } catch (err) {
        console.error("Error trayendo Dashboard Ejecutivo:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  if (!isSessionVerified) return <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>;

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
      <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: "none" }, position: "absolute", top: 10, left: 10, zIndex: 1300 }}>
        <MenuIcon />
      </IconButton>

      {/* Sidebar de Navegación Existente */}
      <Box component="nav" sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}>
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      </Box>

      {/* Contenido Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, ml: { md: "30px" }, mt: { xs: 5, md: 0 } }}>
        
        {/* Header Elegante */}
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#1e293b", display: "flex", alignItems: "center", gap: 1.5 }}>
                <AssuredWorkloadIcon sx={{ color: "#4F46E5", fontSize: 36 }} />
                Dashboard Estratégico Ejecutivo
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#64748b", fontWeight: 500, mt: 0.5 }}>
                Panorama de cumplimiento y operaciones a nivel institucional.
            </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress size={60} /></Box>
        ) : error || !data ? (
          <Alert severity="error">Ocurrió un problema obteniendo las métricas ejecutivas.</Alert>
        ) : (
          <Grid container spacing={3}>
            {/* KPI 1 */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 4, 
                background: "linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)", 
                color: "white", 
                boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" 
              }}>
                <CardContent sx={{ position: "relative", overflow: "hidden" }}>
                  <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1, opacity: 0.8 }}>Plantilla Activa</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>{data.statusHoy.totalEmpleadosActivos}</Typography>
                  <PeopleAltIcon sx={{ position: "absolute", right: -10, bottom: -10, fontSize: 100, opacity: 0.15 }} />
                </CardContent>
              </Card>
            </Grid>


            {/* KPI 2 */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, bgcolor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700 }}>Personal de Vacaciones (Hoy)</Typography>
                  <Typography variant="h3" sx={{ color: "#f59e0b", fontWeight: 900, mt: 1 }}>{data.statusHoy.empleadosDeVacacionesDescansando}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* KPI 3 */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, bgcolor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700 }}>Tasa Aprobación Histórica</Typography>
                  <Typography variant="h3" sx={{ color: "#10b981", fontWeight: 900, mt: 1 }}>
                    {data.resumen.totalSolicitudes > 0 ? Math.round((data.resumen.totalAprobadas / data.resumen.totalSolicitudes) * 100) : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* KPI 4 */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, bgcolor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700 }}>Solicitudes Ingresadas</Typography>
                  <Typography variant="h3" sx={{ color: "#334155", fontWeight: 900, mt: 1 }}>{data.resumen.totalSolicitudes}</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Heatmap/Bar Chart de Unidades */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "400px" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#1e293b" }}>Distribución de Ausencias Autorizadas por Unidad</Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={data.kpiUnidades} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                    <XAxis type="number" />
                    <YAxis dataKey="unidad" type="category" width={150} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 8, border: "none", boxShadow: "-5px 5px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="totalDias" name="Días Invertidos" radius={[0, 4, 4, 0]}>
                      {data.kpiUnidades.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Tendencia de Próximos Retornos */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 4, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "400px", bgcolor: "#1e293b", color: "white" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "white" }}>Proyección de Retornos</Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>Colaboradores que vuelven en los próximos 14 días.</Typography>
                {data.proyeccionRetornos.length === 0 ? (
                  <Box display="flex" height="70%" alignItems="center" justifyItems="center">
                    <Typography color="#94a3b8" textAlign="center" width="100%">No hay retornos cercanos.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="75%">
                    <AreaChart data={data.proyeccionRetornos}>
                        <defs>
                            <linearGradient id="colorRetornos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="fechaRetornoLabores" tickFormatter={(t) => dayjs(t).format("DD MMM")} stroke="#64748b" tick={{ fill: "#94a3b8" }} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ borderRadius: 8, bgcolor: "#0f172a", border: "1px solid #334155" }} />
                        <Area type="monotone" dataKey="cantidad" name="Personas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRetornos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            {/* Explorador de Unidades con Acordeones */}
            <Grid item xs={12}>

              <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <GroupIcon sx={{ color: "#4F46E5" }} />
                  Detalle e Integrantes por Unidad
                </Typography>
                <Autocomplete
                  freeSolo
                  size="small"
                  options={Object.keys(groupedUnits)}
                  value={searchTerm}
                  onInputChange={(event, newValue) => setSearchTerm(newValue)}
                  sx={{ width: { xs: "100%", sm: 350 }, bgcolor: "white", borderRadius: 2 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Catálogo de Unidades o Colaborador..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#4F46E5" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {Object.keys(groupedUnits).map((unidad, idx) => {
                const empleadosFiltrados = groupedUnits[unidad].filter(emp => 
                  emp.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  unidad.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (empleadosFiltrados.length === 0) return null;

                return (
                  <Accordion 
                    key={idx} 
                    sx={{ 
                      mb: 1.5, 
                      borderRadius: "12px !important", 
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      '&:before': { display: 'none' },
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.03)"
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#4F46E5" }} />}>
                      <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", pr: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: "#1e293b" }}>{unidad}</Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {empleadosFiltrados.length} Integrantes
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Colaborador</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Puesto</TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="center">Ingreso</TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">Vacaciones Disp.</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {empleadosFiltrados.map((emp) => (
                              <TableRow key={emp.idEmpleado} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{emp.nombreCompleto}</TableCell>
                                <TableCell sx={{ color: "#64748b", fontSize: "0.85rem" }}>{emp.puesto}</TableCell>
                                <TableCell align="center" sx={{ color: "#64748b", fontSize: "0.85rem" }}>{emp.fechaIngreso}</TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={`${emp.diasDisponibles} días`} 
                                    size="small"
                                    sx={{ 
                                      fontWeight: 700,
                                      bgcolor: emp.diasDisponibles > 60 ? "#fee2e2" : emp.diasDisponibles > 30 ? "#fef3c7" : "#f1f5f9",
                                      color: emp.diasDisponibles > 60 ? "#ef4444" : emp.diasDisponibles > 30 ? "#d97706" : "#475569",
                                    }} 
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Grid>

          </Grid>
        )}
      </Box>
    </Box>
  );
}
