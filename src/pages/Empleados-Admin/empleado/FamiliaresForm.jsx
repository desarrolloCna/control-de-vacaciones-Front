import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import EventIcon from '@mui/icons-material/Event';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../config/api";
import ProgressBar from "../../../components/progresBar/ProgresBar";
import Navbar from "../../../components/navBar/NavBar";
import BackButton from "../../../components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

function FamiliaresForm() {
  const isSessionVerified = useCheckSession();


  const [activeStep, setActiveStep] = useState(2);
  const [familiares, setFamiliares] = useState([
    { nombreFamiliar: "", telefono: "", parentesco: "", fechaNacimiento: "" },
  ]);
  const [idInfoPersonal, setIdInfoPersonal] = useState(null);
  const [parentescos, setParentescos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const steps = [
    "DPI",
    "Datos Personales",
    "Datos Familiares",
    "Nivel Educativo",
    "Datos Generales",
    "Empleado Nuevo",
  ];

  useEffect(() => {
    const storedData = localStorage.getItem("datosEmpleado");
    if (storedData) {
      const datosEmpleado = JSON.parse(storedData);
      const currentIdInfo = datosEmpleado.idInfoPersonal;
      setIdInfoPersonal(currentIdInfo);

      if (currentIdInfo) {
        setLoading(true);
        getFullEmployeeData(currentIdInfo).then((fullData) => {
          if (fullData && Array.isArray(fullData.familiares) && fullData.familiares.length > 0) {
            setFamiliares(fullData.familiares);
          }
          setLoading(false);
        }).catch(err => {
          console.error("Error cargando familiares previos:", err);
          setLoading(false);
        });
      }
    }

    const fetchParentescos = async () => {
      try {
        const response = await api.get(
          "/parentesco"
        );
        const data = response.data || {};
        const list = Array.isArray(data) ? data : (data.parentescos || data.parentesco || data.departamentos || []);
        setParentescos(list);
      } catch (error) {
        console.error("Error al obtener los parentescos:", error);
        setError("Error al obtener los parentescos.");
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    };

    fetchParentescos();
  }, []);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const nuevosFamiliares = [...familiares];
    nuevosFamiliares[index][name] = value;
    setFamiliares(nuevosFamiliares);
  };

  const addFamiliar = () => {
    setFamiliares([
      ...familiares,
      { nombreFamiliar: "", telefono: "", parentesco: "", fechaNacimiento: "" },
    ]);
  };

  const removeFamiliar = (index) => {
    const nuevosFamiliares = [...familiares];
    nuevosFamiliares.splice(index, 1);
    setFamiliares(nuevosFamiliares);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    if (idInfoPersonal) {
      try {
        for (const familiar of familiares) {
          // Si el familiar ya tiene un ID, significa que ya está guardado en la DB
          if (familiar.idFamiliar) {
            console.log("Omitiendo familiar ya guardado:", familiar.nombreFamiliar);
            continue;
          }

          const payload = {
            idInfoPersonal: idInfoPersonal,
            nombreFamiliar: familiar.nombreFamiliar,
            telefono: familiar.telefono,
            parentesco: familiar.parentesco,
            fechaNacimiento: familiar.fechaNacimiento,
          };
          const response = await api.post(
             "/ingresarFamiliar",
            payload
          );
          console.log("Nuevo familiar guardado:", response.data);
        }
        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
        }, 3000);
        
        // Refrescar lista para obtener los nuevos IDs
        const fullData = await getFullEmployeeData(idInfoPersonal);
        if (fullData && fullData.familiares) {
          setFamiliares(fullData.familiares);
        }

      } catch (error) {
        console.error(
          "Hubo un error al guardar los familiares:",
          error
        );
        setError(
          "Hubo un error al guardar los familiares. Por favor intenta de nuevo."
        );
        setTimeout(() => {
          setError(null);
        }, 5000);
      } finally {
        setLoading(false);
      }
    } else {
      setError(
        "No se pudo obtener el ID de información personal del local storage."
      );
      setLoading(false);
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleNext = () => {
    navigate("/nivel-educativo");
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
          Familiares
        </Typography>
      {alertVisible && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Familiares guardados exitosamente.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        {familiares.map((familiar, index) => (
          <Box key={index} sx={{ marginBottom: 2 }}>
            <Typography variant="h6">Familiar {index + 1}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombreFamiliar"
                  value={familiar.nombreFamiliar}
                  onChange={(e) => handleChange(index, e)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={familiar.telefono}
                  onChange={(e) => handleChange(index, e)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon color="primary" /></InputAdornment> }}
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Parentesco</InputLabel>
                  <Select
                    fullWidth
                    label="Parentesco"
                    name="parentesco"
                    value={familiar.parentesco}
                    onChange={(e) => handleChange(index, e)}
                    startAdornment={<InputAdornment position="start"><FamilyRestroomIcon color="primary" /></InputAdornment>}
                    sx={{ backgroundColor: '#fff' }}
                  >
                    {parentescos.map((parentesco) => (
                      <MenuItem
                        key={parentesco.idParentesco}
                        value={parentesco.parentesco}
                      >
                        {parentesco.parentesco}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                  InputLabelProps={{ shrink: true }}
                  value={familiar.fechaNacimiento}
                  onChange={(e) => handleChange(index, e)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
                  sx={{ backgroundColor: '#fff', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <IconButton
                  color="secondary"
                  onClick={() => removeFamiliar(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4
          }}
        >
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={addFamiliar}
            startIcon={<AddCircleIcon />}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Agregar Familiar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              px: 5, 
              py: 1.2,
              background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
              color: "#fff",
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(13, 71, 161, 0.39)',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
          </Button>
        </Box>
      </form>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: 5,
          marginBottom: 3,
        }}
      >
        <Button variant="contained" color="primary" onClick={handleNext}
          sx={{ 
            px: 6, 
            py: 1.5,
            background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
            color: "#fff",
            borderRadius: 2,
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          Siguiente Paso
        </Button>
      </Box>
      </Paper>
    </Container>
    </Box>
    </>
  );
}

export default FamiliaresForm;
