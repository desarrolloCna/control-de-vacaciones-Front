import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  InputAdornment,
} from "@mui/material";

import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import BusinessIcon from '@mui/icons-material/Business';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ProgressBar from "../../../components/progresBar/ProgresBar";
import api from "../../../config/api";
import { useNavigate } from "react-router-dom";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import Navbar from "../../../components/navBar/NavBar";
import BackButton from "../../../components/BackButton/BackButton";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

function EmpleadoForm() {
    const isSessionVerified = useCheckSession();

  const steps = [
    "DPI",
    "Datos Personales",
    "Datos Familiares",
    "Nivel Educativo",
    "Datos Generales",
    "Empleado Nuevo",
  ];
  const [activeStep, setActiveStep] = useState(5);

  const [idInfoPersonal, setIdInfoPersonal] = useState(null);
  const [puesto, setPuesto] = useState("");
  const [salario, setSalario] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [correoInstitucional, setCorreoInstitucional] = useState("");
  const [extensionTelefonica, setExtensionTelefonica] = useState("");
  const [unidad, setUnidad] = useState("");
  const [renglon, setRenglon] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [coordinacion, setCoordinacion] = useState("");
  const [tipoContrato, setTipoContrato] = useState("");
  const [numeroCuentaCHN, setNumeroCuentaCHN] = useState("");
  const [numeroContrato, setNumeroContrato] = useState("");
  const [numeroActa, setNumeroActa] = useState("");
  const [numeroAcuerdo, setNumeroAcuerdo] = useState("");
  const [isCoordinador, setIsCoordinador] = useState(0);

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [error, setError] = useState(null);

  const [puestos, setPuestos] = useState([]);
  const [renglones, setRenglones] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("datosEmpleado");
    if (storedData) {
      const datosEmpleado = JSON.parse(storedData);
      const currentId = datosEmpleado.idInfoPersonal;
      setIdInfoPersonal(currentId);

      if (currentId) {
        setLoading(true);
        getFullEmployeeData(currentId).then((fullData) => {
          if (fullData && fullData.empleado && Object.keys(fullData.empleado).length > 0) {
            const e = fullData.empleado;
            setPuesto(e.puesto || "");
            setSalario(e.salario || "");
            setFechaIngreso(e.fechaIngreso || "");
            setCorreoInstitucional(e.correoInstitucional || "");
            setExtensionTelefonica(e.extensionTelefonica || "");
            setUnidad(e.unidad || "");
            setRenglon(e.renglon || "");
            setObservaciones(e.observaciones || "");
            setCoordinacion(e.coordinacion || "");
            setTipoContrato(e.tipoContrato || "");
            setNumeroCuentaCHN(e.numeroCuentaCHN || "");
            setNumeroContrato(e.numeroContrato || "");
            setNumeroActa(e.numeroActa || "");
            setNumeroAcuerdo(e.numeroAcuerdo || "");
            setIsCoordinador(e.isCoordinador || 0);
          }
          setLoading(false);
        }).catch(err => {
          console.error("Error cargando datos de empleado previos:", err);
          setLoading(false);
        });
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [puestosRes, renglonesRes, unidadesRes] = await Promise.all([
          api.get("/puestos"),
          api.get("/renglonesPresupuestarios"),
          api.get("/unidades"),
        ]);

        const getActive = (res, key) => {
           const data = res.data[key] || res.data.puestos || res.data.unidades || res.data.renglones || res.data.departamentos || res.data.responseData?.[key] || [];
           return (Array.isArray(data) ? data : []).filter(d => d.estado === "A" || d.estado === undefined);
        };

        setPuestos(getActive(puestosRes, "puestos"));
        setRenglones(getActive(renglonesRes, "renglones"));
        setUnidades(getActive(unidadesRes, "unidades"));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Hubo un error al cargar los datos. Por favor intenta de nuevo.");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const empleadoPayload = {
        idInfoPersonal,
        puesto,
        salario,
        fechaIngreso,
        correoInstitucional,
        extensionTelefonica,
        unidad,
        renglon,
        observaciones,
        coordinacion,
        tipoContrato,
        numeroCuentaCHN,
        numeroContrato,
        numeroActa,
        numeroAcuerdo,
        isCoordinador
      };

      const response = await api.post(
        "/ingresarEmpleado",
        empleadoPayload
      );

      if (response.status === 200) {
        // Registro en Bitácora
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        try {
          const newIdEmpleado = response.data.responseData.idEmpleado || response.data.idEmpleado || idInfoPersonal;
          await api.post("/registrarBitacora", {
            idUsuario: userData.idUsuario || userData.idEmpleado,
            usuario: userData.usuario || "desconocido",
            accion: "INSERT",
            tabla: "empleados",
            idRegistro: newIdEmpleado,
            datosAnteriores: null,
            datosNuevos: empleadoPayload,
            descripcion: `Creación de nuevo empleado: ${correoInstitucional} (Puesto: ${puesto})`
          });
        } catch (bitErr) {
          console.warn("Error al registrar bitácora:", bitErr);
        }

        localStorage.removeItem('datosEmpleado');
        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
          navigate("/panel");
        }, 1000);
      }
    } catch (error) {
      setError("Hubo un error al guardar los datos. Por favor intenta de nuevo.");
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
          Datos de Empleado
        </Typography>
        <Box sx={{ width: "100%" }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="puesto-label">Puesto</InputLabel>
                <Select
                  labelId="puesto-label"
                  id="puesto"
                  value={puesto}
                  onChange={(e) => setPuesto(e.target.value)}
                  label="Puesto"
                  startAdornment={<InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {puestos.map((p) => (
                    <MenuItem key={p.idPuesto} value={p.puesto}>
                      {p.puesto}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="isCoordinador-label">¿Es Coordinador?</InputLabel>
                <Select
                  labelId="isCoordinador-label"
                  id="isCoordinador"
                  value={isCoordinador}
                  onChange={(e) => setIsCoordinador(e.target.value)}
                  label="¿Es Coordinador?"
                  startAdornment={<InputAdornment position="start"><SupervisorAccountIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Si</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="salario"
                label="Salario"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="fechaIngreso"
                label="Fecha de Ingreso"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="correoInstitucional"
                label="Correo Institucional"
                value={correoInstitucional}
                onChange={(e) => setCorreoInstitucional(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="extensionTelefonica"
                label="Extensión Telefónica"
                value={extensionTelefonica}
                onChange={(e) => setExtensionTelefonica(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="unidad-label">Unidad</InputLabel>
                <Select
                  labelId="unidad-label"
                  id="unidad"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  label="Unidad"
                  startAdornment={<InputAdornment position="start"><BusinessIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {unidades.map((u) => (
                    <MenuItem key={u.idUnidad} value={u.nombreUnidad}>
                      {u.nombreUnidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="renglon-label">Renglón</InputLabel>
                <Select
                  labelId="renglon-label"
                  id="renglon"
                  value={renglon}
                  onChange={(e) => setRenglon(e.target.value)}
                  label="Renglón"
                  startAdornment={<InputAdornment position="start"><AttachMoneyIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {renglones.map((r) => (
                    <MenuItem key={r.idRenglonPresupuestario} value={r.renglon}>
                      {r.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="observaciones"
                label="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="coordinacion"
                label="Coordinación"
                value={coordinacion}
                onChange={(e) => setCoordinacion(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="tipoContrato-label">Tipo de Contrato</InputLabel>
                <Select
                  labelId="tipoContrato-label"
                  id="tipoContrato"
                  value={tipoContrato}
                  onChange={(e) => setTipoContrato(e.target.value)}
                  label="Tipo de Contrato"
                  startAdornment={<InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  <MenuItem value="Permanente">Permanente</MenuItem>
                  <MenuItem value="Temporal">Temporal</MenuItem>
                  <MenuItem value="Consultor">Consultor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="numeroCuentaCHN"
                label="Número de Cuenta CHN"
                value={numeroCuentaCHN}
                onChange={(e) => setNumeroCuentaCHN(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><AccountBalanceIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="numeroContrato"
                label="Número de Contrato"
                value={numeroContrato}
                onChange={(e) => setNumeroContrato(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="numeroActa"
                label="Número de Acta"
                value={numeroActa}
                onChange={(e) => setNumeroActa(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="numeroAcuerdo"
                label="Número de Acuerdo"
                value={numeroAcuerdo}
                onChange={(e) => setNumeroAcuerdo(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            {alertVisible && (
              <Grid item xs={12}>
                <Alert severity="success">Datos guardados con éxito.</Alert>
              </Grid>
            )}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
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
                {loading ? <CircularProgress size={24} color="inherit" /> : "Finalizar Proceso"}
              </Button>
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

export default EmpleadoForm;
