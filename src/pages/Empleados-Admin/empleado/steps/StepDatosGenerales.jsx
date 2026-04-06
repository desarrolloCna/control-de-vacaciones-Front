import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, InputAdornment, RadioGroup, FormControlLabel, Radio, FormLabel,
} from "@mui/material";
import AccessibleIcon from "@mui/icons-material/Accessible";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import MedicationIcon from "@mui/icons-material/Medication";
import PublicIcon from "@mui/icons-material/Public";
import api from "../../../../config/api";

export default function StepDatosGenerales({ wizardData, onStepComplete }) {
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
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/discapacidades"),
      api.get("/puebloPerteneciente"),
      api.get("/comunidadLinguistica"),
    ]).then(([discRes, etRes, comRes]) => {
      setTiposDiscapacidad(discRes.data.discapacidades || []);
      setEtnias(etRes.data.etnias || []);
      setComunidadesLinguisticas(comRes.data.comunidadesLinguisticas || []);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const idInfoPersonal = wizardData.idInfoPersonal;

    try {
      if (idInfoPersonal) {
        const payload = {
          datosMedicos: {
            discapacidad, tipoDiscapacidad: discapacidad === "Sí" ? tipoDiscapacidad : null,
            tipoSangre, condicionMedica, tomaMedicina,
            nombreMedicamento: tomaMedicina === "Sí" ? nombreMedicamento : null, sufreAlergia,
          },
          pertenenciaSociolinguistica: { etnia, comunidadLinguistica },
        };
        const response = await api.put(`/actualizarOtrosDatos/${idInfoPersonal}`, payload);
        if (response.status === 200) onStepComplete({});
      } else {
        // POST mode
        const dmPayload = {
          idInfoPersonal, discapacidad, tipoDiscapacidad: discapacidad === "Sí" ? tipoDiscapacidad : null,
          tipoSangre, condicionMedica, tomaMedicina,
          nombreMedicamento: tomaMedicina === "Sí" ? nombreMedicamento : null, sufreAlergia,
        };
        const dmRes = await api.post("/ingresarDatosMedicos", dmPayload);
        if (dmRes.status === 200) {
          const slPayload = { idInfoPersonal, etnia, comunidadLinguistica };
          const slRes = await api.post("/ingresarPertenenciaSoLi", slPayload);
          if (slRes.status === 200) onStepComplete({});
        }
      }
    } catch (err) {
      setError("Error al guardar datos generales. Intente de nuevo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
        Datos Generales
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h6" gutterBottom>Datos Médicos</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl component="fieldset" fullWidth required>
            <FormLabel>¿Empleado con discapacidad?</FormLabel>
            <RadioGroup row value={discapacidad} onChange={(e) => setDiscapacidad(e.target.value)}>
              <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        {discapacidad === "Sí" && (
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Discapacidad</InputLabel>
              <Select value={tipoDiscapacidad} label="Tipo de Discapacidad" onChange={(e) => setTipoDiscapacidad(e.target.value)}
                startAdornment={<InputAdornment position="start"><AccessibleIcon color="primary" /></InputAdornment>}
                sx={{ backgroundColor: "#fff" }}>
                {tiposDiscapacidad.map((t) => <MenuItem key={t.idDiscapacidad} value={t.tipoDiscapacidad}>{t.tipoDiscapacidad}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Tipo de Sangre</InputLabel>
            <Select value={tipoSangre} label="Tipo de Sangre" onChange={(e) => setTipoSangre(e.target.value)}
              startAdornment={<InputAdornment position="start"><BloodtypeIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Condición Médica" value={condicionMedica} onChange={(e) => setCondicionMedica(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><MedicalServicesIcon color="primary" /></InputAdornment> }}
            sx={{ backgroundColor: "#fff", borderRadius: 1 }} />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" fullWidth required>
            <FormLabel>¿Toma alguna medicina?</FormLabel>
            <RadioGroup row value={tomaMedicina} onChange={(e) => setTomaMedicina(e.target.value)}>
              <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        {tomaMedicina === "Sí" && (
          <Grid item xs={12}>
            <TextField fullWidth label="Nombre del Medicamento" value={nombreMedicamento}
              onChange={(e) => setNombreMedicamento(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><MedicationIcon color="primary" /></InputAdornment> }}
              sx={{ backgroundColor: "#fff", borderRadius: 1 }} />
          </Grid>
        )}
        <Grid item xs={12}>
          <FormControl component="fieldset" fullWidth required>
            <FormLabel>¿Sufre de alguna alergia?</FormLabel>
            <RadioGroup row value={sufreAlergia} onChange={(e) => setSufreAlergia(e.target.value)}>
              <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Datos Sociolingüísticos</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Pueblo al que pertenece</InputLabel>
            <Select value={etnia} label="Pueblo al que pertenece" onChange={(e) => setEtnia(e.target.value)}
              startAdornment={<InputAdornment position="start"><PublicIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {etnias.map((et) => <MenuItem key={et.idPuebloPerteneciente} value={et.pueblo}>{et.pueblo}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Comunidad Lingüística</InputLabel>
            <Select value={comunidadLinguistica} label="Comunidad Lingüística" onChange={(e) => setComunidadLinguistica(e.target.value)}
              startAdornment={<InputAdornment position="start"><PublicIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {comunidadesLinguisticas.map((c) => <MenuItem key={c.idComunidadLinguistica} value={c.tipoComunidad}>{c.tipoComunidad}</MenuItem>)}
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
