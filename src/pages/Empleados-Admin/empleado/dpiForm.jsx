import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import BadgeIcon from '@mui/icons-material/Badge';
import MapIcon from '@mui/icons-material/Map';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import EventIcon from '@mui/icons-material/Event';
import api from "../../../config/api";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../../components/progresBar/ProgresBar";
import Navbar from "../../../components/navBar/NavBar";
import BackButton from "../../../components/BackButton/BackButton";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

//Formulario para ingreso de datos del documento de identificacion
function DocumentForm() {
  const isSessionVerified = useCheckSession();

  /*Setear datos del formulario */
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [departamentoExpedicion, setDepartamentoExpedicion] = useState("");
  const [municipioExpedicion, setMunicipioExpedicion] = useState("");
  const [fechaVencimientoDpi, setFechaVencimientoDpi] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);

  //Estados de los componentes
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener la lista de departamentos desde el servidor
    const fetchDepartamentos = async () => {
      try {
        const response = await api.get("/departamentos");
        setDepartamentos(response.data.departamentos);
      } catch (error) {
        console.error("Error al obtener la lista de departamentos:", error);
      }
    };

    // Función para obtener la lista de municipios desde el servidor
    const fetchMunicipios = async () => {
      try {
        const response = await api.get("/municipios");
        setMunicipios(response.data.municipios);
      } catch (error) {
        console.error("Error al obtener la lista de municipios:", error);
      }
    };

    fetchDepartamentos();
    fetchMunicipios();

    // Recuperar datos si ya hay un proceso iniciado
    const storedData = localStorage.getItem("datosEmpleado");
    if (storedData) {
      const datosEmpleado = JSON.parse(storedData);
      if (datosEmpleado.idInfoPersonal) {
        setLoading(true);
        getFullEmployeeData(datosEmpleado.idInfoPersonal).then((fullData) => {
          if (fullData && fullData.dpi && Object.keys(fullData.dpi).length > 0) {
            const d = fullData.dpi;
            setNumeroDocumento(d.numeroDocumento || "");
            setDepartamentoExpedicion(d.departamentoExpedicion || "");
            setMunicipioExpedicion(d.municipioExpedicion || "");
            setFechaVencimientoDpi(d.fechaVencimientoDpi ? d.fechaVencimientoDpi.split('T')[0] : "");
          }
          setLoading(false);
        }).catch(err => {
          console.error("Error recuperando DPI:", err);
          setLoading(false);
        });
      }
    }
  }, []);

  // Efecto separado para filtrar municipios iniciales cuando ya se tienen tanto los datos del empleado como el catálogo
  useEffect(() => {
    if (departamentoExpedicion && municipios.length > 0) {
      const filtered = municipios.filter(
        (m) => Math.floor(m.idMunicipio / 100) === parseInt(departamentoExpedicion)
      );
      setMunicipiosFiltrados(filtered);
    }
  }, [departamentoExpedicion, municipios]);

  const steps = [
    "DPI",
    "Datos Personales",
    "Datos Familiares",
    "Nivel Educativo",
    "Datos Generales",
    "Empleado Nuevo",
  ];

  const handleDepartamentoChange = (event) => {
    const departamentoId = event.target.value;
    setDepartamentoExpedicion(departamentoId);
    setMunicipioExpedicion(""); // Resetear municipio cuando cambia el departamento

    // Filtrar municipios basados en el departamento seleccionado
    // Los municipios tienen idMunicipio que empieza con el id del departamento
    const filteredMunicipios = municipios.filter(
      (municipio) => Math.floor(municipio.idMunicipio / 100) === parseInt(departamentoId)
    );
    setMunicipiosFiltrados(filteredMunicipios);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const storedData = localStorage.getItem("datosEmpleado");
      const empleadoLog = storedData ? JSON.parse(storedData) : {};
      const currentIdInfo = empleadoLog.idInfoPersonal;

      const payload = {
        numeroDocumento,
        departamentoExpedicion,
        municipioExpedicion,
        fechaVencimientoDpi,
      };

      let data;
      if (currentIdInfo) {
        // Si ya hay un ID de información personal, actualizamos el DPI
        data = await api.put(`/actualizarDpi/${currentIdInfo}`, payload);
      } else {
        // Si es un proceso nuevo, ingresamos el DPI
        data = await api.post("/ingresarInfDpi", payload);
      }

      if (data.status === 200) {
        const idDpi = data.data.idDpi || (data.data.responseData && data.data.responseData.idDpi);
        if (idDpi) {
          empleadoLog.idDpi = idDpi;
          localStorage.setItem("datosEmpleado", JSON.stringify(empleadoLog));
        }

        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
          navigate("/ingresar-infoPersonal");
        }, 1000);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError(error.response.data.responseData);
      } else {
        setError(
          "Hubo un error al guardar la información del DPI. Por favor intenta de nuevo."
        );
      }
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
            <Box sx={{ mb: 4 }}>
              <ProgressBar
                totalSteps={steps.length}
                activeStep={activeStep}
                steps={steps}
                size="md"
              />
            </Box>
            <Box sx={{ width: "100%" }}>
              <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                Documento de Identificación
              </Typography>
          {alertVisible && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Información del DPI guardada con éxito.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="numeroDocumento"
                  label="Número de Documento (DPI)"
                  name="numeroDocumento"
                  autoComplete="off"
                  autoFocus
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel id="departamentoExpedicion-label">
                    Departamento de Expedición
                  </InputLabel>
                  <Select
                    labelId="departamentoExpedicion-label"
                    id="departamentoExpedicion"
                    value={departamentoExpedicion}
                    label="Departamento de Expedición"
                    onChange={handleDepartamentoChange}
                    startAdornment={<InputAdornment position="start"><MapIcon color="primary" /></InputAdornment>}
                    sx={{ backgroundColor: '#fff' }}
                  >
                    {departamentos.map((departamento) => (
                      <MenuItem
                        key={departamento.IdDepartamento}
                        value={departamento.IdDepartamento}
                      >
                        {departamento.departamento}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel id="municipioExpedicion-label">
                    Municipio de Expedición
                  </InputLabel>
                  <Select
                    labelId="municipioExpedicion-label"
                    id="municipioExpedicion"
                    value={municipioExpedicion}
                    label="Municipio de Expedición"
                    onChange={(e) => setMunicipioExpedicion(e.target.value)}
                    disabled={!departamentoExpedicion}
                    startAdornment={<InputAdornment position="start"><LocationCityIcon color="primary" /></InputAdornment>}
                    sx={{ backgroundColor: '#fff' }}
                  >
                    {municipiosFiltrados.map((municipio) => (
                      <MenuItem
                        key={municipio.idMunicipio}
                        value={municipio.idMunicipio}
                      >
                        {municipio.municipio}
                      </MenuItem>
                    ))}
                  </Select>
                  {!departamentoExpedicion && (
                    <Typography variant="caption" color="error">
                      Por favor, seleccione primero un departamento.
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  id="fechaVencimientoDpi"
                  label="Fecha de Vencimiento de DPI"
                  name="fechaVencimientoDpi"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  value={fechaVencimientoDpi}
                  onChange={(e) => setFechaVencimientoDpi(e.target.value)}
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="center">
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
                      boxShadow: '0 4px 14px 0 rgba(13, 71, 161, 0.39)',
                      '&:hover': {
                        background: "linear-gradient(90deg, #1565C0 0%, #0D47A1 100%)",
                        boxShadow: '0 6px 20px 0 rgba(13, 71, 161, 0.39)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
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

export default DocumentForm;