import React, { useState } from "react";
import { Box, Grid, Typography, Avatar, Paper, Container, Fade, Divider, Chip } from "@mui/material";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import BadgeIcon from "@mui/icons-material/Badge";
import EventIcon from "@mui/icons-material/Event";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { useNivelEducativo } from "../../../hooks/EmpleadosHooks/useNivelEducativo";
import { useErrorAlert } from "../../../hooks/LoginHooks/useErrorAlert";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";
import { PageHeader } from "../../../components/UI/UIComponents";

const InfoCard = ({ icon, title, value, color, delay }) => (
  <Fade in={true} timeout={ delay }>
    <Paper
      elevation={4}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        border: "1px solid #f1f5f9",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateX(8px)",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          borderColor: color
        },
      }}
    >
      <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 3, boxShadow: `0 4px 12px ${color}44` }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mt: 0.5 }}>
          {value || "No registrado"}
        </Typography>
      </Box>
    </Paper>
  </Fade>
);

const ProfetionalPage = () => {
  const isSessionVerified = useCheckSession();
  const { nivelEducativo, error, loading } = useNivelEducativo();
  const { alertVisible } = useErrorAlert(error);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  if (loading || !isSessionVerified) return <Spinner />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Box
        component="nav"
        sx={{ width: { xs: mobileOpen ? "260px" : 0, md: "260px" }, flexShrink: { md: 0 }, transition: "width 0.3s ease" }}
      >
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <PageHeader 
            title="Perfil Profesional" 
            subtitle="Información académica, colegiación y especialidad profesional registrada."
          />

          {error ? (
              <ErrorAlert message={error} visible={true} />
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                 <InfoCard 
                    icon={<SchoolIcon />} 
                    title="Nivel de Estudios" 
                    value={nivelEducativo?.nivelDeEstudios} 
                    color="#3f51b5" 
                    delay={400} 
                  />
              </Grid>
              <Grid item xs={12} md={6}>
                 <InfoCard 
                    icon={<BadgeIcon />} 
                    title="Último Título / Nivel" 
                    value={nivelEducativo?.ultimoNivelAlcanzado} 
                    color="#43a047" 
                    delay={500} 
                  />
              </Grid>
              <Grid item xs={12} md={6}>
                 <InfoCard 
                    icon={<EditCalendarIcon />} 
                    title="Año de Egreso / Finalización" 
                    value={nivelEducativo?.añoUltimoNivelCursado ? new Date(nivelEducativo.añoUltimoNivelCursado).getFullYear() : "N/A"} 
                    color="#fb8c00" 
                    delay={600} 
                  />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Colegiación y Profesión" sx={{ fontWeight: 800, bgcolor: '#f1f5f9' }} />
                </Divider>
              </Grid>

              <Grid item xs={12} md={6}>
                 <InfoCard 
                    icon={<WorkIcon />} 
                    title="Profesión Registrada" 
                    value={nivelEducativo?.profesion} 
                    color="#1e293b" 
                    delay={700} 
                  />
              </Grid>

              <Grid item xs={12} md={6}>
                 <InfoCard 
                    icon={<BadgeIcon />} 
                    title="Número de Colegiado" 
                    value={nivelEducativo?.numeroColegiado} 
                    color="#d32f2f" 
                    delay={800} 
                  />
              </Grid>

              <Grid item xs={12} md={6}>
                 <InfoCard 
                    icon={<EventIcon />} 
                    title="Fecha de Colegiación" 
                    value={nivelEducativo?.fechaColegiacion} 
                    color="#00acc1" 
                    delay={900} 
                  />
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProfetionalPage;
