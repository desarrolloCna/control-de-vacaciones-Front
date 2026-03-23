import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Paper,
  InputAdornment,
} from "@mui/material";
import AccessibleIcon from '@mui/icons-material/Accessible';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationIcon from '@mui/icons-material/Medication';
import PublicIcon from '@mui/icons-material/Public';
import ProgressBar from "../../../components/progresBar/ProgresBar";
import api from "../../../config/api";
import { useNavigate } from "react-router-dom";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import Navbar from "../../../components/navBar/NavBar";
import BackButton from "../../../components/BackButton/BackButton";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

function DatosGeneralesForm() {
  const isSessionVerified = useCheckSession();

  const steps = [
    "DPI",
    "Datos Personales",
    "Datos Familiares",
    "Nivel Educativo",
    "Datos Generales",
    "Empleado Nuevo",
  ];
  const [activeStep, setActiveStep] = useState(4);

  const [idInfoPersonal, setIdInfoPersonal] = useState(null);
  const [discapacidad, setDiscapacidad] = useState("");
  const [tipoDiscapacidad, setTipoDiscapacidad] = useState("");
  const [tiposDiscapacidad, setTiposDiscapacidad] = useState([]);
  const [tipoSangre, setTipoSangre] = useState("");
  const [condicionMedica, setCondicionMedica] = useState("");
  const [tomaMedicina, setTomaMedicina] = useState("");
  const [nombreMedicamento, setNombreMedicamento] = useState("");
  const [sufreAlergia, setSufreAlergia] = useState("");

  const [etnia, setEtnia] = useState("");
  const [comunidadLinguistica, setComunidadLinguistica] = useState("");
  const [etnias, setEtnias] = useState([]);
  const [comunidadesLinguisticas, setComunidadesLinguisticas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [error, setError] = useState(null);

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
          if (fullData) {
            // Datos Médicos
            if (fullData.medicos && Object.keys(fullData.medicos).length > 0) {
              const m = fullData.medicos;
              setDiscapacidad(m.discapacidad || "");
              setTipoDiscapacidad(m.tipoDiscapacidad || "");
              setTipoSangre(m.tipoSangre || "");
              setCondicionMedica(m.condicionMedica || "");
              setTomaMedicina(m.tomaMedicina || "");
              setNombreMedicamento(m.nombreMedicamento || "");
              setSufreAlergia(m.sufreAlergia || "");
            }
            // Datos Sociolingüísticos
            if (fullData.sociolinguistico && Object.keys(fullData.sociolinguistico).length > 0) {
              const s = fullData.sociolinguistico;
              setEtnia(s.etnia || "");
              setComunidadLinguistica(s.comunidadLinguistica || "");
            }
          }
          setLoading(false);
        }).catch(err => {
          console.error("Error cargando datos generales previos:", err);
          setLoading(false);
        });
      }
    }

    const fetchDiscapacidades = async () => {
      try {
        const response = await api.get("/discapacidades");
        setTiposDiscapacidad(response.data.discapacidades);
      } catch (error) {
        console.error("Error al obtener los tipos de discapacidad:", error);
      }
    };

    const fetchEtnias = async () => {
      try {
        const response = await api.get("/puebloPerteneciente");
        setEtnias(response.data.etnias);
      } catch (error) {
        console.error("Error al obtener las etnias:", error);
      }
    };

    const fetchComunidadesLinguisticas = async () => {
      try {
        const response = await api.get("/comunidadLinguistica");
        setComunidadesLinguisticas(response.data.comunidadesLinguisticas);
      } catch (error) {
        console.error("Error al obtener las comunidades lingüísticas:", error);
      }
    };

    fetchDiscapacidades();
    fetchEtnias();
    fetchComunidadesLinguisticas();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (idInfoPersonal) {
        // En modo edición, usamos actualizarOtrosDatos (PUT)
        const payload = {
          datosMedicos: {
            discapacidad,
            tipoDiscapacidad: discapacidad === "Sí" ? tipoDiscapacidad : null,
            tipoSangre,
            condicionMedica,
            tomaMedicina,
            nombreMedicamento: tomaMedicina === "Sí" ? nombreMedicamento : null,
            sufreAlergia,
          },
          pertenenciaSociolinguistica: {
            etnia,
            comunidadLinguistica,
          }
        };

        const response = await api.put(`/actualizarOtrosDatos/${idInfoPersonal}`, payload);
        
        if (response.status === 200) {
          setAlertVisible(true);
          setTimeout(() => {
            setAlertVisible(false);
            navigate("/nuevo-empleado");
          }, 1000);
        }
      } else {
        // En modo creación, usamos los endpoints originales (POST)
        const datosMedicosPayload = {
          idInfoPersonal,
          discapacidad,
          tipoDiscapacidad: discapacidad === "Sí" ? tipoDiscapacidad : null,
          tipoSangre,
          condicionMedica,
          tomaMedicina,
          nombreMedicamento: tomaMedicina === "Sí" ? nombreMedicamento : null,
          sufreAlergia,
        };

        const datosMedicosResponse = await api.post(
          "/ingresarDatosMedicos",
          datosMedicosPayload
        );

        if (datosMedicosResponse.status === 200) {
          const datosSociolinguisticosPayload = {
            idInfoPersonal,
            etnia,
            comunidadLinguistica,
          };

          const datosSociolinguisticosResponse = await api.post(
            "/ingresarPertenenciaSoLi",
            datosSociolinguisticosPayload
          );

          if (datosSociolinguisticosResponse.status === 200) {
            setAlertVisible(true);
            setTimeout(() => {
              setAlertVisible(false);
              navigate("/nuevo-empleado");
            }, 1000);
          }
        }
      }
    } catch (error) {
      setError(
        "Hubo un error al guardar los datos. Por favor intenta de nuevo."
      );
      console.log(error);
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
          Datos Generales
        </Typography>
        <Box sx={{ width: "100%" }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Datos Médicos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth required>
                <FormLabel component="legend">
                  Empleado con discapacidad?
                </FormLabel>
                <RadioGroup
                  row
                  aria-label="discapacidad"
                  name="discapacidad"
                  value={discapacidad}
                  onChange={(e) => setDiscapacidad(e.target.value)}
                >
                  <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {discapacidad === "Sí" && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="tipoDiscapacidad-label">
                    Tipo de Discapacidad
                  </InputLabel>
                  <Select
                    labelId="tipoDiscapacidad-label"
                    id="tipoDiscapacidad"
                    value={tipoDiscapacidad}
                    label="Tipo de Discapacidad"
                    onChange={(e) => setTipoDiscapacidad(e.target.value)}
                    startAdornment={<InputAdornment position="start"><AccessibleIcon color="primary" /></InputAdornment>}
                    sx={{ backgroundColor: '#fff' }}
                  >
                    {tiposDiscapacidad.map((tipo) => (
                      <MenuItem
                        key={tipo.idDiscapacidad}
                        value={tipo.tipoDiscapacidad}
                      >
                        {tipo.tipoDiscapacidad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="tipoSangre-label">Tipo de Sangre</InputLabel>
                <Select
                  labelId="tipoSangre-label"
                  id="tipoSangre"
                  value={tipoSangre}
                  label="Tipo de Sangre"
                  onChange={(e) => setTipoSangre(e.target.value)}
                  startAdornment={<InputAdornment position="start"><BloodtypeIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="condicionMedica"
                label="Condición Médica"
                value={condicionMedica}
                onChange={(e) => setCondicionMedica(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><MedicalServicesIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: '#fff', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth required>
                <FormLabel component="legend">
                  ¿Empleado Toma alguna medicina?
                </FormLabel>
                <RadioGroup
                  row
                  aria-label="tomaMedicina"
                  name="tomaMedicina"
                  value={tomaMedicina}
                  onChange={(e) => setTomaMedicina(e.target.value)}
                >
                  <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {tomaMedicina === "Sí" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="nombreMedicamento"
                  label="Nombre del Medicamento"
                  value={nombreMedicamento}
                  onChange={(e) => setNombreMedicamento(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><MedicationIcon color="primary" /></InputAdornment> }}
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth required>
                <FormLabel component="legend">
                  ¿Empleado sufre de alguna alergia?
                </FormLabel>
                <RadioGroup
                  row
                  aria-label="sufreAlergia"
                  name="sufreAlergia"
                  value={sufreAlergia}
                  onChange={(e) => setSufreAlergia(e.target.value)}
                >
                  <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Datos Sociolingüísticos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="etnia-label">
                  Pueblo al que pertenece
                </InputLabel>
                <Select
                  labelId="etnia-label"
                  id="etnia"
                  value={etnia}
                  label="Pueblo al que pertenece"
                  onChange={(e) => setEtnia(e.target.value)}
                  startAdornment={<InputAdornment position="start"><PublicIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {etnias.map((etnia) => (
                    <MenuItem
                      key={etnia.idPuebloPerteneciente}
                      value={etnia.pueblo}
                    >
                      {etnia.pueblo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ mb: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="comunidadLinguistica-label">
                  Comunidad Lingüística
                </InputLabel>
                <Select
                  labelId="comunidadLinguistica-label"
                  id="comunidadLinguistica"
                  value={comunidadLinguistica}
                  label="Comunidad Lingüística"
                  onChange={(e) => setComunidadLinguistica(e.target.value)}
                  startAdornment={<InputAdornment position="start"><PublicIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: '#fff' }}
                >
                  {comunidadesLinguisticas.map((comunidad) => (
                    <MenuItem
                      key={comunidad.idComunidadLinguistica}
                      value={comunidad.tipoComunidad}
                    >
                      {comunidad.tipoComunidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {alertVisible && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Datos guardados con éxito.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box mt={4} display="flex" justifyContent="center" sx={{ mt: 4 }}>
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
               }}
             >
               {loading ? <CircularProgress size={24} color="inherit" /> : "Siguiente Paso"}
             </Button>
           </Box>
        </Box>
        </Box>
        </Paper>
      </Container>
      </Box>
    </>
  );
}

export default DatosGeneralesForm;
