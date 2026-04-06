import React, { useState, useEffect } from "react";
import {
  TextField, Button, Grid, MenuItem, FormControl, InputLabel, Select,
  CircularProgress, Alert, InputAdornment, Box, Typography,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import MapIcon from "@mui/icons-material/Map";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EventIcon from "@mui/icons-material/Event";
import api from "../../../../config/api";

export default function StepDpi({ wizardData, onStepComplete }) {
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [departamentoExpedicion, setDepartamentoExpedicion] = useState("");
  const [municipioExpedicion, setMunicipioExpedicion] = useState("");
  const [fechaVencimientoDpi, setFechaVencimientoDpi] = useState("");
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
        console.error("Error cargando catálogos DPI:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (departamentoExpedicion && municipios.length > 0) {
      setMunicipiosFiltrados(
        municipios.filter((m) => Math.floor(m.idMunicipio / 100) === parseInt(departamentoExpedicion))
      );
    }
  }, [departamentoExpedicion, municipios]);

  const handleDepartamentoChange = (e) => {
    const id = e.target.value;
    setDepartamentoExpedicion(id);
    setMunicipioExpedicion("");
    setMunicipiosFiltrados(
      municipios.filter((m) => Math.floor(m.idMunicipio / 100) === parseInt(id))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { numeroDocumento, departamentoExpedicion, municipioExpedicion, fechaVencimientoDpi };
      
      let response;
      if (wizardData.idInfoPersonal) {
        response = await api.put(`/actualizarDpi/${wizardData.idInfoPersonal}`, payload);
      } else {
        response = await api.post("/ingresarInfDpi", payload);
      }

      if (response.status === 200) {
        const idDpi = response.data.idDpi || response.data.responseData?.idDpi;
        onStepComplete({ idDpi });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.responseData);
      } else {
        setError("Error al guardar el DPI. Intente de nuevo.");
      }
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
        Documento de Identificación (DPI)
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField fullWidth required label="Número de Documento (DPI)" value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)} autoFocus
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="primary" /></InputAdornment> }}
            sx={{ backgroundColor: "#fff", borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth required>
            <InputLabel>Departamento de Expedición</InputLabel>
            <Select value={departamentoExpedicion} label="Departamento de Expedición" onChange={handleDepartamentoChange}
              startAdornment={<InputAdornment position="start"><MapIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}
            >
              {departamentos.map((d) => <MenuItem key={d.IdDepartamento} value={d.IdDepartamento}>{d.departamento}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth required>
            <InputLabel>Municipio de Expedición</InputLabel>
            <Select value={municipioExpedicion} label="Municipio de Expedición"
              onChange={(e) => setMunicipioExpedicion(e.target.value)} disabled={!departamentoExpedicion}
              startAdornment={<InputAdornment position="start"><LocationCityIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}
            >
              {municipiosFiltrados.map((m) => <MenuItem key={m.idMunicipio} value={m.idMunicipio}>{m.municipio}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth required label="Fecha de Vencimiento DPI" type="date" InputLabelProps={{ shrink: true }}
            value={fechaVencimientoDpi} onChange={(e) => setFechaVencimientoDpi(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
            sx={{ backgroundColor: "#fff", borderRadius: 1 }}
          />
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
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar y Continuar"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
