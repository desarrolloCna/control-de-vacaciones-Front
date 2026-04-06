import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, IconButton, Grid, MenuItem, Select,
  FormControl, InputLabel, CircularProgress, Alert, InputAdornment,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import EventIcon from "@mui/icons-material/Event";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../../../config/api";

export default function StepFamiliares({ wizardData, onStepComplete }) {
  const [familiares, setFamiliares] = useState([
    { nombreFamiliar: "", telefono: "", parentesco: "", fechaNacimiento: "" },
  ]);
  const [parentescos, setParentescos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const fetchParentescos = async () => {
      try {
        const response = await api.get("/parentesco");
        const data = response.data || {};
        const list = Array.isArray(data) ? data : (data.parentescos || data.parentesco || []);
        setParentescos(list);
      } catch (err) {
        console.error("Error al obtener parentescos:", err);
      }
    };
    fetchParentescos();
  }, []);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updated = [...familiares];
    updated[index][name] = value;
    setFamiliares(updated);
  };

  const addFamiliar = () => {
    setFamiliares([...familiares, { nombreFamiliar: "", telefono: "", parentesco: "", fechaNacimiento: "" }]);
  };

  const removeFamiliar = (index) => {
    const updated = [...familiares];
    updated.splice(index, 1);
    setFamiliares(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const idInfoPersonal = wizardData.idInfoPersonal;

    if (!idInfoPersonal) {
      setError("No se encontró el ID de información personal. Regrese al paso anterior.");
      setLoading(false);
      return;
    }

    try {
      for (const familiar of familiares) {
        if (familiar.idFamiliar) continue; // ya guardado
        await api.post("/ingresarFamiliar", {
          idInfoPersonal,
          nombreFamiliar: familiar.nombreFamiliar,
          telefono: familiar.telefono,
          parentesco: familiar.parentesco,
          fechaNacimiento: familiar.fechaNacimiento,
        });
      }
      onStepComplete({});
    } catch (err) {
      setError("Error al guardar familiares. Intente de nuevo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
        Datos Familiares
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {alertVisible && <Alert severity="success" sx={{ mb: 2 }}>Familiares guardados.</Alert>}

      {familiares.map((familiar, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Familiar {index + 1}</Typography>
            {familiares.length > 1 && (
              <IconButton color="error" onClick={() => removeFamiliar(index)} size="small">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nombre" name="nombreFamiliar" value={familiar.nombreFamiliar}
                onChange={(e) => handleChange(index, e)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: "#fff", borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Teléfono" name="telefono" value={familiar.telefono}
                onChange={(e) => handleChange(index, e)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: "#fff", borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Parentesco</InputLabel>
                <Select label="Parentesco" name="parentesco" value={familiar.parentesco}
                  onChange={(e) => handleChange(index, e)}
                  startAdornment={<InputAdornment position="start"><FamilyRestroomIcon color="primary" /></InputAdornment>}
                  sx={{ backgroundColor: "#fff" }}>
                  {parentescos.map((p) => <MenuItem key={p.idParentesco} value={p.parentesco}>{p.parentesco}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Fecha de Nacimiento" name="fechaNacimiento"
                InputLabelProps={{ shrink: true }} value={familiar.fechaNacimiento}
                onChange={(e) => handleChange(index, e)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
                sx={{ backgroundColor: "#fff", borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Box>
      ))}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Button type="button" variant="outlined" onClick={addFamiliar} startIcon={<AddCircleIcon />}
          sx={{ borderRadius: 2, fontWeight: "bold", textTransform: "none" }}>
          Agregar Familiar
        </Button>
        <Button type="submit" variant="contained" size="large" disabled={loading}
          sx={{
            px: 5, py: 1.2, background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
            color: "#fff", borderRadius: 2, fontWeight: "bold", textTransform: "none",
            boxShadow: "0 4px 14px 0 rgba(13,71,161,0.39)",
            "&:hover": { background: "linear-gradient(90deg, #1565C0 0%, #0D47A1 100%)", transform: "translateY(-2px)" },
            transition: "all 0.3s ease",
          }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar y Continuar"}
        </Button>
      </Box>
    </Box>
  );
}
