import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, InputAdornment,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import BusinessIcon from "@mui/icons-material/Business";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import api from "../../../../config/api";

export default function StepEmpleadoNuevo({ wizardData, onStepComplete, onFinish }) {
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
  const [isCoordinador, setIsCoordinador] = useState("0");

  const [puestos, setPuestos] = useState([]);
  const [renglones, setRenglones] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, uRes] = await Promise.all([
          api.get("/puestos"),
          api.get("/renglonesPresupuestarios"),
          api.get("/unidades"),
        ]);
        const getActive = (res, key) => {
          const data = res.data[key] || res.data.puestos || res.data.unidades || res.data.renglones || [];
          return (Array.isArray(data) ? data : []).filter((d) => d.estado === "A" || d.estado === undefined);
        };
        setPuestos(getActive(pRes, "puestos"));
        setRenglones(getActive(rRes, "renglones"));
        setUnidades(getActive(uRes, "unidades"));
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        setError("Error al cargar catálogos. Recargue la página.");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const idInfoPersonal = wizardData.idInfoPersonal;
      const empleadoPayload = {
        idInfoPersonal, puesto, salario, fechaIngreso, correoInstitucional,
        extensionTelefonica, unidad, renglon, observaciones, coordinacion,
        tipoContrato, numeroCuentaCHN, numeroContrato, numeroActa, numeroAcuerdo, isCoordinador,
      };

      const response = await api.post("/ingresarEmpleado", empleadoPayload);

      if (response.status === 200) {
        // Registro en Bitácora
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        try {
          const newIdEmpleado = response.data.responseData?.idEmpleado || response.data.idEmpleado || idInfoPersonal;
          await api.post("/registrarBitacora", {
            idUsuario: userData.idUsuario || userData.idEmpleado,
            usuario: userData.usuario || "desconocido",
            accion: "INSERT",
            tabla: "empleados",
            idRegistro: newIdEmpleado,
            datosAnteriores: null,
            datosNuevos: empleadoPayload,
            descripcion: `Creación de nuevo empleado: ${correoInstitucional} (Puesto: ${puesto})`,
          });
        } catch (bitErr) {
          console.warn("Error al registrar bitácora:", bitErr);
        }

        // Finalizar el wizard
        onFinish();
      }
    } catch (err) {
      setError("Error al registrar el empleado. Intente de nuevo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { backgroundColor: "#fff", borderRadius: 1 };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}>
        Datos de Empleo
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Puesto</InputLabel>
            <Select value={puesto} label="Puesto" onChange={(e) => setPuesto(e.target.value)}
              startAdornment={<InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {puestos.map((p) => <MenuItem key={p.idPuesto} value={p.puesto}>{p.puesto}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>¿Es Coordinador?</InputLabel>
            <Select value={isCoordinador} label="¿Es Coordinador?" onChange={(e) => setIsCoordinador(e.target.value)}
              startAdornment={<InputAdornment position="start"><SupervisorAccountIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              <MenuItem value="0">No</MenuItem>
              <MenuItem value="1">Sí</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Salario" value={salario} onChange={(e) => setSalario(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Fecha de Ingreso" type="date" InputLabelProps={{ shrink: true }}
            value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Correo Institucional" value={correoInstitucional}
            onChange={(e) => setCorreoInstitucional(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Extensión Telefónica" value={extensionTelefonica}
            onChange={(e) => setExtensionTelefonica(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Unidad</InputLabel>
            <Select value={unidad} label="Unidad" onChange={(e) => setUnidad(e.target.value)}
              startAdornment={<InputAdornment position="start"><BusinessIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {unidades.map((u) => <MenuItem key={u.idUnidad} value={u.nombreUnidad}>{u.nombreUnidad}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Renglón</InputLabel>
            <Select value={renglon} label="Renglón" onChange={(e) => setRenglon(e.target.value)}
              startAdornment={<InputAdornment position="start"><AttachMoneyIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              {renglones.map((r) => <MenuItem key={r.idRenglonPresupuestario} value={r.renglon}>{r.descripcion}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Coordinación" value={coordinacion} onChange={(e) => setCoordinacion(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Tipo de Contrato</InputLabel>
            <Select value={tipoContrato} label="Tipo de Contrato" onChange={(e) => setTipoContrato(e.target.value)}
              startAdornment={<InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment>}
              sx={{ backgroundColor: "#fff" }}>
              <MenuItem value="Permanente">Permanente</MenuItem>
              <MenuItem value="Temporal">Temporal</MenuItem>
              <MenuItem value="Consultor">Consultor</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Número de Cuenta CHN" value={numeroCuentaCHN}
            onChange={(e) => setNumeroCuentaCHN(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><AccountBalanceIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Número de Contrato" value={numeroContrato}
            onChange={(e) => setNumeroContrato(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Número de Acta" value={numeroActa}
            onChange={(e) => setNumeroActa(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Número de Acuerdo" value={numeroAcuerdo}
            onChange={(e) => setNumeroAcuerdo(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
            sx={fieldSx} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Observaciones" value={observaciones} multiline rows={2}
            onChange={(e) => setObservaciones(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><TextSnippetIcon color="primary" /></InputAdornment> }}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Finalizar Registro"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
