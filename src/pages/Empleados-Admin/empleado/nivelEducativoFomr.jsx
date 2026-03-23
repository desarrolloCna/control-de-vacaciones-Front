import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import api from "../../../config/api";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../../components/progresBar/ProgresBar";
import Navbar from "../../../components/navBar/NavBar";
import BackButton from "../../../components/BackButton/BackButton";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

function NivelEducativoForm() {
    const isSessionVerified = useCheckSession();
  

  // Pasos para el ProgressBar
  const steps = [
    "DPI",
    "Datos Personales",
    "Datos Familiares",
    "Nivel Educativo",
    "Datos Generales",
    "Empleado Nuevo",
  ];

  // Paso Activo
  const [activeStep, setActiveStep] = useState(3);

  // Estados del formulario
  const [idInfoPersonal, setIdInfoPersonal] = useState(null);
  const [nivelDeEstudios, setNivelDeEstudios] = useState("");
  const [ultimoNivelAlcanzado, setUltimoNivelAlcanzado] = useState("");
  const [anioUltimoNivelCursado, setAnioUltimoNivelCursado] = useState("");
  const [profesion, setProfesion] = useState("");
  const [numeroColegiado, setNumeroColegiado] = useState("");
  const [fechaColegiacion, setFechaColegiacion] = useState("");
  const [nivelesEducativos, setNivelesEducativos] = useState([]);

  // Estados para el loader y alertas
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Obtener idInfoPersonal de localStorage
    const storedData = localStorage.getItem("datosEmpleado");
    if (storedData) {
      const datosEmpleado = JSON.parse(storedData);
      const currentId = datosEmpleado.idInfoPersonal;
      setIdInfoPersonal(currentId);

      if (currentId) {
        setLoading(true);
        getFullEmployeeData(currentId).then((fullData) => {
          if (fullData && fullData.educativo && Object.keys(fullData.educativo).length > 0) {
            const e = fullData.educativo;
            setNivelDeEstudios(e.nivelDeEstudios || "");
            setUltimoNivelAlcanzado(e.ultimoNivelAlcanzado || "");
            setAnioUltimoNivelCursado(e.anioUltimoNivelCursado ? e.anioUltimoNivelCursado.split('T')[0] : "");
            setProfesion(e.profesion || "");
            setNumeroColegiado(e.numeroColegiado || "");
            setFechaColegiacion(e.fechaColegiacion ? e.fechaColegiacion.split('T')[0] : "");
          }
          setLoading(false);
        }).catch(err => {
          console.error("Error cargando nivel educativo previo:", err);
          setLoading(false);
        });
      }
    }

    // Obtener los niveles educativos del servidor
    const fetchNivelesEducativos = async () => {
      try {
        const response = await api.get("/nivelEducativo");
        setNivelesEducativos(response.data.nivelEducativo);
      } catch (error) {
        console.error("Error al obtener los niveles educativos:", error);
      }
    };

    fetchNivelesEducativos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const fechaColegiacionToSend = fechaColegiacion === "" ? null : fechaColegiacion;
    const payload = {
      nivelEducativo: {
        nivelDeEstudios,
        ultimoNivelAlcanzado,
        añoUltimoNivelCursado: anioUltimoNivelCursado, // El nombre en la DB/API parece ser con 'ñ' o 'ano'
        Profesion: profesion,
        numeroColegiado,
        fechaColegiacion: fechaColegiacionToSend,
      }
    };

    try {
      let response;
      if (idInfoPersonal) {
        // En modo edición, usamos actualizarOtrosDatos (PUT)
        response = await api.put(`/actualizarOtrosDatos/${idInfoPersonal}`, payload);
      } else {
        // En modo creación, usamos el endpoint original (POST)
        // Nota: El payload original era plano, no anidado en 'nivelEducativo'
        const payloadPost = {
          idInfoPersonal,
          nivelDeEstudios,
          ultimoNivelAlcanzado,
          anioUltimoNivelCursado,
          profesion,
          numeroColegiado,
          fechaColegiacionToSend,
        };
        response = await api.post("/ingresarNivelEducativo", payloadPost);
      }

      if (response.status === 200) {
        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
          navigate("/datos-generales");
        }, 1000);
      }
    } catch (error) {
      setError("Hubo un error al guardar la información del nivel educativo. Por favor intenta de nuevo.");
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!isSessionVerified) {
    return <Spinner />; // Muestra el spinner mientras se está verificando la sesión
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", pb: 5 }}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <BackButton />
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mt: 2 }}>
          <Box sx={{ mx: "auto", mb: 4 }} maxWidth="md">
            <ProgressBar
              totalSteps={steps.length}
              activeStep={activeStep}
              steps={steps}
              size="md"
            />
          </Box>
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
          Nivel Educativo
        </Typography>
        <Box sx={{ width: "100%" }}>
        {alertVisible && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Información del nivel educativo guardada con éxito.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="nivelDeEstudios-label">Nivel de Estudios</InputLabel>
                <Select
                  labelId="nivelDeEstudios-label"
                  id="nivelDeEstudios"
                  value={nivelDeEstudios}
                  label="Nivel de Estudios"
                  onChange={(e) => setNivelDeEstudios(e.target.value)}
                  startAdornment={<InputAdornment position="start"><SchoolIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {nivelesEducativos.map((nivel) => (
                    <MenuItem key={nivel.idNivelEducativo} value={nivel.nivelEducativo}>
                      {nivel.nivelEducativo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="ultimoNivelAlcanzado"
                label="Último Nivel Alcanzado"
                value={ultimoNivelAlcanzado}
                onChange={(e) => setUltimoNivelAlcanzado(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SchoolIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="anioUltimoNivelCursado"
                label="Año Último Nivel Cursado"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={anioUltimoNivelCursado}
                onChange={(e) => setAnioUltimoNivelCursado(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="profesion"
                label="Profesión"
                value={profesion}
                onChange={(e) => setProfesion(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="numeroColegiado"
                label="Número de Colegiado"
                value={numeroColegiado}
                onChange={(e) => setNumeroColegiado(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="fechaColegiacion"
                label="Fecha de Colegiación"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={fechaColegiacion}
                onChange={(e) => setFechaColegiacion(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large" 
                  disabled={loading}
                  sx={{ 
                    px: 6, 
                    py: 1.5,
                    background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
                    color: "#fff",
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Siguiente Paso"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      </Paper>
    </Container>
    </Box>
    </>
  );
}

export default NivelEducativoForm;
