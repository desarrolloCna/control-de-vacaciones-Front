import React, { useState } from "react";
import {
  Box, IconButton, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, Chip, Modal, Select, MenuItem, FormControl,
  InputLabel, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Divider, Stack
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import DescriptionIcon from "@mui/icons-material/Description";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { useNavigate } from "react-router-dom";
import { useSolicitudById } from "../../../hooks/VacationAppHooks/useSolicitudById";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";
import { useFinalizarEstado } from "../../../hooks/VacationAppHooks/useFinalizarEstado";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { obtenerHistorialService } from "../../../services/VacationApp/Historial/ControlDiasVacaciones.service";
import { formatDateToDisplay } from "../../../services/utils/dates/vacationUtils";
import { useGetDiasSolicitados } from "../../../hooks/VacationAppHooks/useGetDiasSolicitados";
import dayjs from "dayjs";

const estadoStyles = {
  enviada: { color: "#90caf9", label: "Solicitud Enviada" },
  autorizadas: { color: "#a5d6a7", label: "Solicitud autorizada" },
  rechazada: { color: "#ef9a9a", label: "Solicitud rechazada" },
  finalizadas: { color: "#e483d3", label: "Vacaciones finalizadas" },
};

const VacationApp = () => {
  const isSessionVerified = useCheckSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [openSolicitudModal, setOpenSolicitudModal] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const { solicitud, errorS, loadingS, setSolicitud, solicitudesEmpleado, setSolicitudesEmpleado } = useSolicitudById();
  const navigate = useNavigate();
  const { loadingEstado } = useFinalizarEstado(solicitudesEmpleado, setSolicitudesEmpleado);
  const userData = getLocalStorageData();
  const { diasSolicitados, errorD, loadingD, diasDebitados, diasDisponiblesT } = useGetDiasSolicitados();
  const anioEnCurso = dayjs().year();
  
  if (!isSessionVerified) {
    return <Spinner />;
  }


  // Calcular total de días solicitados
  const calcularTotalDiasSolicitados = () => {
    if (!diasSolicitados || diasSolicitados.length === 0) return 0;
    return Array.isArray(diasSolicitados)
      ? diasSolicitados.reduce((total, item) => total + (item?.diasSolicitados || 0), 0)
      : 0;
  };

  const LimiteAnual = diasDisponiblesT < 20 ? diasDisponiblesT : 20;
  const totalDiasSolicitados = diasDebitados;
  const totaldiasDisponibles = LimiteAnual - diasDebitados;

  const canRequestVacation = () => {
    return totaldiasDisponibles > 0;
  };

  // Calcular resumen de días del historial
  const calcularResumenDias = () => {
    let totalCreditos = 0;
    let totalDebitos = 0;
    let saldoActual = 0;

    const historialFiltrado = selectedPeriodo && selectedPeriodo !== "Todos"
      ? historial.filter(item => item.periodo === selectedPeriodo)
      : historial;

    if (historialFiltrado && historialFiltrado.length > 0) {
      historialFiltrado.forEach(item => {
        if (item.tipoRegistro === 1) { // Crédito
          totalCreditos += Number(item.totalDiasAcreditados) || 0;
        } else { // Débito
          totalDebitos += Number(item.diasSolicitados) || 0;
        }
      });
      saldoActual = Number(totalCreditos) - Number(totalDebitos);
    }

    return { totalCreditos, totalDebitos, saldoActual };
  };

  const { totalCreditos, totalDebitos, saldoActual } = calcularResumenDias();

  const handleProgramar = () => {
    if (canRequestVacation()) {
      navigate("/empleados/programar-fecha");
    } else {
      setOpenAlertDialog(true);
    }
  };

  // Función para abrir el modal con los detalles de una solicitud específica
  const handleOpenSolicitudModal = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setOpenSolicitudModal(true);
  };

  const handleCloseSolicitudModal = () => {
    setSelectedSolicitud(null);
    setOpenSolicitudModal(false);
  };

  const handleOpenHistorial = async () => {
    const { idEmpleado } = userData;
    setLoadingHistorial(true);
    try {
      const historialData = await obtenerHistorialService(idEmpleado);
      setHistorial(historialData.historial);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingHistorial(false);
      setOpenHistorial(true);
    }
  };

  const handleCloseHistorial = () => {
    setOpenHistorial(false);
    setSelectedPeriodo("");
  };

  const handlePeriodoChange = (event) => {
    setSelectedPeriodo(event.target.value);
  };

  const handleCloseAlertDialog = () => {
    setOpenAlertDialog(false);
  };

  const renderEstado = (estado) => {
    const { color, label } = estadoStyles[estado.toLowerCase()] || {};
    return (
      <Chip
        label={label}
        sx={{
          backgroundColor: color,
          color: "#000",
          fontWeight: "bold",
          width: "175px",
          textAlign: "center",
        }}
      />
    );
  };

  const filteredHistorial = historial.filter((item) =>
    selectedPeriodo && selectedPeriodo !== "Todos"
      ? item.periodo === selectedPeriodo
      : true
  );

  // Función para ordenar las solicitudes por idSolicitud (más reciente primero)
  const solicitudesOrdenadas = solicitudesEmpleado 
    ? [...solicitudesEmpleado].sort((a, b) => b.idSolicitud - a.idSolicitud)
    : [];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f3f4" }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        sx={{ mr: 2, display: { md: "none" } }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{
          width: { xs: mobileOpen ? "240px" : 0, md: "240px" },
          flexShrink: { md: 0 },
          overflowY: "auto",
          transition: "width 0.3s",
          borderRight: { md: "1px solid #ddd" },
          position: { xs: "absolute", md: "relative" },
          zIndex: 1200,
        }}
      >
        <Sidebar mobileOpen={mobileOpen} />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: "10px" }, pb: 6 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontFamily: "'Roboto', sans-serif",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 5,
          }}
        >
          CONTROL DE VACACIONES
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontFamily: "'Roboto', sans-serif",
            textAlign: "center",
            marginTop: 5,
          }}
        >
          Proceso de planificación de vacaciones {anioEnCurso}
        </Typography>

        {/* Mostrar resumen de días */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 3,
          gap: 3
        }}>
          <Paper sx={{
            p: 2,
            minWidth: 200,
            textAlign: 'center',
            backgroundColor: '#f3e5f5'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Límite anual {anioEnCurso}
            </Typography>
            <Typography variant="h5" sx={{ color: 'secondary.main' }}>
              {LimiteAnual}
            </Typography>
          </Paper>
          <Paper sx={{
            p: 2,
            minWidth: 200,
            textAlign: 'center',
            backgroundColor: '#e3f2fd'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Días solicitados {anioEnCurso}
            </Typography>
            <Typography variant="h5" color="primary">
              {totalDiasSolicitados}
            </Typography>
          </Paper>
          <Paper sx={{
            p: 2,
            minWidth: 200,
            textAlign: 'center',
            backgroundColor: '#e8f5e9'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Días disponibles {anioEnCurso}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: totaldiasDisponibles > 0 ? 'success.main' : 'error.main',
                fontWeight: 'bold'
              }}
            >
              {totaldiasDisponibles}
            </Typography>
          </Paper>
        </Box>

        {/* Botones de acción - MOVIDO ARRIBA DE LA TABLA */}
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="center" 
          sx={{ mb: 3 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleProgramar}
            disabled={!canRequestVacation()}
            sx={{
              minWidth: 180,
              fontWeight: 'bold',
              '&:hover': {
                boxShadow: 2,
              }
            }}
          >
            {canRequestVacation() ? 'Programar Vacaciones' : 'Sin días disponibles'}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenHistorial}
            disabled={loadingHistorial}
            sx={{
              minWidth: 180,
              fontWeight: 'bold'
            }}
          >
            {loadingHistorial ? (
              <CircularProgress size={20} color="primary" />
            ) : (
              'Ver Historial'
            )}
          </Button>
        </Stack>

        <TableContainer 
          component={Paper} 
          sx={{ 
            mb: 4,
            boxShadow: 2,
            borderRadius: 1
          }}
        >
          <Table aria-label="vacation table">
            <TableHead>
              <TableRow>
                {[
                  "Numero de Gestion",
                  "Descripción",
                  "Estado Actual",
                  "Detalles"
                ].map((header) => (
                  <TableCell
                    key={header}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#424242",
                      color: "#fff",
                      fontSize: '0.95rem',
                      py: 1.5
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {errorS && errorS !== "NO EXISTE SOLICITUDES" ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <ErrorAlert message={errorS} visible={true} />
                  </TableCell>
                </TableRow>
              ) : loadingS || loadingEstado ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="info">
                      Cargando datos de vacaciones...
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : solicitudesOrdenadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="info">
                      No hay solicitudes de vacaciones registradas.
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                solicitudesOrdenadas.map((solicitudItem) => (
                  <TableRow key={solicitudItem.idSolicitud} hover>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      {"CNA-URRH-" + solicitudItem.idSolicitud}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      {"Solicitud de vacaciones"}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      {renderEstado(solicitudItem.estadoSolicitud || "Sin Datos")}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenSolicitudModal(solicitudItem)}
                        aria-label="ver detalles"
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Espacio en la parte inferior para evitar que quede pegado al borde */}
        <Box sx={{ height: 40 }} />

        {/* Modal para mostrar la información de la solicitud seleccionada */}
        <Modal
          open={openSolicitudModal}
          onClose={handleCloseSolicitudModal}
          aria-labelledby="solicitud-modal-title"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 550,
              maxHeight: "95vh",
              bgcolor: "#ffffff",
              boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
              borderRadius: 2,
              p: 3,
              overflowY: "auto",
            }}
          >
            <Typography
              id="solicitud-modal-title"
              variant="h6"
              component="h2"
              sx={{
                mb: 3,
                textAlign: "center",
                fontWeight: "bold",
                color: "#333",
                fontSize: "1.3rem",
                borderBottom: "2px solid #1976d2",
                pb: 1
              }}
            >
              Detalles de la Solicitud {selectedSolicitud ? "CNA-URRH-" + selectedSolicitud.idSolicitud : ""}
            </Typography>
            
            {selectedSolicitud ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Información básica */}
                <Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 1, borderLeft: "4px solid #1976d2" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <DescriptionIcon color="primary" sx={{ mr: 1.5 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      Información General
                    </Typography>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#555" }}>
                        Días solicitados:
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: "1.1rem", fontWeight: "medium" }}>
                        {selectedSolicitud.cantidadDiasSolicitados || "Sin Datos"} días
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#555" }}>
                        Estado:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {renderEstado(selectedSolicitud.estadoSolicitud || "Sin Datos")}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Fechas importantes */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#444", mb: 2 }}>
                    🗓️ Fechas importantes
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Fecha de Inicio */}
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 2, 
                        borderLeft: "3px solid #4caf50",
                        backgroundColor: "#f1f8e9",
                        height: "100%"
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <PlayCircleOutlineIcon sx={{ color: "#4caf50", mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                            INICIO DE VACACIONES
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: "medium", color: "#333" }}>
                          {formatDateToDisplay(selectedSolicitud.fechaInicioVacaciones) || "Sin Datos"}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Fecha de Fin */}
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 2, 
                        borderLeft: "3px solid #f57c00",
                        backgroundColor: "#fff3e0",
                        height: "100%"
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <StopCircleIcon sx={{ color: "#f57c00", mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#ef6c00" }}>
                            FIN DE VACACIONES
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: "medium", color: "#333" }}>
                          {formatDateToDisplay(selectedSolicitud.fechaFinVacaciones) || "Sin Datos"}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Fecha de Reintegro */}
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 2, 
                        borderLeft: "3px solid #1976d2",
                        backgroundColor: "#e3f2fd",
                        height: "100%"
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <AssignmentReturnIcon sx={{ color: "#1976d2", mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1565c0" }}>
                            REINTEGRO LABORAL
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: "medium", color: "#333" }}>
                          {formatDateToDisplay(selectedSolicitud.fechaRetornoLabores) || "Sin Datos"}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Fecha de Solicitud */}
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ 
                        p: 2, 
                        borderLeft: "3px solid #7b1fa2",
                        backgroundColor: "#f3e5f5",
                        height: "100%"
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <DescriptionIcon sx={{ color: "#7b1fa2", mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#7b1fa2" }}>
                            FECHA DE SOLICITUD
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: "medium", color: "#333" }}>
                          {formatDateToDisplay(selectedSolicitud.fechaSolicitud) || "Sin Datos"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Observaciones */}
                {selectedSolicitud.observaciones && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: "#fff8e1", borderRadius: 1, borderLeft: "3px solid #ff9800" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#555", mb: 1, display: "flex", alignItems: "center" }}>
                      <ErrorIcon sx={{ color: "#ff9800", mr: 1, fontSize: "1.2rem" }} />
                      Observaciones:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", pl: 1, fontStyle: "italic" }}>
                      "{selectedSolicitud.observaciones}"
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography align="center" sx={{ color: "#666", py: 3 }}>
                No hay datos de solicitud disponibles.
              </Typography>
            )}

            <Button
              onClick={handleCloseSolicitudModal}
              color="primary"
              variant="contained"
              sx={{
                width: "100%",
                padding: "12px 0",
                mt: 3,
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Cerrar Detalles
            </Button>
          </Box>
        </Modal>

        {/* Modal para mostrar el historial - VERSIÓN ACTUALIZADA */}
        <Modal
          open={openHistorial}
          onClose={handleCloseHistorial}
          aria-labelledby="historial-modal-title"
        >
          <Box
            sx={{
              position: "absolute",
              top: "45%",
              left: "52%",
              transform: "translate(-50%, -50%)",
              width: 1200,
              maxHeight: "80vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
              pt: 3,
              overflowY: "auto",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <InfoIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>

            <IconButton
              aria-label="close"
              onClick={handleCloseHistorial}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "#f44336",
              }}
            >
              <CloseIcon />
            </IconButton>

            <Typography
              id="historial-modal-title"
              variant="h6"
              component="h2"
              sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}
            >
              Historial y Balance de Vacaciones
            </Typography>

            {/* Resumen de Balance */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#e8f5e9" }}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <AddIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Total Días Acreditados:
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="success.main" sx={{ mt: 1 }}>
                    {totalCreditos} días
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#ffebee" }}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <RemoveIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Total Días Debitados:
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="error.main" sx={{ mt: 1 }}>
                    {totalDebitos} días
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: saldoActual >= 0 ? "#e8f5e9" : "#ffebee"
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Dias Disponibles:
                  </Typography>
                  <Typography
                    variant="h5"
                    color={saldoActual >= 0 ? "success.main" : "error.main"}
                    sx={{ mt: 1 }}
                  >
                    {saldoActual} días
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <FormControl
              fullWidth
              variant="outlined"
              sx={{ mb: 2, width: 300 }}
            >
              <InputLabel>Seleccionar Periodo</InputLabel>
              <Select
                value={selectedPeriodo}
                onChange={handlePeriodoChange}
                label="Seleccionar Periodo"
              >
                <MenuItem value="Todos">Todos</MenuItem>
                {Array.from(new Set(historial.map((item) => item.periodo))).map(
                  (periodo) => (
                    <MenuItem key={periodo} value={periodo}>
                      {periodo}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      "Gestion",
                      "Tipo",
                      "Periodo",
                      "Dias Acreditados",
                      "Dias Debitados",
                      "Dias Disponibles",
                      "Fecha",
                      "Descripción"
                    ].map((header) => (
                      <TableCell
                        key={header}
                        align="center"
                        sx={{
                          backgroundColor: "#424242",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistorial.map((item, index) => {
                    return (
                      <TableRow key={`${item.idHistorial}-${index}`}>
                        <TableCell align="center">
                          {item.tipoRegistro === 1
                            ? "CRDV-" + item.Gestion
                            : "SLVC-" + item.Gestion}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.tipoRegistro === 1 ? "Crédito" : "Débito"}
                            color={item.tipoRegistro === 1 ? "success" : "error"}
                            sx={{
                              color: "#fff",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">{item.periodo}</TableCell>
                        <TableCell align="center">
                          <Typography
                            color={"success.main"}
                            fontWeight="bold"
                          >
                            {item.tipoRegistro === 1 ? item.totalDiasAcreditados : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            color={"error.main"}
                            fontWeight="bold"
                          >
                            {item.tipoRegistro === 2 ? item.diasSolicitados : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            color={"info.main"}
                            fontWeight="bold"
                          >
                            {item.diasDisponiblesTotales}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {item.fechaAcreditacion
                            ? formatDateToDisplay(item.fechaAcreditacion)
                            : item.fechaDebito
                              ? formatDateToDisplay(item.fechaDebito)
                              : "-"}
                        </TableCell>
                        <TableCell align="center">
                          {item.tipoRegistro === 1
                            ? "Acreditación anual de días"
                            : "Solicitud de vacaciones"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Resumen al final de la tabla */}
            <Box sx={{
              mt: 3,
              p: 2,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Resumen Final:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography>
                  <span style={{ color: "#2e7d32" }}>+{totalCreditos} días</span> (Acreditados)
                </Typography>
                <Typography>
                  <span style={{ color: "#d32f2f" }}>-{totalDebitos} días</span> (Debitados)
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  Saldo: <span style={{
                    color: saldoActual >= 0 ? "#2e7d32" : "#d32f2f",
                    fontSize: "1.1rem"
                  }}>
                    {saldoActual} días
                  </span>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Diálogo de alerta cuando no puede solicitar más días */}
        <Dialog
          open={openAlertDialog}
          onClose={handleCloseAlertDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" sx={{ color: "#d32f2f" }}>
            <Box display="flex" alignItems="center">
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              Límite de días alcanzado
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" id="alert-dialog-description">
              Has alcanzado el límite máximo de días de vacaciones para este período o no cuentas con días disponibles.
              No puedes solicitar días.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              Si necesitas ajustar tus vacaciones, por favor contacta al departamento de RRHH.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAlertDialog} color="primary" autoFocus>
              Entendido
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default VacationApp;