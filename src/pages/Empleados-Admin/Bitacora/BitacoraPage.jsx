import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField,
  Grid, Button, Chip, IconButton, Collapse,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Tooltip
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestoreIcon from "@mui/icons-material/Restore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import InfoIcon from "@mui/icons-material/Info";
import EngineeringIcon from "@mui/icons-material/Engineering"; // Para bitácora
import { useCheckSession } from "../../../services/session/checkSession.js";
import Spinner from "../../../components/spinners/spinner.jsx";
import api from "../../../config/api.js";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/UI/UIComponents";

const accionColor = {
  INSERT: "success",
  UPDATE: "warning",
  DELETE: "error",
};

// Diccionario para traducir nombres de tablas a nombres amigables de módulo
const diccionariModulos = {
  "solicitudes_vacaciones": "Solicitudes de Vacaciones",
  "empleados": "Directorio de Empleados",
  "usuarios": "Cuentas de Usuario",
  "coordinadores": "Gestión de Coordinadores",
  "dias_festivos": "Días Festivos",
  "incapacidades": "Incapacidades Médicas",
  "control_asistencia": "Control de Asistencia",
  "roles": "Perfiles de Acceso",
  "periodos_vacaciones": "Periodos de Vacaciones",
  "informacion_personal": "Información Personal"
};

const getModuleName = (tabla) => diccionariModulos[tabla] || tabla;

// Función para parsear JSON de forma segura
const safeParse = (str) => {
  try { return JSON.parse(str); } catch (e) { return null; }
};

// Componente para mostrar las diferencias de forma legible
function DiffTable({ anteriores, nuevos, onRestore, rowId, isDeleting }) {
  const dataAnt = safeParse(anteriores) || {};
  const dataNue = safeParse(nuevos) || {};
  
  const keys = Array.from(new Set([...Object.keys(dataAnt), ...Object.keys(dataNue)]));

  if (keys.length === 0) return <Typography variant="caption" color="text.secondary">No hay detalles disponibles.</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ color: "error.main", mb: 1, fontWeight: "bold" }}>Valor Anterior / Borrado</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "rgba(239, 83, 80, 0.05)", borderColor: "rgba(239, 83, 80, 0.2)", borderRadius: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 1, wordBreak: 'break-word', fontSize: '0.85rem' }}>
              {keys.map(key => {
                const valAnt = dataAnt[key];
                return valAnt !== undefined ? (
                  <React.Fragment key={key}>
                    <Box component="span" sx={{ fontWeight: 600, color: "text.secondary" }}>{key}:</Box>
                    <Box component="span" sx={{ fontFamily: "monospace", color: "error.main" }}>{valAnt === null ? "null" : String(valAnt)}</Box>
                  </React.Fragment>
                ) : null;
              })}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ color: "success.main", mb: 1, fontWeight: "bold" }}>Nuevo Valor</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "rgba(76, 175, 80, 0.05)", borderColor: "rgba(76, 175, 80, 0.2)", borderRadius: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 1, wordBreak: 'break-word', fontSize: '0.85rem' }}>
              {keys.map(key => {
                const valNue = dataNue[key];
                return valNue !== undefined ? (
                  <React.Fragment key={key}>
                    <Box component="span" sx={{ fontWeight: 600, color: "text.secondary" }}>{key}:</Box>
                    <Box component="span" sx={{ fontFamily: "monospace", color: "success.main", fontWeight: 700 }}>{valNue === null ? "null" : String(valNue)}</Box>
                  </React.Fragment>
                ) : null;
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {anteriores && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            startIcon={<RestoreIcon />}
            variant="contained"
            color="warning"
            onClick={() => onRestore(rowId)}
            size="small"
            sx={{ borderRadius: 6, fontWeight: "bold", textTransform: "none", boxShadow: 2 }}
          >
            Restaurar Valores Anteriores
          </Button>
        </Box>
      )}
    </Box>
  );
}

function LogEntry({ row, onRestore }) {
  const getActionIcon = (accion) => {
    switch (accion) {
      case "INSERT": return <AddCircleIcon color="success" />;
      case "UPDATE": return <EditIcon color="warning" />;
      case "DELETE": return <DeleteSweepIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, mb: 3, borderLeft: "6px solid", 
        borderColor: accionColor[row.accion] ? `${accionColor[row.accion]}.main` : "primary.main",
        borderRadius: 2, transition: "0.2s",
        bgcolor: "#ffffff",
        "&:hover": { boxShadow: 6 }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ 
          p: 1.5, bgcolor: "rgba(0,0,0,0.04)", borderRadius: "50%", 
          display: "flex", alignItems: "center", justifyContent: "center" 
        }}>
          {getActionIcon(row.accion)}
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a237e" }}>
              {row.usuario}
            </Typography>
            <Chip 
              label={row.accion} 
              size="small" 
              color={accionColor[row.accion]} 
              sx={{ fontWeight: 800, fontSize: "0.75rem", borderRadius: 1 }} 
            />
            <Chip 
              icon={<HistoryIcon sx={{ fontSize: "1rem" }}/>}
              label={getModuleName(row.tabla)} 
              size="small" 
              variant="outlined" 
              sx={{ fontWeight: 600, bgcolor: "#f5f5f5" }} 
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", fontWeight: 600, bgcolor: "#f0f0f0", px: 1.5, py: 0.5, borderRadius: 4 }}>
              {new Date(row.fechaHora).toLocaleString("es-GT", { dateStyle: 'medium', timeStyle: 'short' })}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
            {row.descripcion}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <DiffTable 
              anteriores={row.datosAnteriores} 
              nuevos={row.datosNuevos} 
              onRestore={onRestore}
              rowId={row.idBitacora}
              isDeleting={row.accion === "DELETE"}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default function BitacoraPage() {
  const isSessionVerified = useCheckSession();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    usuario: "",
    tabla: "",
    accion: "",
  });

  // Estado para restauración
  const [confirmDlg, setConfirmDlg] = useState({ open: false, id: null });
  const [restoring, setRestoring] = useState(false);
  const [msg, setMsg] = useState({ type: "success", text: "" });

  const fetchBitacora = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
      if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);
      if (filtros.usuario) params.append("usuario", filtros.usuario);
      if (filtros.tabla) params.append("tabla", filtros.tabla);
      if (filtros.accion) params.append("accion", filtros.accion);

      const res = await api.get(`/admin/obtenerBitacora?${params.toString()}`);
      setRegistros(res.data.bitacora || []);
    } catch (err) {
      console.error("Error al obtener bitácora:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchBitacora();
    const intervalId = setInterval(() => {
      fetchBitacora(true);
    }, 5000); // Polling in background every 5 seconds for Real-Time effect
    return () => clearInterval(intervalId);
  }, [fetchBitacora]);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const res = await api.post("/admin/restaurarBitacora", { idBitacora: confirmDlg.id });
      setMsg({ type: "success", text: res.data.message });
      setConfirmDlg({ open: false, id: null });
      fetchBitacora(); // Recargar para ver el nuevo log de restauración
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Error al restaurar." });
    } finally {
      setRestoring(false);
      setTimeout(() => setMsg({ type: "success", text: "" }), 5000);
    }
  };

  const handleFiltrar = () => fetchBitacora();

  const handleLimpiar = () => {
    setFiltros({ fechaInicio: "", fechaFin: "", usuario: "", tabla: "", accion: "" });
  };

  if (!isSessionVerified) return <Spinner />;

  return (
    <Box className="fade-in">
      <PageHeader 
        title="Bitácora de Actividad" 
        subtitle="Auditoría global y flujo de cambios del sistema" 
      />
      
      <Container maxWidth="xl" sx={{ mt: 2 }}>

        {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

        {/* Filtros */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, background: "linear-gradient(to right bottom, #ffffff, #f8f9fa)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a237e" }}>Filtros de Búsqueda</Typography>
            <Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: 1 }}>
                <EngineeringIcon color="action" fontSize="small"/>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  Sincronización en tiempo real activa (5s)
                </Typography>
            </Box>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth size="small" type="date" label="Fecha Inicio"
                InputLabelProps={{ shrink: true }}
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth size="small" type="date" label="Fecha Fin"
                InputLabelProps={{ shrink: true }}
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth size="small" label="Usuario"
                value={filtros.usuario}
                onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Módulo Afectado</InputLabel>
                <Select
                  value={filtros.tabla} label="Módulo Afectado"
                  onChange={(e) => setFiltros({ ...filtros, tabla: e.target.value })}
                >
                  <MenuItem value="">Todos los módulos</MenuItem>
                  {Object.entries(diccionariModulos).map(([key, friendlyName]) => (
                    <MenuItem key={key} value={key}>{friendlyName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Acción</InputLabel>
                <Select
                  value={filtros.accion} label="Acción"
                  onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="INSERT">INSERT</MenuItem>
                  <MenuItem value="UPDATE">UPDATE</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={handleFiltrar} size="small">Filtrar</Button>
                <Button variant="outlined" onClick={handleLimpiar} size="small">Limpiar</Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Historial de Card */}
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
              <CircularProgress size={40} />
              <Typography color="text.secondary">Consultando historial...</Typography>
            </Box>
          ) : registros.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, bgcolor: "background.paper", border: "1px dashed", borderColor: "divider" }}>
              <HistoryIcon sx={{ fontSize: 60, color: "action.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No se encontraron eventos</Typography>
              <Typography variant="body2" color="text.disabled">Intente ajustar los filtros de búsqueda</Typography>
            </Paper>
          ) : (
            registros.map((row) => (
              <LogEntry 
                key={row.idBitacora} 
                row={row} 
                onRestore={(id) => setConfirmDlg({ open: true, id })} 
              />
            ))
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Mostrando {registros.length} registro(s) — máximo 200 resultados por consulta
        </Typography>

        {/* Diálogo de Confirmación */}
        <Dialog open={confirmDlg.open} onClose={() => setConfirmDlg({ open: false, id: null })}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <RestoreIcon color="warning" /> Confirmar Restauración
          </DialogTitle>
          <DialogContent>
            <Typography>
              ¿Está seguro de que desea restaurar los valores anteriores para este registro? 
              Se realizará una actualización en la base de datos con los datos históricos.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmDlg({ open: false, id: null })}>Cancelar</Button>
            <Button 
              onClick={handleRestore} 
              variant="contained" 
              color="warning" 
              disabled={restoring}
            >
              {restoring ? <CircularProgress size={24} /> : "Sí, Restaurar Datos"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
