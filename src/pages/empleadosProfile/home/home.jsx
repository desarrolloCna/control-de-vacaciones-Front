import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Link,
  IconButton,
  CardActionArea,
  Button,
  useTheme
} from "@mui/material";
import Spinner from "../../../components/spinners/spinner";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import InfoIcon from "@mui/icons-material/Info";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { green, blue, purple } from "@mui/material/colors";
import { useDatosLaborales } from "../../../hooks/EmpleadosHooks/useDatosLaboales";
import { useCheckSession } from "../../../services/session/checkSession";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ChartsDashboard from "../../../components/EmpleadosPage/Dashboard/ChartsDashboard.jsx";
import CumpleanerosWidget from "../../../components/EmpleadosPage/home/CumpleanerosWidget";
import api from "../../../config/api.js";
// Original imports restored

const HomePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [frase, setFrase] = useState({ texto: "", autor: "" });
  const { datosLaborales, error, loading } = useDatosLaborales();
  const isSessionVerified = useCheckSession();
  const userData = getLocalStorageData();
  const navigate = useNavigate();
  const theme = useTheme();

  React.useEffect(() => {
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

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 }, 
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

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            {getGreeting()}, {userData?.primerNombre}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Bienvenido al portal de empleados del CNA Sistema
          </Typography>
          {frase.texto && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)', borderLeft: `4px solid #4F46E5`, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontStyle: 'italic', fontWeight: 500, color: theme.palette.mode === 'dark' ? '#E0E7FF' : '#3730A3' }}>
                "{frase.texto}"
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: theme.palette.mode === 'dark' ? '#A5B4FC' : '#4F46E5', fontWeight: 600 }}>
                — {frase.autor}
              </Typography>
            </Paper>
          )}
        </Box>

        <Box className="fade-in">
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              p: 3,
              mb: 4,
              backgroundColor: theme.palette.mode === 'dark' ? "rgba(76, 175, 80, 0.15)" : "rgba(76, 175, 80, 0.1)",
              border: `1px solid ${theme.palette.mode === 'dark' ? green[800] : green[200]}`,
              borderLeft: `6px solid ${green[600]}`,
              borderRadius: 3,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }
            }}
          >
            <NotificationsActiveIcon sx={{ mr: 2, mt: 0.5, color: green[600], fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.mode === 'dark' ? green[400] : green[900] }}>
                Programa tus vacaciones este {dayjs().year()}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? green[200] : green[800], mt: 0.5 }}>
                Recuerde que esto es una obligatoriedad laboral.{" "}
                <Link 
                  component="button" 
                  onClick={() => navigate('/empleados/programar-vacaciones')} 
                  sx={{ fontWeight: "bold", color: theme.palette.mode === 'dark' ? green[300] : green[700], textDecoration: "underline", "&:hover": { color: green[500] } }}
                >
                  Haga clic aquí para programarlas ahora
                </Link>.
              </Typography>
            </Box>
          </Paper>

          <ChartsDashboard />

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    borderRadius: 3,
                    border: `1px solid ${blue[100]}`,
                    borderTop: `4px solid ${blue[500]}`,
                    backgroundColor: "background.paper",
                    transition: "box-shadow 0.2s ease",
                    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: "50%", bgcolor: blue[50], mr: 2 }}>
                      <InfoIcon sx={{ fontSize: 28, color: blue[600] }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Indicaciones
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1, lineHeight: 1.6 }}>
                    Programa tus vacaciones de acuerdo al tiempo establecido y las políticas vigentes de la institución. Planifica con anticipación para asegurar la aprobación oportuna de tu jefe inmediato.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    borderRadius: 3,
                    border: `1px solid ${purple[100]}`,
                    borderTop: `4px solid ${purple[500]}`,
                    backgroundColor: "background.paper",
                    transition: "box-shadow 0.2s ease",
                    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: "50%", bgcolor: purple[50], mr: 2 }}>
                      <HelpOutlineIcon sx={{ fontSize: 28, color: purple[600] }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Centro de Ayuda
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1, lineHeight: 1.6 }}>
                    ¿Dudas sobre tus días disponibles o cómo programar fechas? Consulta los tutoriales paso a paso u <Link href="#" sx={{ fontWeight: 600 }}>observa el Manual de Usuario</Link>.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    borderRadius: 3,
                    border: `1px solid ${green[100]}`,
                    borderTop: `4px solid ${green[500]}`,
                    backgroundColor: "background.paper",
                    transition: "box-shadow 0.2s ease",
                    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: "50%", bgcolor: green[50], mr: 2 }}>
                      <LibraryBooksIcon sx={{ fontSize: 28, color: green[600] }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Seguimiento
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
                    Mantente al tanto del progreso de tus solicitudes. Verifica si han sido enviadas, revisadas, autorizadas o requieren una reprogramación.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="success" 
                    size="small" 
                    onClick={() => navigate('/empleados/programar-vacaciones')}
                    sx={{ width: "fit-content", fontWeight: 600, borderRadius: 2 }}
                  >
                    Ver Solicitudes
                  </Button>
                </Paper>
              </Grid>

              {/* Cumpleañeros Widget */}
              <Grid item xs={12} md={3}>
                <CumpleanerosWidget />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
  );
};

export default HomePage;
