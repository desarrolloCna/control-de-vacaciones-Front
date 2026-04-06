import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, InputAdornment,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import WorkIcon from "@mui/icons-material/Work";
import api from "../../../../config/api";

export default function StepNivelEducativo({ wizardData, onStepComplete }) {
  const [nivelDeEstudios, setNivelDeEstudios] = useState("");
  const [ultimoNivelAlcanzado, setUltimoNivelAlcanzado] = useState("");
  const [anioUltimoNivelCursado, setAnioUltimoNivelCursado] = useState("");
  const [profesion, setProfesion] = useState("");
  const [numeroColegiado, setNumeroColegiado] = useState("");
  const [fechaColegiacion, setFechaColegiacion] = useState("");
  const [nivelesEducativos, setNivelesEducativos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/nivelEducativo").then((res) => {
      setNivelesEducativos(res.data.nivelEducativo || []);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const idInfoPersonal = wizardData.idInfoPersonal;

    try {
      const fechaColegiacionToSend = fechaColegiacion === "" ? null : fechaColegiacion;

      if (idInfoPersonal) {
        const payload = {
          nivelEducativo: {
            nivelDeEstudios, ultimoNivelAlcanzado,
            añoUltimoNivelCursado: anioUltimoNivelCursado,
            Profesion: profesion, numeroColegiado,
            fechaColegiacion: fechaColegiacionToSend,
          },
        };
        const response = await api.put(`/actualizarOtrosDatos/${idInfoPersonal}`, payload);
        if (response.status === 200) onStepComplete({});
      } else {
        const payload = {
          idInfoPersonal, nivelDeEstudios, ultimoNivelAlcanzado,
          anioUltimoNivelCursado, profesion, numeroColegiado,
          fechaColegiacionToSend,
        };
        const response = await api.post("/ingresarNivelEducativo", payload);
        if (response.status === 200) onStepComplete({});
      }
    } catch (err) {
      setError("Error al guardar el nivel educativo. Intente de nuevo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { backgroundColor: "#fff", borderRadius: 1 };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
        Nivel Educativo
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Nivel de Estudios</InputLabel>
            <Select value={nivelDeEstudios} label="Nivel de Estudios" onChange={(e) => setNivelDeEstudios(e.target.value)}
              startAdornment={<InputAdornment position="start"><SchoolIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {nivelesEducativos.map((n) => <MenuItem key={n.idNivelEducativo} value={n.nivelEducativo}>{n.nivelEducativo}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Último Nivel Alcanzado" value={ultimoNivelAlcanzado}
            onChange={(e) => setUltimoNivelAlcanzado(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SchoolIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Año Último Nivel Cursado" type="date" InputLabelProps={{ shrink: true }}
            value={anioUltimoNivelCursado} onChange={(e) => setAnioUltimoNivelCursado(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Profesión" value={profesion} onChange={(e) => setProfesion(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Número de Colegiado" value={numeroColegiado}
            onChange={(e) => setNumeroColegiado(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Fecha de Colegiación" type="date" InputLabelProps={{ shrink: true }}
            value={fechaColegiacion} onChange={(e) => setFechaColegiacion(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
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
