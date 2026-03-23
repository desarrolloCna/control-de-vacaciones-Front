import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, Divider, IconButton, Alert } from "@mui/material";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import EditEmpleadoModal from "../../../components/EmpleadosPage/EditEmpleadoModal/EditEmpleadoModal";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";
import Spinner from "../../../components/spinners/spinner";
import MenuIcon from "@mui/icons-material/Menu";
import EditIcon from "@mui/icons-material/Edit";
import { PageHeader } from "../../../components/UI/UIComponents";

const ActualizarDatosPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = getLocalStorageData();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.idInfoPersonal) {
          const data = await getFullEmployeeData(userData.idInfoPersonal);
          setEmployeeData(data);
        } else {
          setError("No se encontró información del empleado para el usuario actual.");
        }
      } catch (err) {
        setError("Error al cargar los datos del empleado.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { md: "none" }, position: "absolute", top: 16, left: 16, zIndex: 1300 }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{
          width: { xs: mobileOpen ? "250px" : 0, md: "250px" },
          flexShrink: { md: 0 },
          transition: "width 0.3s ease",
          position: { xs: "absolute", md: "relative" },
          zIndex: 1200,
        }}
      >
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <PageHeader 
            title="Actualización de Datos" 
            subtitle="Mantén tu expediente actualizado con tu información personal, educativa y médica."
            showBack={true}
          />

          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <EditIcon sx={{ fontSize: 80, color: "primary.main", mb: 2, opacity: 0.8 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Mantén tu expediente actualizado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
                Desde esta sección puedes modificar tu información personal, educativa y médica. 
                Recuerda que la información laboral solo puede ser modificada por el departamento de Recursos Humanos.
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              {/* Aquí reutilizamos el modal abriéndolo directamente o podemos incrustar su contenido */}
              {/* Por simplicidad y consistencia, abriremos el modal diseñado anteriormente */}
              <EditEmpleadoModal 
                open={true} 
                onClose={() => {}} // No se cierra en esta vista de página
                employeeData={employeeData} 
                isAdmin={userData?.idRol === 1 || userData?.idRol === 3}
                isEmbedded={true} // Pasamos flag si queremos quitar el Dialog wrapper
              />
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default ActualizarDatosPage;
