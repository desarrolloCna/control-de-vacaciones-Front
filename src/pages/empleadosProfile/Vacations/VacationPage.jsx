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
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GetAppIcon from "@mui/icons-material/GetApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { useNavigate } from "react-router-dom";
import { getDiasFestivos } from "../../../services/EmpleadosServices/DiasFestivos/GetDiasFestivos";
import { useSolicitudById } from "../../../hooks/VacationAppHooks/useSolicitudById";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";
import { useFinalizarEstado } from "../../../hooks/VacationAppHooks/useFinalizarEstado";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { obtenerHistorialService } from "../../../services/VacationApp/Historial/ControlDiasVacaciones.service";
import { formatDateToDisplay } from "../../../services/utils/dates/vacationUtils";
import { exportToExcel } from "../../../services/utils/exportToExcelUtils";
import { exportToPdf } from "../../../services/utils/exportToPdfUtils";
import { useGetDiasSolicitados } from "../../../hooks/VacationAppHooks/useGetDiasSolicitados";
import api from "../../../config/api";
import { API_URL } from "../../../config/enviroment";
import dayjs from "dayjs";
import { StyledButton, PageHeader } from "../../../components/UI/UIComponents";
import { getEstado } from "../../../config/statusConfig.js";
// Eliminado: se usa getEstado de statusConfig.js

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

  // Estados para Días Festivos
  const [openFestivos, setOpenFestivos] = useState(false);
  const [listaFestivos, setListaFestivos] = useState([]);
  const [loadingFestivos, setLoadingFestivos] = useState(false);
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

  const totalDiasAcumulados = diasDisponiblesT;
  const totalDiasSolicitados = diasDebitados;
  const totaldiasDisponibles = totalDiasAcumulados - diasDebitados;

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

  const getPeriodosSummary = () => {
    const summary = {};
    if (!historial || historial.length === 0) return [];
    
    historial.forEach(item => {
      const p = item.periodo;
      if (!summary[p]) { summary[p] = { creditos: 0, debitos: 0 }; }
      if (item.tipoRegistro === 1) summary[p].creditos += Number(item.totalDiasAcreditados) || 0;
      else summary[p].debitos += Number(item.diasSolicitados) || 0;
    });
    return Object.keys(summary).map(p => ({
      periodo: p,
      saldo: summary[p].creditos - summary[p].debitos
    })).sort((a, b) => Number(b.periodo) - Number(a.periodo));
  };

  const handleDownloadFiniquito = async (periodo, event) => {
    if (event) event.stopPropagation();
    try {
      const response = await api.get(`/descargarFiniquito/${userData.idEmpleado}/${periodo}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const pdfWindow = window.open("", "_blank");
      if (pdfWindow) {
        pdfWindow.document.write(
          `<html><head><title>Finiquito_${periodo}</title><style>body { margin: 0; overflow: hidden; } iframe { width: 100vw; height: 100vh; border: none; }</style></head>
           <body><iframe src="${url}"></iframe></body></html>`
        );
        pdfWindow.document.close();
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Error al descargar finiquito", error);
      alert("No se pudo generar el finiquito. Verifique que el período tenga registros.");
    }
  };

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

  const handleOpenFestivos = async () => {
    setLoadingFestivos(true);
    try {
      const data = await getDiasFestivos();
      setListaFestivos(data || []);
    } catch (error) {
      console.log("Error cargando festivos", error);
    } finally {
      setLoadingFestivos(false);
      setOpenFestivos(true);
    }
  };

  const handleCloseFestivos = () => {
    setOpenFestivos(false);
  };

  const handleCloseAlertDialog = () => {
    setOpenAlertDialog(false);
  };

  const renderEstado = (estado) => {
    const estadoKey = estado ? estado.toLowerCase() : "";
    const { color, label, textColor } = getEstado(estadoKey) || { color: "#9e9e9e", label: estado || "Desconocido", textColor: "#fff" };
    return (
      <Chip
        label={label}
        sx={{
          backgroundColor: color,
          color: textColor,
          fontWeight: "bold",
          width: "200px",
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

  const handleExportDataToExcel = () => {
    const dataToExport = filteredHistorial.map((item) => ({
      Gestion: item.tipoRegistro === 1 ? "CRDV-" + item.Gestion : "SLVC-" + item.Gestion,
      Tipo: item.tipoRegistro === 1 ? "Crédito" : "Débito",
      Periodo: item.periodo,
      "Dias Acreditados": item.tipoRegistro === 1 ? item.totalDiasAcreditados : 0,
      "Dias Debitados": item.tipoRegistro === 2 ? item.diasSolicitados : 0,
      "Dias Disponibles": item.diasDisponiblesTotales,
      Fecha: item.fechaAcreditacion ? formatDateToDisplay(item.fechaAcreditacion) : item.fechaDebito ? formatDateToDisplay(item.fechaDebito) : "-",
      Descripción: item.tipoRegistro === 1 ? "Acreditación anual de días" : "Solicitud de vacaciones"
    }));

    exportToExcel(dataToExport, `Historial_Vacaciones_${userData?.primerNombre || 'Empleado'}`, "Historial", `Historial de Vacaciones - Empleado: ${userData?.Nombres || userData?.primerNombre || 'No especificado'}`);
  };

  const handleExportDataToPdf = () => {
    const dataToExport = filteredHistorial.map((item) => ({
      Gestion: item.tipoRegistro === 1 ? "CRDV-" + item.Gestion : "SLVC-" + item.Gestion,
      Tipo: item.tipoRegistro === 1 ? "Crédito" : "Débito",
      Periodo: item.periodo,
      "Dias Acreditados": item.tipoRegistro === 1 ? item.totalDiasAcreditados : 0,
      "Dias Debitados": item.tipoRegistro === 2 ? item.diasSolicitados : 0,
      "Dias Disponibles": item.diasDisponiblesTotales,
      Fecha: item.fechaAcreditacion ? formatDateToDisplay(item.fechaAcreditacion) : item.fechaDebito ? formatDateToDisplay(item.fechaDebito) : "-",
      Descripción: item.tipoRegistro === 1 ? "Acreditación anual de días" : "Solicitud de vacaciones"
    }));

    exportToPdf(dataToExport, `Historial_Vacaciones_${userData?.primerNombre || 'Empleado'}`);
  };

  const handleDownloadPDF = async (idSolicitud, idEmpleado) => {
    try {
      const response = await api.get(`/descargarInformePDF/${idSolicitud}/${idEmpleado}`, {
        responseType: 'blob'
      });
      const fileName = solicitudesEmpleado.find(s => s.idSolicitud === idSolicitud)?.correlativo || `Solicitud_${idSolicitud}`;
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      const pdfWindow = window.open("", "_blank");
      if (pdfWindow) {
        pdfWindow.document.write(
          `<html><head><title>${fileName}</title><style>body { margin: 0; overflow: hidden; } iframe { width: 100vw; height: 100vh; border: none; }</style></head>
           <body><iframe src="${url}"></iframe></body></html>`
        );
        pdfWindow.document.close();
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Error al descargar el informe", error);
      let errorMsg = "No se pudo descargar el informe. Puede que el archivo no esté disponible o haya un error de red.";
      
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const jsonError = JSON.parse(text);
          errorMsg = `Error del Servidor: ${jsonError.error}`;
        } catch (e) {
          // Fallback silencioso
        }
      }
      
      alert(errorMsg);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={() => setMobileOpen(!mobileOpen)} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 }, 
          ml: { md: '250px' },
          width: { md: `calc(100% - 250px)` },
          transition: "all 0.3s"
        }}
      >
        <Box sx={{ display: { md: 'none' }, mb: 2 }}>
          <IconButton onClick={() => setMobileOpen(!mobileOpen)} color="primary">
            <MenuIcon />
          </IconButton>
        </Box>

        <PageHeader 
          title="Control de Vacaciones" 
          subtitle={`Proceso de planificación de vacaciones del Consejo Nacional de Adopciones ${anioEnCurso} | Fecha de Ingreso: ${userData?.fechaIngreso ? formatDateToDisplay(userData.fechaIngreso) : "Incalculable"}`}
          showBack={true}
        />

        {/* Mostrar resumen de días */}
        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4, px: 2 }}>
          <Grid item xs={12} sm={4} md={3}>
            <Paper elevation={2} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#f3e5f5', borderRadius: 2, borderLeft: '4px solid #ab47bc', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Días Acumulados Totales
              </Typography>
              <Typography variant="h4" sx={{ color: '#8e24aa', fontWeight: 700, mt: 1 }}>
                {totalDiasAcumulados}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Paper elevation={2} sx={{ p: 2.5, textAlign: 'center', bgcolor: '#e3f2fd', borderRadius: 2, borderLeft: '4px solid #1976d2', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Días Solicitados
              </Typography>
              <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 700, mt: 1 }}>
                {totalDiasSolicitados}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Paper elevation={2} sx={{ p: 2.5, textAlign: 'center', bgcolor: totaldiasDisponibles === 0 ? '#fffbee' : '#e8f5e9', borderRadius: 2, borderLeft: `4px solid ${totaldiasDisponibles > 0 ? '#4caf50' : '#f44336'}`, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Días Disponibles
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: totaldiasDisponibles > 0 ? '#2e7d32' : '#c62828',
                  fontWeight: 700,
                  mt: 1
                }}
              >
                {totaldiasDisponibles}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Botones de acción - MOVIDO ARRIBA DE LA TABLA */}
        <Stack 
          direction={{ xs: "column", sm: "row" }}
          spacing={2} 
          justifyContent="center" 
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleProgramar}
            disabled={!canRequestVacation()}
            startIcon={<EventAvailableIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 2,
              '&:hover': { boxShadow: 4 }
            }}
          >
            {canRequestVacation() ? 'Programar Vacaciones' : 'Sin días disponibles'}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenHistorial}
            disabled={loadingHistorial}
            startIcon={!loadingHistorial && <TimelineIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 }
            }}
          >
            {loadingHistorial ? (
              <CircularProgress size={24} color="primary" />
            ) : (
              'Ver Historial'
            )}
          </Button>

          {/* NUEVO BOTON: DÍAS FESTIVOS */}
          <Button
            variant="outlined"
            onClick={handleOpenFestivos}
            disabled={loadingFestivos}
            startIcon={!loadingFestivos && <EventAvailableIcon />}
            sx={{
              minWidth: 200,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: 2,
              borderWidth: 2,
              borderColor: '#e65100',
              color: '#e65100',
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'rgba(230, 81, 0, 0.05)',
                borderColor: '#bf360c',
                color: '#bf360c'
              }
            }}
          >
            {loadingFestivos ? (
              <CircularProgress size={24} color="warning" />
            ) : (
              'Días Festivos'
            )}
          </Button>
        </Stack>

        {/* CONTENEDOR TIPO TIMELINE (En vez de tabla) */}
        {errorS && errorS !== "NO EXISTE SOLICITUDES" ? (
          <ErrorAlert message={errorS} visible={true} />
        ) : loadingS || loadingEstado ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : solicitudesOrdenadas.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              borderRadius: 4, 
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: 'transparent'
            }}
          >
            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight="600">
              Aún no tienes solicitudes en el historial
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cuando programes vacaciones, aparecerán aquí para tu seguimiento.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, margin: '0 auto', mb: 6 }}>
            {solicitudesOrdenadas.map((solicitudItem) => {
              const estadoObj = getEstado(solicitudItem.estadoSolicitud || "");
              return (
                <Paper
                  key={solicitudItem.idSolicitud}
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: `6px solid ${estadoObj?.color || '#94a3b8'}`,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, m: 0, lineHeight: 1 }}>
                        {solicitudItem.correlativo || ("CNA-URRH-" + solicitudItem.idSolicitud)}
                      </Typography>
                      {renderEstado(solicitudItem.estadoSolicitud || "Sin Datos")}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" /> Solicitada el {formatDateToDisplay(solicitudItem.fechaSolicitud)}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Inicio</Typography>
                        <Typography variant="body2" fontWeight="600">{formatDateToDisplay(solicitudItem.fechaInicioVacaciones)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Fin</Typography>
                        <Typography variant="body2" fontWeight="600">{formatDateToDisplay(solicitudItem.fechaFinVacaciones)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Días</Typography>
                        <Typography variant="body2" fontWeight="800" color="primary.main">{solicitudItem.cantidadDiasSolicitados}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleOpenSolicitudModal(solicitudItem)}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      alignSelf: { xs: 'flex-start', sm: 'center' },
                      minWidth: 140
                    }}
                  >
                    Ver Detalles
                  </Button>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Espacio en la parte inferior para evitar que quede pegado al borde */}
        <Box sx={{ height: 40 }} />

        {/* Modal de Días Festivos */}
        <Modal
          open={openFestivos}
          onClose={handleCloseFestivos}
          aria-labelledby="festivos-modal-title"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: '90%', sm: '70%', md: 600 },
              maxHeight: "85vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 3,
              p: 4,
              overflowY: "auto",
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseFestivos}
              sx={{ position: "absolute", top: 12, right: 12, color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
            
            <Typography id="festivos-modal-title" variant="h5" sx={{ mb: 3, fontWeight: "bold", textAlign: "center", color: "#e65100" }}>
              <EventAvailableIcon sx={{ mr: 1, verticalAlign: "bottom" }} />
              Días Festivos Oficiales
            </Typography>

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#fff3e0" }}>
                    <TableCell><Typography fontWeight="bold" color="#e65100">Fecha</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold" color="#e65100">Festividad</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight="bold" color="#e65100">Estado</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listaFestivos && listaFestivos.length > 0 ? (
                    listaFestivos.map((festivo) => (
                      <TableRow key={festivo.idDiasFestivos} hover>
                        <TableCell>{formatDateToDisplay(festivo.fechaDiaFestivo)}</TableCell>
                        <TableCell>
                          {festivo.nombreDiaFestivo}
                          {festivo.medioDia === 1 || festivo.medioDia === true ? (
                            <Chip label="Medio Día" size="small" color="primary" sx={{ ml: 1, height: 20, fontSize: "0.7rem" }} />
                          ) : null}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={festivo.estado === 'A' ? "Activo" : "Inactivo"} 
                            color={festivo.estado === 'A' ? "success" : "default"} 
                            size="small" 
                            variant={festivo.estado === 'A' ? "filled" : "outlined"}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No hay días festivos registrados o activos en la base de datos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button onClick={handleCloseFestivos} variant="contained" sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" } }}>
                Cerrar
              </Button>
            </Box>
          </Box>
        </Modal>

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
              Detalles de la Solicitud {selectedSolicitud ? (selectedSolicitud.correlativo || "CNA-URRH-" + selectedSolicitud.idSolicitud) : ""}
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

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {selectedSolicitud && (selectedSolicitud.estadoSolicitud === "autorizadas" || selectedSolicitud.estadoSolicitud === "finalizadas") && (
                <Button
                  onClick={() => handleDownloadPDF(selectedSolicitud.idSolicitud, selectedSolicitud.idEmpleado)}
                  color="success"
                  variant="contained"
                  sx={{
                    flex: 1,
                    padding: "12px 0",
                    backgroundColor: "#2e7d32",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "#1b5e20",
                    },
                  }}
                  startIcon={<DescriptionIcon />}
                >
                  Descargar Informe Oficial
                </Button>
              )}
              <Button
                onClick={handleCloseSolicitudModal}
                color="primary"
                variant="outlined"
                sx={{
                  flex: selectedSolicitud && (selectedSolicitud.estadoSolicitud === "autorizadas" || selectedSolicitud.estadoSolicitud === "finalizadas") ? 1 : '100%',
                  padding: "12px 0",
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.05)",
                  },
                }}
              >
                Cerrar Detalles
              </Button>
            </Box>
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
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: '95%', md: '85%', lg: '75%' },
              maxWidth: 1400,
              maxHeight: "90vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 2,
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

            {/* SECCIÓN FINIQUITOS POR PERÍODO */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 2 }}>
                📄 Finiquitos por Período Vacacional
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {getPeriodosSummary().map((p) => (
                  <Paper
                    key={`finiquito-${p.periodo}`}
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: p.saldo <= 0 ? "#f44336" : "#4caf50",
                      minWidth: "180px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "translateY(-2px)" }
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                      Período {p.periodo}
                    </Typography>
                    {p.saldo <= 0 ? (
                      <>
                        <Chip label="Agotado (0 días)" sx={{ bgcolor: "#f44336", color: "#fff", fontWeight: "bold", my: 1 }} size="small" />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PictureAsPdfIcon />}
                          onClick={(e) => handleDownloadFiniquito(p.periodo, e)}
                          sx={{
                            bgcolor: "#d32f2f",
                            textTransform: "none",
                            mt: 0.5,
                            px: 2,
                            borderRadius: 2,
                            fontWeight: 600,
                            "&:hover": { bgcolor: "#b71c1c" }
                          }}
                        >
                          Descargar Finiquito
                        </Button>
                      </>
                    ) : (
                      <Chip label={`Activo (${p.saldo} días)`} sx={{ bgcolor: "#4caf50", color: "#fff", fontWeight: "bold", my: 1 }} size="small" />
                    )}
                  </Paper>
                ))}
                {getPeriodosSummary().length === 0 && (
                  <Typography variant="body2" color="text.secondary">No hay historiales registrados.</Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: "wrap", gap: 2 }}>
              <FormControl variant="outlined" sx={{ width: 300 }}>
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

              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                onClick={handleExportDataToExcel}
                sx={{ 
                  backgroundColor: "#1A237E", 
                  color: "#fff", 
                  height: 56, 
                  fontWeight: 600,
                  borderRadius: "20px",
                  textTransform: "none",
                  '&:hover': { backgroundColor: "#0D47A1" }
                }}
              >
                Exportar Historial
              </Button>

              <Button
                variant="contained"
                startIcon={<DescriptionIcon />}
                onClick={handleExportDataToPdf}
                sx={{ 
                  backgroundColor: "#b71c1c", 
                  color: "#fff", 
                  height: 56, 
                  fontWeight: 600,
                  borderRadius: "20px",
                  textTransform: "none",
                  '&:hover': { backgroundColor: "#c62828" }
                }}
              >
                Constancia PDF
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400, width: '100%', overflowX: 'auto' }}>
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
                          whiteSpace: "nowrap",
                          px: 2
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