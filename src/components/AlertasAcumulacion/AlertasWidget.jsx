import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, Box, Alert, IconButton, Collapse, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Tooltip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import api from "../../config/api";

export default function AlertasWidget() {
  const [alertas, setAlertas] = useState({ sinVacaciones: [], excesoDias: [] });
  const [loading, setLoading] = useState(true);
  const [expandedSinVacas, setExpandedSinVacas] = useState(false);
  const [expandedExceso, setExpandedExceso] = useState(false);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const res = await api.get("/reportes/alertas-acumulacion");
        setAlertas(res.data);
      } catch (error) {
        console.error("Error al cargar alertas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertas();
  }, []);

  if (loading || (alertas.sinVacaciones.length === 0 && alertas.excesoDias.length === 0)) {
    return null; // Ocultar si no hay alertas
  }

  const renderTable = (data, isExceso) => (
    <TableContainer component={Paper} elevation={0} sx={{ mt: 2, border: "1px solid #eee", maxHeight: 300 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", bgcolor: "#fafafa" }}>Empleado</TableCell>
            <TableCell sx={{ fontWeight: "bold", bgcolor: "#fafafa" }}>Unidad</TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#fafafa" }}>
              {isExceso ? "Días Acumulados" : "Última Vacación"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.idEmpleado} hover>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: "0.75rem", bgcolor: isExceso ? "#f44336" : "#ff9800" }}>
                    {(row.nombreEmpleado || "?").charAt(0)}
                  </Avatar>
                  <Typography variant="body2">{row.nombreEmpleado}</Typography>
                </Box>
              </TableCell>
              <TableCell><Typography variant="body2" color="text.secondary">{row.unidad || '—'}</Typography></TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: isExceso ? 'bold' : 'normal', color: isExceso && row.diasAcumulados > 40 ? '#d32f2f' : 'inherit' }}>
                  {isExceso ? row.diasAcumulados : (row.ultimaVacacion || "Nunca")}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ mb: 4 }}>
      {/* Alerta de Exceso de Días */}
      {alertas.excesoDias.length > 0 && (
        <Card sx={{ mb: 2, borderRadius: 3, borderLeft: "6px solid #f44336", boxShadow: "0 4px 12px rgba(244, 67, 54, 0.15)" }}>
          <CardContent sx={{ p: 2, pb: "16px !important" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <ErrorOutlineIcon sx={{ color: "#d32f2f", mr: 1.5, fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: "#c62828", fontWeight: 700, lineHeight: 1.2 }}>
                    Alerta de Acumulación
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hay <strong>{alertas.excesoDias.length}</strong> empleados que superan los 30 días de vacaciones acumuladas.
                  </Typography>
                </Box>
              </Box>
              <Tooltip title={expandedExceso ? "Ocultar detalles" : "Ver detalles"}>
                <IconButton onClick={() => setExpandedExceso(!expandedExceso)} sx={{ transition: "0.3s", transform: expandedExceso ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Collapse in={expandedExceso}>
              {renderTable(alertas.excesoDias, true)}
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Sin Vacaciones */}
      {alertas.sinVacaciones.length > 0 && (
        <Card sx={{ borderRadius: 3, borderLeft: "6px solid #ff9800", boxShadow: "0 4px 12px rgba(255, 152, 0, 0.15)" }}>
          <CardContent sx={{ p: 2, pb: "16px !important" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <WarningAmberIcon sx={{ color: "#f57c00", mr: 1.5, fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: "#e65100", fontWeight: 700, lineHeight: 1.2 }}>
                    Sin Vacaciones Recientes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hay <strong>{alertas.sinVacaciones.length}</strong> empleados que no han tomado vacaciones en más de 12 meses.
                  </Typography>
                </Box>
              </Box>
              <Tooltip title={expandedSinVacas ? "Ocultar detalles" : "Ver detalles"}>
                <IconButton onClick={() => setExpandedSinVacas(!expandedSinVacas)} sx={{ transition: "0.3s", transform: expandedSinVacas ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Collapse in={expandedSinVacas}>
              {renderTable(alertas.sinVacaciones, false)}
            </Collapse>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
