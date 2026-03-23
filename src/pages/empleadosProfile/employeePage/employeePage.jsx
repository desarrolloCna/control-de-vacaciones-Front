import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import Spinner from "../../../components/spinners/spinner";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { deepPurple } from "@mui/material/colors";
import { useDatosLaborales } from "../../../hooks/EmpleadosHooks/useDatosLaboales";
import { useCheckSession } from "../../../services/session/checkSession";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";
import EditEmpleadoModal from "../../../components/EmpleadosPage/EditEmpleadoModal/EditEmpleadoModal";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import DomainIcon from "@mui/icons-material/Domain";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import DescriptionIcon from "@mui/icons-material/Description";
import CommentIcon from "@mui/icons-material/Comment";


import { useNavigate } from "react-router-dom";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { formatDateToDisplay } from "../../../services/utils/dates/vacationUtils";

const EmployeePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { datosLaborales, error, loading } = useDatosLaborales();
  const isSessionVerified = useCheckSession();
  const userData = getLocalStorageData();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (loading || !isSessionVerified) {
    return <Spinner />;
  }

  return (
    <Box sx={{ display: "flex", height: "130vh", backgroundColor: "#f5f5f5" }}>
      {/* Botón de menú para dispositivos móviles */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { md: "none" } }}
      >
        <MenuIcon />
      </IconButton>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { xs: mobileOpen ? "240px" : 0, md: "240px" },
          flexShrink: { md: 0 },
          overflowY: "auto",
          transition: "width 0.3s",
          borderRight: { md: "1px solid #ddd" },
          position: { xs: "absolute", md: "relative" },
          zIndex: 1200,
        }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
      </Box>

      {/* Sección Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: "65px" } }}>
        {error ? (
          <Grid sx={{ mt: 3 }}>
            <ErrorAlert message={error} visible={true} />
          </Grid>
        ) : (
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4, backgroundColor: "#fff" }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 56, height: 56 }}>
                  <BusinessCenterIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#1A237E" }}>
                    Información Laboral
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detalles del puesto y gestión administrativa
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={() => navigate("/empleados/actualizar-datos")}
                sx={{ 
                  borderRadius: 3, 
                  px: 3,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: "0 4px 12px rgba(26, 35, 126, 0.3)",
                  background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
                  '&:hover': {
                    background: "linear-gradient(90deg, #1565C0 0%, #0D47A1 100%)",
                  }
                }}
              >
                Editar Información
              </Button>
            </Box>
            
            <Divider sx={{ mb: 4, opacity: 0.6 }} />

            <Grid container spacing={4}>
              {/* SECCIÓN 1: IDENTIFICACIÓN LABORAL */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#1A237E", display: 'flex', alignItems: 'center' }}>
                  <DomainIcon sx={{ mr: 1 }} /> Identificación Laboral
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: "6px solid #1A237E", height: '100%' }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary' }}>Puesto Actual</Typography>
                        <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>{datosLaborales?.puesto || "Sin datos"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: "6px solid #1976d2", bgcolor: "#e3f2fd", height: '100%' }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#1976d2' }}>Fecha de Ingreso</Typography>
                        <Typography variant="h5" sx={{ mt: 1, fontWeight: 600, color: "#0D47A1" }}>
                           {userData?.fechaIngreso 
                            ? formatDateToDisplay(userData.fechaIngreso) 
                            : (datosLaborales?.fechaIngreso ? formatDateToDisplay(datosLaborales.fechaIngreso) : "Sin datos")}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Unidad</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{datosLaborales?.unidad || "Sin datos"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Coordinación</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{datosLaborales?.coordinacion || "Sin datos"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Renglón</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{datosLaborales?.renglon || "Sin datos"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* SECCIÓN 2: CONTACTO Y PAGOS */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 700, color: "#2E7D32", display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon sx={{ mr: 1 }} /> Compensación y Contacto
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: "6px solid #2E7D32" }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#2E7D32' }}>Salario Mensual</Typography>
                        <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{datosLaborales?.salario ? `Q. ${datosLaborales.salario}` : "Sin datos"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: "6px solid #ED6C02" }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#ED6C02' }}>Cuenta CHN</Typography>
                        <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{datosLaborales?.numeroCuentaCHN || "Sin datos"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: "#f1f8e9" }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon sx={{ mr: 1, color: "#1A237E" }} fontSize="small" />
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Correo Institucional</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main", wordBreak: 'break-all' }}>
                          {datosLaborales?.correoInstitucional || "Sin datos"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} fontSize="small" />
                          <Typography variant="caption">Extensión</Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{datosLaborales?.extensionTelefonica || "N/A"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption">Tipo de Contrato</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{datosLaborales?.tipoContrato || "Sin datos"}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* SECCIÓN 3: DETALLES ADMINISTRATIVOS */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 700, color: "#455A64", display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1 }} /> Detalles de Contratación
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 3, border: "1px solid #e0e0e0" }}>
                      <Typography variant="caption" color="text.secondary">Número de Contrato</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{datosLaborales?.numeroContrato || "N/A"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 3, border: "1px solid #e0e0e0" }}>
                      <Typography variant="caption" color="text.secondary">Número de Acta</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{datosLaborales?.numeroActa || "N/A"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 3, border: "1px solid #e0e0e0" }}>
                      <Typography variant="caption" color="text.secondary">Número de Acuerdo</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{datosLaborales?.numeroAcuerdo || "N/A"}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* OBSERVACIONES */}
              {datosLaborales?.observaciones && (
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: "#fff9c4", borderRadius: 3, border: "1px dashed #fbc02d" }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <CommentIcon sx={{ mr: 2, color: "#fbc02d" }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Observaciones</Typography>
                        <Typography variant="body2">{datosLaborales.observaciones}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default EmployeePage;
