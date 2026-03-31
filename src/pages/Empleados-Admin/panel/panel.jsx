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

  // Parse allowed modules JSON if it exists
  let allowedModules = [];
  try {
    if (userData?.permisosModulos) {
      allowedModules = JSON.parse(userData.permisosModulos);
    }
  } catch (e) {
    console.error("Error parsing permisosModulos:", e);
  }

  const hasAccess = (modulePath) => {
    if (userData.idRol === 1) return true; // Super Admin has access to everything
    if ((modulePath === "/dashboard-rrhh" || modulePath === "/finiquito-rrhh") && (userData.idRol === 3 || userData.idRol === 1)) return true; // RRHH has custom dashboard access
    return allowedModules.includes(modulePath);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Panel de Control Administrativo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Seleccione un módulo para gestionar el sistema de vacaciones del CNA Sistema
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {hasAccess("/dashboard-rrhh") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Dashboard RRHH"
                secondaryText="Estadísticas y estado general"
                icon={<DashboardIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #FF9800 0%, #E65100 100%)"
                to="/dashboard-rrhh"
              />
            </Grid>
          )}
          {hasAccess("/finiquito-rrhh") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Panel de Finiquitos"
                secondaryText="Calcular saldos y PDF de Bajas"
                icon={<DashboardIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)"
                to="/finiquito-rrhh"
              />
            </Grid>
          )}
          {hasAccess("/ingresar-nuevo-empleado") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Ingresar Empleados"
                secondaryText="Ingresar Empleados nuevos"
                icon={<SaveIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)"
                to="/ingresar-nuevo-empleado"
              />
            </Grid>
          )}
          {hasAccess("/lista-de-empleados") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Informe de Empleados"
                secondaryText="Directorio de empleados ingresados"
                icon={<PeopleIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #7E57C2 0%, #512DA8 100%)"
                to="/lista-de-empleados"
              />
            </Grid>
          )}
          {hasAccess("/vacaciones-empleados") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Reporte de Vacaciones"
                secondaryText="Lista de empleados con vacaciones"
                icon={<BeachAccessIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #4CAF50 0%, #1B5E20 100%)"
                to="/vacaciones-empleados"
              />
            </Grid>
          )}
          {hasAccess("/suspensiones") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Suspensiones"
                secondaryText="Gestión de suspensiones laborales."
                icon={<PauseCircleIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #EF5350 0%, #B71C1C 100%)"
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
                gradientBg="linear-gradient(135deg, #FF9800 0%, #E65100 100%)"
                to="/dias-festivos"
              />
            </Grid>
          )}
          {hasAccess("/crear-usuarios-rrhh") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Usuarios RRHH"
                secondaryText="Gestión de accesos de RRHH."
                icon={<EventIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #EC407A 0%, #880E4F 100%)"
                to="/crear-usuarios-rrhh"
              />
            </Grid>
          )}
          {hasAccess("/activar-vacaciones") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Activar Vacaciones"
                secondaryText="Activar beneficio antes del año"
                icon={<EventIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #8BC34A 0%, #33691E 100%)"
                to="/activar-vacaciones"
              />
            </Grid>
          )}
          {hasAccess("/excepcion-limite") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Excepciones de Límite"
                secondaryText="Autorizar >20 días de vacaciones"
                icon={<EventIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)"
                to="/excepcion-limite"
              />
            </Grid>
          )}
          {hasAccess("/cancelar-vacaciones") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Cancelar Vacaciones"
                secondaryText="Revoque de vacaciones programadas"
                icon={<EventBusyIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #26A69A 0%, #004D40 100%)"
                to="/cancelar-vacaciones"
              />
            </Grid>
          )}
          {hasAccess("/bitacora") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Bitácora de Cambios"
                secondaryText="Historial de modificaciones del sistema"
                icon={<HistoryIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #5C6BC0 0%, #283593 100%)"
                to="/bitacora"
              />
            </Grid>
          )}
          {hasAccess("/ajustar-saldos") && (
            <Grid item xs={12} sm={6} md={4}>
              <PanelCard
                primaryText="Ajuste de Saldos"
                secondaryText="Regularizar historial de vacaciones"
                icon={<HistoryIcon sx={{ color: "#fff" }} />}
                gradientBg="linear-gradient(135deg, #00BCD4 0%, #006064 100%)"
                to="/ajustar-saldos"
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
