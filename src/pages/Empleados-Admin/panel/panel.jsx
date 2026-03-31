import React from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PeopleIcon from "@mui/icons-material/People";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import EventIcon from "@mui/icons-material/Event";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import TuneIcon from "@mui/icons-material/Tune";
import GavelIcon from "@mui/icons-material/Gavel";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData.js";
import { useCheckSession } from "../../../services/session/checkSession.js";
import Spinner from "../../../components/spinners/spinner";
import PanelCard from "../../../components/card/cardPanel.jsx";
import Navbar from "../../../components/navBar/NavBar";

export default function ControlPanel() {
  const isSessionVerified = useCheckSession();
  const userData = getLocalStorageData();

  if (!isSessionVerified) {
    return <Spinner />;
  }

  let allowedModules = [];
  try {
    if (userData?.permisosModulos) {
      allowedModules = JSON.parse(userData.permisosModulos);
    }
  } catch (e) {
    console.error("Error parsing permisosModulos:", e);
  }

  const hasAccess = (modulePath) => {
    if (userData.idRol === 1) return true;
    if ((modulePath === "/dashboard-rrhh" || modulePath === "/finiquito-rrhh") && (userData.idRol === 3 || userData.idRol === 1)) return true;
    return allowedModules.includes(modulePath);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f2f5" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: "#1a1a2e", letterSpacing: "-0.5px" }}>
            Panel de Control
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Seleccione un módulo para gestionar el sistema de vacaciones del CNA
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {hasAccess("/dashboard-rrhh") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Dashboard RRHH"
                secondaryText="Estadísticas y panorama general"
                icon={<DashboardIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                to="/dashboard-rrhh"
              />
            </Grid>
          )}
          {hasAccess("/finiquito-rrhh") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Panel de Finiquitos"
                secondaryText="Constancias oficiales por período"
                icon={<DescriptionIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)"
                to="/finiquito-rrhh"
              />
            </Grid>
          )}
          {hasAccess("/ingresar-nuevo-empleado") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Ingresar Empleados"
                secondaryText="Registro de nuevos colaboradores"
                icon={<PersonAddIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                to="/ingresar-nuevo-empleado"
              />
            </Grid>
          )}
          {hasAccess("/lista-de-empleados") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Informe de Empleados"
                secondaryText="Directorio y datos del personal"
                icon={<PeopleIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                to="/lista-de-empleados"
              />
            </Grid>
          )}
          {hasAccess("/vacaciones-empleados") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Reporte de Vacaciones"
                secondaryText="Solicitudes y estados de vacaciones"
                icon={<BeachAccessIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #F97316 0%, #FACC15 100%)"
                to="/vacaciones-empleados"
              />
            </Grid>
          )}
          {hasAccess("/suspensiones") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Suspensiones"
                secondaryText="Gestión de suspensiones laborales"
                icon={<PauseCircleIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #DC2626 0%, #991B1B 100%)"
                to="/suspensiones"
              />
            </Grid>
          )}
          {hasAccess("/dias-festivos") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Días Festivos"
                secondaryText="Configurar feriados institucionales"
                icon={<EventIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                to="/dias-festivos"
              />
            </Grid>
          )}
          {hasAccess("/crear-usuarios-rrhh") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Usuarios RRHH"
                secondaryText="Gestión de accesos y roles"
                icon={<AdminPanelSettingsIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #1e3a5f 0%, #4a90d9 100%)"
                to="/crear-usuarios-rrhh"
              />
            </Grid>
          )}
          {hasAccess("/activar-vacaciones") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Activar Vacaciones"
                secondaryText="Activar beneficio antes del año"
                icon={<PlaylistAddCheckIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #0E7490 0%, #22D3EE 100%)"
                to="/activar-vacaciones"
              />
            </Grid>
          )}
          {hasAccess("/excepcion-limite") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Excepciones de Límite"
                secondaryText="Autorizar >20 días de vacaciones"
                icon={<GavelIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #B45309 0%, #D97706 100%)"
                to="/excepcion-limite"
              />
            </Grid>
          )}
          {hasAccess("/cancelar-vacaciones") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Cancelar Vacaciones"
                secondaryText="Revocar vacaciones programadas"
                icon={<EventBusyIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #374151 0%, #6B7280 100%)"
                to="/cancelar-vacaciones"
              />
            </Grid>
          )}
          {hasAccess("/bitacora") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Bitácora de Cambios"
                secondaryText="Historial de modificaciones"
                icon={<HistoryIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)"
                to="/bitacora"
              />
            </Grid>
          )}
          {hasAccess("/ajustar-saldos") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Ajuste de Saldos"
                secondaryText="Regularizar historial vacacional"
                icon={<TuneIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #4338CA 0%, #6366F1 100%)"
                to="/ajustar-saldos"
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
