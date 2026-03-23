import React from "react";
import { Box, Typography, Grid, Paper, Divider, Avatar, Card, CardContent } from "@mui/material";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import MedicationIcon from "@mui/icons-material/Medication";
import PeopleIcon from "@mui/icons-material/People";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { useDatoMedicos } from "../../../hooks/EmpleadosHooks/useDatosMEdicos";
import { usePertenenciaSoli } from "../../../hooks/EmpleadosHooks/usePertenenciaSoli";

const GeneralInfoPage = () => {
  const isSessionVerified = useCheckSession();
  const { datosMedicos, errorDM, loadingDM } = useDatoMedicos();
  const { datosSoli, errorSL, loadingSL } = usePertenenciaSoli();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  if (loadingDM || loadingSL || !isSessionVerified) return <Spinner />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 }, ml: { md: '260px' } }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: "#1A237E" }}>
          Información General
        </Typography>
        <Typography variant="body1" sx={{ mb: 5, color: "text.secondary", fontWeight: 500 }}>
          Detalles de salud, pertenencia sociolingüística y datos adicionales de tu expediente.
        </Typography>

        <Box sx={{ maxWidth: '1000px' }}>
          {/* Información Médica */}
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, color: "#1A237E", display: 'flex', alignItems: 'center' }}>
            <MedicalServicesIcon sx={{ mr: 2, fontSize: 35 }} />
            Estado de Salud y Médicos
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: datosMedicos?.discapacidad === 'Si' ? '#fff9c4' : '#f5f5f5', borderLeft: "6px solid #1976d2" }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: "#1976d2", mr: 2 }}>
                    <AccessibilityNewIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DISCAPACIDAD</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{datosMedicos?.discapacidad || "No especificado"}</Typography>
                    {datosMedicos?.tipoDiscapacidad && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        Tipo: <strong>{datosMedicos.tipoDiscapacidad}</strong>
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: "#fff", borderLeft: "6px solid #d32f2f" }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: "#d32f2f", mr: 2 }}>
                    <BloodtypeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>TIPO DE SANGRE</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: "#d32f2f" }}>{datosMedicos?.tipoSangre || "---"}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: datosMedicos?.sufreAlergia === 'Si' ? '#ffebee' : '#f1f8e9', borderLeft: "6px solid #e91e63" }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: "#e91e63", mr: 2 }}>
                    <MedicationIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ALERGIAS</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{datosMedicos?.sufreAlergia || "---"}</Typography>
                    {datosMedicos?.descipcionAlergia && (
                      <Typography variant="body2" sx={{ color: '#c2185b', fontWeight: 600 }}>{datosMedicos.descipcionAlergia}</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: "#fff", borderLeft: "6px solid #7b1fa2" }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: "#7b1fa2", mr: 2 }}>
                    <MedicalServicesIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>TRATAMIENTO MÉDICO</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{datosMedicos?.tratamientoMedico || "Ninguno registrado"}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Pertenencia Sociolingüística */}
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, mt: 4, color: "#1A237E", display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 2, fontSize: 35 }} />
            Identidad Sociolingüística
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: 'center', bgcolor: '#f3e5f5', border: '1px solid #ce93d8' }}>
                <Avatar sx={{ bgcolor: "#8e24aa", width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <PeopleIcon fontSize="large" />
                </Avatar>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>ETNIA / PUEBLO</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: "#4a148c" }}>{datosSoli?.etnia || "---"}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: 'center', bgcolor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
                <Avatar sx={{ bgcolor: "#2e7d32", width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <PeopleIcon fontSize="large" />
                </Avatar>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>COMUNIDAD LINGÜÍSTICA</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: "#1b5e20" }}>{datosSoli?.comunidadLinguistica || "---"}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default GeneralInfoPage;
