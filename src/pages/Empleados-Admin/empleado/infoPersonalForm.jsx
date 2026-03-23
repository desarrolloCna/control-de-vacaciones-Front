import React, { useState, useEffect } from "react";
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
import PersonIcon from '@mui/icons-material/Person';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import WcIcon from '@mui/icons-material/Wc';
import MapIcon from '@mui/icons-material/Map';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BadgeIcon from '@mui/icons-material/Badge';
import EventIcon from '@mui/icons-material/Event';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import api from "../../../config/api";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../../components/progresBar/ProgresBar";
import Navbar from "../../../components/navBar/NavBar";
import BackButton from "../../../components/BackButton/BackButton";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

const PersonalInfoForm = () => {
  const isSessionVerified = useCheckSession();

  // Setear datos del formulario
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [tercerNombre, setTercerNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [apellidoCasada, setApellidoCasada] = useState("");
  const [numeroCelular, setNumeroCelular] = useState("");
  const [correoPersonal, setCorreoPersonal] = useState("");
  const [direccionResidencia, setDireccionResidencia] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [genero, setGenero] = useState("");
  const [departamentoNacimiento, setDepartamentoNacimiento] = useState("");
  const [municipioNacimiento, setMunicipioNacimiento] = useState("");
  const [nit, setNit] = useState("");
  const [numAfiliacionIgss, setNumAfiliacionIgss] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [numeroLicencia, setNumeroLicencia] = useState("");
  const [tipoLicencia, setTipoLicencia] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);
  const [idDpi, setIdDpi] = useState(null);

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

    // Llamar a las funciones para obtener la lista de departamentos y municipios cuando se monte el componente
    fetchDepartamentos();
    fetchMunicipios();

    // Obtener el ID de DPI e Info Personal del almacenamiento local
    const storedDataRaw = localStorage.getItem("datosEmpleado");
    if (storedDataRaw) {
      const datosEmpleado = JSON.parse(storedDataRaw);
      setIdDpi(datosEmpleado.idDpi);
      
      if (datosEmpleado.idInfoPersonal) {
        setLoading(true);
        getFullEmployeeData(datosEmpleado.idInfoPersonal).then((fullData) => {
          if (fullData && fullData.personal && Object.keys(fullData.personal).length > 0) {
            const p = fullData.personal;
            setPrimerNombre(p.primerNombre || "");
            setSegundoNombre(p.segundoNombre || "");
            setTercerNombre(p.tercerNombre || "");
            setPrimerApellido(p.primerApellido || "");
            setSegundoApellido(p.segundoApellido || "");
            setApellidoCasada(p.apellidoCasada || "");
            setNumeroCelular(p.numeroCelular || "");
            setCorreoPersonal(p.correoPersonal || "");
            setDireccionResidencia(p.direccionResidencia || "");
            setEstadoCivil(p.estadoCivil || "");
            setGenero(p.Genero || ""); // Note table uses Genero with capital G
            setDepartamentoNacimiento(p.departamentoNacimiento || "");
            setMunicipioNacimiento(p.municipioNacimiento || "");
            setNit(p.nit || "");
            setNumAfiliacionIgss(p.numAfiliacionIgss || "");
            setFechaNacimiento(p.fechaNacimiento ? p.fechaNacimiento.split('T')[0] : "");
            setNumeroLicencia(p.numeroLicencia || "");
            setTipoLicencia(p.tipoLicencia || "");
          }
          setLoading(false);
        }).catch(err => {
          console.error("Error cargando datos previos:", err);
          setLoading(false);
        });
      }
    }
  }, []); // Se ejecuta solo al montar

  // Efecto para filtrar municipios iniciales
  useEffect(() => {
    if (departamentoNacimiento && municipios.length > 0) {
      const filtered = municipios.filter(
        (m) => Math.floor(m.idMunicipio / 100) === parseInt(departamentoNacimiento)
      );
      setMunicipiosFiltrados(filtered);
    }
  }, [departamentoNacimiento, municipios]);

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
    setDepartamentoNacimiento(departamentoId);
    setMunicipioNacimiento(""); // Resetear municipio cuando cambia el departamento

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
      const payload = {
        primerNombre,
        segundoNombre,
        tercerNombre,
        primerApellido,
        segundoApellido,
        apellidoCasada,
        numeroCelular,
        correoPersonal,
        direccionResidencia,
        estadoCivil,
        genero,
        departamentoNacimiento,
        municipioNacimiento,
        nit,
        numAfiliacionIgss,
        fechaNacimiento,
        numeroLicencia,
        tipoLicencia,
        idDpi, // Agregar el ID de DPI al payload
      };

      const storedData = localStorage.getItem("datosEmpleado");
      const datosEmpleado = storedData ? JSON.parse(storedData) : {};
      const currentIdInfo = datosEmpleado.idInfoPersonal;

      let data;
      if (currentIdInfo) {
        // Modo actualización (PUT)
        data = await api.put(`/actualizarInfoPersonal/${currentIdInfo}`, payload);
      } else {
        // Modo creación (POST)
        data = await api.post("/infoPersonalEmpleado", payload);
      }

      if (data.status === 200) {
        const idInfoPersonal = data.data.responseData.idInfoPersonal;
        const storedData = localStorage.getItem("datosEmpleado");
        if (storedData) {
          const datosEmpleado = JSON.parse(storedData);
          datosEmpleado.idInfoPersonal = idInfoPersonal;
          localStorage.setItem("datosEmpleado", JSON.stringify(datosEmpleado));
        }

        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
          navigate("/familiares");
        }, 1000);
      }
    } catch (error) {
      console.error("Error al enviar la información personal:", error);
      const backendError = error.response?.data?.responseData || error.response?.data?.message || "Ocurrió un error inesperado en la base de datos.";
      setError(`Error: ${backendError}`);
      setTimeout(() => {
        setError(null);
      }, 7000);
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
          Información Personal
        </Typography>
        {alertVisible && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Información personal guardada con éxito.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="primerNombre"
                label="Primer Nombre"
                value={primerNombre}
                autoFocus
                onChange={(e) => setPrimerNombre(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="segundoNombre"
                label="Segundo Nombre"
                value={segundoNombre}
                onChange={(e) => setSegundoNombre(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="tercerNombre"
                label="Tercer Nombre"
                value={tercerNombre}
                onChange={(e) => setTercerNombre(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="primerApellido"
                label="Primer Apellido"
                value={primerApellido}
                onChange={(e) => setPrimerApellido(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="segundoApellido"
                label="Segundo Apellido"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="apellidoCasada"
                label="Apellido de Casada"
                value={apellidoCasada}
                onChange={(e) => setApellidoCasada(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="numeroCelular"
                label="Número de Celular"
                value={numeroCelular}
                onChange={(e) => setNumeroCelular(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="correoPersonal"
                label="Correo Personal"
                type="email"
                value={correoPersonal}
                onChange={(e) => setCorreoPersonal(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="direccionResidencia"
                label="Dirección de Residencia"
                value={direccionResidencia}
                onChange={(e) => setDireccionResidencia(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel id="estadoCivil-label">Estado Civil</InputLabel>
                <Select
                  labelId="estadoCivil-label"
                  id="estadoCivil"
                  value={estadoCivil}
                  onChange={(e) => setEstadoCivil(e.target.value)}
                  startAdornment={<InputAdornment position="start"><FamilyRestroomIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  <MenuItem value={"Soltero"}>Soltero</MenuItem>
                  <MenuItem value={"Casado"}>Casado</MenuItem>
                  <MenuItem value={"Divorciado"}>Divorciado</MenuItem>
                  <MenuItem value={"Viudo"}>Viudo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel id="genero-label">Género</InputLabel>
                <Select
                  labelId="genero-label"
                  id="genero"
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  startAdornment={<InputAdornment position="start"><WcIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  <MenuItem value={"Masculino"}>Masculino</MenuItem>
                  <MenuItem value={"Femenino"}>Femenino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel id="departamentoNacimiento-label">
                  Departamento de Nacimiento
                </InputLabel>
                <Select
                  labelId="departamentoNacimiento-label"
                  id="departamentoNacimiento"
                  value={departamentoNacimiento}
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel id="municipioNacimiento-label">
                  Municipio de Nacimiento
                </InputLabel>
                <Select
                  labelId="municipioNacimiento-label"
                  id="municipioNacimiento"
                  value={municipioNacimiento}
                  onChange={(e) => setMunicipioNacimiento(e.target.value)}
                  disabled={!departamentoNacimiento} // Deshabilitar si no hay departamento seleccionado
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
                {!departamentoNacimiento && (
                  <Typography variant="caption" color="error">
                    Por favor, seleccione primero un departamento.
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="nit"
                label="NIT"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="numAfiliacionIgss"
                label="Número de Afiliación IGSS"
                value={numAfiliacionIgss}
                onChange={(e) => setNumAfiliacionIgss(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                id="fechaNacimiento"
                label="Fecha de Nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="numeroLicencia"
                label="Número de Licencia"
                value={numeroLicencia}
                onChange={(e) => setNumeroLicencia(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><DriveEtaIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="tipoLicencia-label">
                  Tipo de Licencia
                </InputLabel>
                <Select
                  labelId="tipoLicencia-label"
                  id="tipoLicencia"
                  value={tipoLicencia}
                  onChange={(e) => setTipoLicencia(e.target.value)}
                  startAdornment={<InputAdornment position="start"><DriveEtaIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  <MenuItem value={"A"}>A</MenuItem>
                  <MenuItem value={"B"}>B</MenuItem>
                  <MenuItem value={"C"}>C</MenuItem>
                  <MenuItem value={"M"}>M</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 5, mb: 2 }}>
            <Grid item xs={12}>
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
          </Box>
        </Box>
        </Paper>
      </Container>
      </Box>
    </>
  );
};

export default PersonalInfoForm;