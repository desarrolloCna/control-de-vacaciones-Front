import React, { useState, useEffect } from "react";
import {
  TextField, Button, Grid, MenuItem, FormControl, InputLabel, Select,
  CircularProgress, Alert, InputAdornment, Box, Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import WcIcon from "@mui/icons-material/Wc";
import MapIcon from "@mui/icons-material/Map";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import BadgeIcon from "@mui/icons-material/Badge";
import EventIcon from "@mui/icons-material/Event";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import api from "../../../../config/api";

export default function StepInfoPersonal({ wizardData, onStepComplete }) {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depRes, munRes] = await Promise.all([
          api.get("/departamentos"),
          api.get("/municipios"),
        ]);
        setDepartamentos(depRes.data.departamentos || []);
        setMunicipios(munRes.data.municipios || []);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (departamentoNacimiento && municipios.length > 0) {
      setMunicipiosFiltrados(
        municipios.filter((m) => Math.floor(m.idMunicipio / 100) === parseInt(departamentoNacimiento))
      );
    }
  }, [departamentoNacimiento, municipios]);

  const handleDepartamentoChange = (e) => {
    const id = e.target.value;
    setDepartamentoNacimiento(id);
    setMunicipioNacimiento("");
    setMunicipiosFiltrados(
      municipios.filter((m) => Math.floor(m.idMunicipio / 100) === parseInt(id))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        primerNombre, segundoNombre, tercerNombre, primerApellido, segundoApellido,
        apellidoCasada, numeroCelular, correoPersonal, direccionResidencia,
        estadoCivil, genero, departamentoNacimiento, municipioNacimiento,
        nit, numAfiliacionIgss, fechaNacimiento, numeroLicencia, tipoLicencia,
        idDpi: wizardData.idDpi,
      };

      let response;
      if (wizardData.idInfoPersonal) {
        response = await api.put(`/actualizarInfoPersonal/${wizardData.idInfoPersonal}`, payload);
      } else {
        response = await api.post("/infoPersonalEmpleado", payload);
      }

      if (response.status === 200) {
        const idInfoPersonal = response.data.responseData?.idInfoPersonal || response.data.idInfoPersonal;
        onStepComplete({ idInfoPersonal });
      }
    } catch (err) {
      const msg = err.response?.data?.responseData || err.response?.data?.message || "Error al guardar información personal.";
      setError(msg);
      setTimeout(() => setError(null), 7000);
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { backgroundColor: "#fff", borderRadius: 1 };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
        Información Personal
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Primer Nombre" value={primerNombre} autoFocus
            onChange={(e) => setPrimerNombre(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Segundo Nombre" value={segundoNombre}
            onChange={(e) => setSegundoNombre(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Tercer Nombre" value={tercerNombre}
            onChange={(e) => setTercerNombre(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Primer Apellido" value={primerApellido}
            onChange={(e) => setPrimerApellido(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Segundo Apellido" value={segundoApellido}
            onChange={(e) => setSegundoApellido(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Apellido de Casada" value={apellidoCasada}
            onChange={(e) => setApellidoCasada(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Número de Celular" value={numeroCelular}
            onChange={(e) => setNumeroCelular(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Correo Personal" type="email" value={correoPersonal}
            onChange={(e) => setCorreoPersonal(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Dirección de Residencia" value={direccionResidencia}
            onChange={(e) => setDireccionResidencia(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Estado Civil</InputLabel>
            <Select value={estadoCivil} label="Estado Civil" onChange={(e) => setEstadoCivil(e.target.value)}
              startAdornment={<InputAdornment position="start"><FamilyRestroomIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              <MenuItem value="Soltero">Soltero</MenuItem>
              <MenuItem value="Casado">Casado</MenuItem>
              <MenuItem value="Divorciado">Divorciado</MenuItem>
              <MenuItem value="Viudo">Viudo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Género</InputLabel>
            <Select value={genero} label="Género" onChange={(e) => setGenero(e.target.value)}
              startAdornment={<InputAdornment position="start"><WcIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Femenino">Femenino</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Departamento de Nacimiento</InputLabel>
            <Select value={departamentoNacimiento} label="Departamento de Nacimiento" onChange={handleDepartamentoChange}
              startAdornment={<InputAdornment position="start"><MapIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {departamentos.map((d) => <MenuItem key={d.IdDepartamento} value={d.IdDepartamento}>{d.departamento}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Municipio de Nacimiento</InputLabel>
            <Select value={municipioNacimiento} label="Municipio de Nacimiento"
              onChange={(e) => setMunicipioNacimiento(e.target.value)} disabled={!departamentoNacimiento}
              startAdornment={<InputAdornment position="start"><LocationCityIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {municipiosFiltrados.map((m) => <MenuItem key={m.idMunicipio} value={m.idMunicipio}>{m.municipio}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="NIT" value={nit} onChange={(e) => setNit(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Número de Afiliación IGSS" value={numAfiliacionIgss}
            onChange={(e) => setNumAfiliacionIgss(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth required label="Fecha de Nacimiento" type="date" InputLabelProps={{ shrink: true }}
            value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Número de Licencia" value={numeroLicencia}
            onChange={(e) => setNumeroLicencia(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><DriveEtaIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Licencia</InputLabel>
            <Select value={tipoLicencia} label="Tipo de Licencia" onChange={(e) => setTipoLicencia(e.target.value)}
              startAdornment={<InputAdornment position="start"><DriveEtaIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="M">M</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Box display="flex" justifyContent="center">
            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{
                px: 6, py: 1.5, background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
                color: "#fff", borderRadius: 2, fontWeight: "bold", textTransform: "none", fontSize: "1.1rem",
                boxShadow: "0 4px 14px 0 rgba(13,71,161,0.39)",
                "&:hover": { background: "linear-gradient(90deg, #1565C0 0%, #0D47A1 100%)", transform: "translateY(-2px)" },
                transition: "all 0.3s ease",
              }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar y Continuar"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
