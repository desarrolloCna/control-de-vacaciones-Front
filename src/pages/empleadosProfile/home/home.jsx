import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  IconButton,
  Button,
  useTheme,
  Avatar,
  LinearProgress,
  Chip,
  Divider,
} from "@mui/material";
import Spinner from "../../../components/spinners/spinner";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HistoryIcon from "@mui/icons-material/History";
import { useDatosLaborales } from "../../../hooks/EmpleadosHooks/useDatosLaboales";
import { useCheckSession } from "../../../services/session/checkSession";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import api from "../../../config/api.js";
import CumpleanerosWidget from "../../../components/EmpleadosPage/home/CumpleanerosWidget";
import ChartsDashboard from "../../../components/EmpleadosPage/Dashboard/ChartsDashboard.jsx";

dayjs.locale('es');

const HomePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [frase, setFrase] = useState({ texto: "", autor: "" });
  const { datosLaborales, loading } = useDatosLaborales();
  const isSessionVerified = useCheckSession();
  const userData = getLocalStorageData();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchFrase = async () => {
      try {
        const response = await api.get(`/frases-motivadoras`);
        if (response.data.exito) {
          setFrase(response.data.data);
        }
      } catch (error) {
        console.error("Error al obtener frase:", error);
      }
    };
    fetchFrase();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loading || !isSessionVerified) {
    return <Spinner />;
  }

  // Cálculos para la barra de progreso
  const diasDisponibles = datosLaborales?.diasDisponibles || 0;
  const diasProporcionales = datosLaborales?.diasProporcionales || 0;
  const totalDias = Math.max(20, diasDisponibles + diasProporcionales); // Asumiendo 20 dias como base estandar anual
  const porcentajeDisponibles = Math.min(100, ((diasDisponibles + diasProporcionales) / totalDias) * 100);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 }, 
          ml: { md: '250px' },
          width: { md: `calc(100% - 250px)` },
          transition: "all 0.3s"
        }}
      >
        <Box sx={{ display: { md: 'none' }, mb: 2 }}>
          <IconButton onClick={handleDrawerToggle} color="primary">
            <MenuIcon />
          </IconButton>
        </Box>

        {/* HERO SECTION - Bóveda Personal */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 4,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)' 
              : 'linear-gradient(135deg, #312E81 0%, #4F46E5 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'light' ? '0 10px 30px rgba(79, 70, 229, 0.3)' : 'none'
          }}
        >
          {/* Círculos decorativos */}
          <Box sx={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <Box sx={{ position: 'absolute', bottom: -50, right: 150, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

          <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar 
                  sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)' }}
                >
                  {userData?.primerNombre?.[0]}{userData?.primerApellido?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-1px' }}>
                    {getGreeting()}, {userData?.primerNombre} 👋
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {userData?.puesto} • {userData?.unidad}
                  </Typography>
                </Box>
              </Box>

              {frase.texto && (
                <Box sx={{ mt: 3, pl: 2, borderLeft: '3px solid rgba(255,255,255,0.3)' }}>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', fontWeight: 500, opacity: 0.9 }}>
                    "{frase.texto}"
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7, fontWeight: 600 }}>
                    — {frase.autor}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* KPI Días Disponibles */}
            <Grid item xs={12} md={5}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tu Balance de Vacaciones
                  </Typography>
                  <BeachAccessIcon sx={{ opacity: 0.8 }} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography variant="h2" sx={{ fontWeight: 800 }}>
                    {diasDisponibles + diasProporcionales}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 500 }}>
                    días disponibles
                  </Typography>
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={porcentajeDisponibles} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#10B981' },
                    mb: 2
                  }} 
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      bgcolor: '#fff', 
                      color: '#1E1B4B', 
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#f1f5f9' },
                      px: 3
                    }}
                    onClick={() => navigate('/empleados/programar-fecha')}
                  >
                    Solicitar
                  </Button>
                  <Button 
                    variant="outlined" 
                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    onClick={() => navigate('/empleados/programar-vacaciones')}
                  >
                    Historial
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* ACCIONES RÁPIDAS Y WIDGETS */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Panel Izquierdo: Acciones Rápidas */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={3}>
              {/* Tarjeta 1 */}
              <Grid item xs={12} sm={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => navigate('/empleados/programar-fecha')}
                >
                  <Box sx={{ p: 1.5, borderRadius: 2, color: 'primary.main', display: 'inline-block', mb: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }}>
                    <EventAvailableIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Programar</Typography>
                  <Typography variant="body2" color="text.secondary">Inicia una nueva solicitud de vacaciones para revisión.</Typography>
                </Paper>
              </Grid>

              {/* Tarjeta 2 */}
              <Grid item xs={12} sm={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'info.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => navigate('/empleados/programar-vacaciones')}
                >
                  <Box sx={{ p: 1.5, borderRadius: 2, color: 'info.main', display: 'inline-block', mb: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }}>
                    <HistoryIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Seguimiento</Typography>
                  <Typography variant="body2" color="text.secondary">Revisa el estado actual de tus solicitudes previas.</Typography>
                </Paper>
              </Grid>

              {/* Tarjeta 3 */}
              <Grid item xs={12} sm={4}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'warning.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ p: 1.5, borderRadius: 2, color: 'warning.main', display: 'inline-block', mb: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }}>
                    <AccessTimeIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Manual de Uso</Typography>
                  <Typography variant="body2" color="text.secondary">Aprende a navegar por el sistema con nuestras guías.</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* DASHBOARD CHARTS */}
            <Box sx={{ mt: 5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Panorama General
              </Typography>
              <ChartsDashboard />
            </Box>

          </Grid>

          {/* Panel Derecho: Widgets Secundarios */}
          <Grid item xs={12} md={4}>
            {/* Widget de Próximos Eventos / Finiquito */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Tu Información
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Fecha de Ingreso</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{dayjs(userData?.fechaIngreso).format('DD MMMM YYYY')}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Estado Laboral</Typography>
                  <Chip label="Activo" size="small" color="success" />
                </Box>
              </Box>
            </Paper>

            <Box sx={{ maxHeight: 350, overflow: 'hidden' }}>
              <CumpleanerosWidget />
            </Box>
          </Grid>
        </Grid>
        
      </Box>
    </Box>
  );
};

export default HomePage;
