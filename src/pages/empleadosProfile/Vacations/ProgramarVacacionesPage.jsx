import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EventIcon from "@mui/icons-material/Event";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BusinessIcon from "@mui/icons-material/Business";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import Spinner from "../../../components/spinners/spinner";
import dayjs from "dayjs";
import { useCheckSession } from "../../../services/session/checkSession";
import {
  calcularFechaFin,
  calcularProximaFechaLaboral,
  esDiaLaboral,
  calcularRetornoYFestivos,
} from "../../../services/utils/dates/vacationUtils.js";
import useDiasFestivos from "../../../hooks/DiasFestivos/useDiasFestivos.js";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData.js";
import { ingresarSolicitudService } from "../../../services/VacationApp/InresarSolicitud.service.js";
import { obtenerHistorialService } from "../../../services/VacationApp/Historial/ControlDiasVacaciones.service.js";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";
import { useNavigate } from "react-router-dom";
import { useSolicitudById } from "../../../hooks/VacationAppHooks/useSolicitudById.js";
import { useGetCoordinadoresList } from "../../../hooks/Coordinadores/useGetCoordinadoresList.js";
import { consultarExcepcionLimiteService } from "../../../services/vacacionesespeciales/Vacacionesesepeciales.service.js";
import NotificationSnackbar from "../../../components/UI/NotificationSnackbar";
import ConfirmationModal from "../../../components/UI/ConfirmationModal";
import { useDatosLaborales } from "../../../hooks/EmpleadosHooks/useDatosLaboales.js";
import { useJerarquiaUnidades } from "../../../hooks/UnidadesHooks/useJerarquiaUnidades.js";

const ProgramarVacacionesPage = () => {
  const isSessionVerified = useCheckSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [diasVacaciones, setDiasVacaciones] = useState("0");
  const [endDate, setEndDate] = useState("");
  const [nextWorkDate, setNextWorkDate] = useState("");
  const [unidad, setUnidad] = useState("");
  const [selectedCoordinador, setSelectedCoordinador] = useState("");
  const [idEmpleado, setIdEmpleado] = useState("");
  const [idInfoPersonal, setIdInfoPersonal] = useState("");
  const [diasHabilitado, setDiasHabilitado] = useState(false);
  const [hasExcepcionLimite, setHasExcepcionLimite] = useState(false);
  const [excepcionDias, setExcepcionDias] = useState(null);
  const [showAllCoordinators, setShowAllCoordinators] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [diasError, setDiasError] = useState("");
  const [festivosOmitidos, setFestivosOmitidos] = useState([]);
  
  // States para el desglose por periodo
  const [historialPeriodos, setHistorialPeriodos] = useState([]);
  const [distribucionPreview, setDistribucionPreview] = useState(null);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  
  const navigate = useNavigate();

  const { solicitud, diasValidos, errorS, loadingS, sinDias, hasGestion, diasDebitados, diasDisponiblesT, diasSolicitablesT, solicitudesEmpleado } = useSolicitudById();
  const { coordinadoresList, errorCoordinadoresList, loadingCoordinadoresList } = useGetCoordinadoresList();
  const { datosLaborales, loading: loadingDL } = useDatosLaborales();
  const { jerarquia, loadingJerarquia } = useJerarquiaUnidades();

  const { isLoading, errorDF } = useDiasFestivos();

  // Calcular días consumidos (solicitados o aprobados) en el año en curso
  const diasConsumidosEsteAnio = (solicitudesEmpleado || [])
    .filter(req => 
      req.estadoSolicitud !== 'RECHAZADA' && 
      req.estadoSolicitud !== 'CANCELADA' && 
      dayjs(req.fechaSolicitud).year() === dayjs().year()
    )
    .reduce((sum, req) => sum + parseInt(req.cantidadDiasSolicitados || 0), 0);

  const MAX_DIAS_SOLICITUD = (hasExcepcionLimite && excepcionDias !== null) ? excepcionDias : 20;
  
  // Límite anual disponible para solicitar (no puede exceder el maximo autorizado/legal anual)
  const limiteRestanteEsteAnio = Math.max(0, MAX_DIAS_SOLICITUD - diasConsumidosEsteAnio);

  // Ajustar el historial restando los días ya consumidos este año (FIFO)
  const historialAjustado = React.useMemo(() => {
    if (!historialPeriodos || historialPeriodos.length === 0) return [];
    
    const adjusted = historialPeriodos.map(p => ({ ...p }));
    adjusted.sort((a, b) => a.periodo - b.periodo); // Más antiguo primero
    
    let diasADescontar = diasConsumidosEsteAnio;
    
    for (let p of adjusted) {
      if (diasADescontar <= 0) break;
      if (p.periodo !== dayjs().year() && p.disponibles > 0) {
        const descontar = Math.min(diasADescontar, p.disponibles);
        p.disponibles -= descontar;
        diasADescontar -= descontar;
      }
    }
    
    return adjusted.sort((a, b) => b.periodo - a.periodo); // Más reciente primero para UI
  }, [historialPeriodos, diasConsumidosEsteAnio]);

  const totalDiasReales = historialAjustado
    .filter(p => p.disponibles > 0 && p.periodo !== dayjs().year())
    .reduce((acc, p) => acc + p.disponibles, 0);
    
  const diasDisponibles = historialAjustado.length > 0 
    ? Math.min(totalDiasReales, limiteRestanteEsteAnio)
    : Math.max(0, (diasSolicitablesT < limiteRestanteEsteAnio ? diasSolicitablesT : limiteRestanteEsteAnio) - (diasDebitados || 0));

  const formatDateToDisplay = (date) => dayjs(date).format("DD/MM/YYYY");

  useEffect(() => {
    const userData = getLocalStorageData();
    if (userData?.unidad) {
      setUnidad(userData.unidad);
      setIdEmpleado(userData.idEmpleado);
      setIdInfoPersonal(userData.idInfoPersonal);
    }
  }, [solicitud]);

  useEffect(() => {
    const fetchExcepcion = async () => {
      if (idEmpleado) {
        try {
          const result = await consultarExcepcionLimiteService(idEmpleado, dayjs().format("YYYY-MM-DD"));
          setHasExcepcionLimite(result?.isExist > 0);
          setExcepcionDias(result?.diasAutorizados || null);
          
          // Traer historial para desglose
          const hist = await obtenerHistorialService(idEmpleado);
          if (hist && hist.historial) {
            // Calcular saldos por periodo sumando creditos y restando debitos
            const summary = {};
            hist.historial.forEach(item => {
              const p = item.periodo;
              if (!summary[p]) summary[p] = { periodo: p, creditos: 0, debitos: 0, disponibles: 0 };
              if (item.tipoRegistro === 1 && !item.idSolicitudOriginal) {
                summary[p].creditos += Number(item.diasAcreditados) || Number(item.totalDiasAcreditados) || 0;
                if (item.diasDebitados) summary[p].debitos += Number(item.diasDebitados);
              } else if (item.tipoRegistro === 2) {
                summary[p].debitos += Number(item.diasTomados || item.diasDebitados || item.totalDiasDebitados) || 0;
              }
            });
            Object.values(summary).forEach(s => s.disponibles = s.creditos - s.debitos);
            setHistorialPeriodos(Object.values(summary).sort((a, b) => b.periodo - a.periodo));
          }
        } catch (err) {
          console.error("Error al consultar excepcion o historial:", err);
        }
      }
    };
    fetchExcepcion();
  }, [idEmpleado]);

  const filteredCoordinadores = React.useMemo(() => {
    if (!coordinadoresList) return [];
    if (showAllCoordinators) return coordinadoresList;

    const puestoUser = (datosLaborales?.puesto || "").trim().toLowerCase();
    const unidadNormalizada = (unidad || "").trim().toLowerCase();

    // Regla para el Director General
    if (puestoUser === "director general") {
      const match = coordinadoresList.filter(c => c.coordinadorUnidad === "Subdirección General");
      if (match.length > 0) return match;
    }

    // Regla para el Subdirector General
    if (puestoUser === "subdirector general") {
      const match = coordinadoresList.filter(c => c.coordinadorUnidad === "Dirección General");
      if (match.length > 0) return match;
    }

    // Regla: La Secretaria General (Andrea) es aprobada por el Director General (Edwin)
    if (unidadNormalizada.includes("secretaría general") && (puestoUser.includes("secretaria general") || puestoUser.includes("secretario general"))) {
      const match = coordinadoresList.filter(c => c.coordinadorUnidad === "Dirección General");
      if (match.length > 0) return match;
    }

    // Regla 2: Subcoordinadores del Equipo Multidisciplinario
    if (unidadNormalizada.includes("equipo multidisciplinario") || unidadNormalizada.includes("subcoordinación de atención")) {
      if (puestoUser.includes("subcoordinador")) {
        const match = coordinadoresList.filter(c => c.coordinadorUnidad === "Coordinación de Equipo Multidisciplinario");
        if (match.length > 0) return match;
      }
    }

    const isJefe = puestoUser.includes("director") || 
                   puestoUser.includes("coordinador") || 
                   puestoUser.includes("jefe") || 
                   puestoUser.includes("secretario");

    if (isJefe) {
      // Regla 3: Jefes/Coordinadores que reportan al Subdirector
      if (
        unidadNormalizada.includes("tecnologías de la información") || // UTICS
        unidadNormalizada.includes("administración financiera") || // UDAF
        unidadNormalizada.includes("recursos humanos") || // RRHH
        unidadNormalizada.includes("planificación") // Planificación Social
      ) {
        const match = coordinadoresList.filter(c => c.coordinadorUnidad === "Subdirección General");
        if (match.length > 0) return match;
      }

      // Regla 4: Jefes/Coordinadores que reportan al Director General
      if (
        unidadNormalizada.includes("registro") || 
        unidadNormalizada.includes("asesoría jurídica") || // UDAJ
        unidadNormalizada.includes("equipo multidisciplinario") || 
        unidadNormalizada.includes("auditoría")
      ) {
        const match = coordinadoresList.filter(c => c.coordinadorUnidad === "Dirección General");
        if (match.length > 0) return match;
      }

      // Fallback para otros jefes
      const node = jerarquia.find(j => j.unidad === unidad);
      const unidadPadre = node ? node.reportaA : unidad;
      
      const match = coordinadoresList.filter(c => c.coordinadorUnidad === unidadPadre);
      return match.length > 0 ? match : coordinadoresList;
    } else {
      // Regla por defecto para resto de empleados: aprueba el jefe de su propia unidad
      if (unidadNormalizada.includes("subcoordinación de atención")) {
          const match = coordinadoresList.filter(c => c.coordinadorUnidad === "Coordinación de Equipo Multidisciplinario");
          if (match.length > 0) return match;
      }
      
      const match = coordinadoresList.filter(c => c.coordinadorUnidad === unidad);
      return match.length > 0 ? match : coordinadoresList;
    }
  }, [coordinadoresList, showAllCoordinators, unidad, datosLaborales, jerarquia]);

  useEffect(() => {
    if (filteredCoordinadores && filteredCoordinadores.length > 0 && !selectedCoordinador) {
       if (filteredCoordinadores.length === 1) {
           setSelectedCoordinador(filteredCoordinadores[0].idCoordinador);
       } else {
           const match = filteredCoordinadores.find(c => c.coordinadorUnidad === unidad);
           if (match) setSelectedCoordinador(match.idCoordinador);
       }
    }
  }, [filteredCoordinadores, unidad]);

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (!selectedDate) {
      setStartDate("");
      setStartDateError("");
      setDiasHabilitado(false);
      setDiasVacaciones("");
      setEndDate("");
      setNextWorkDate("");
      return;
    }

    setStartDate(selectedDate);

    if (!esDiaLaboral(selectedDate)) {
      setStartDateError("Día no laborable seleccionado. Por favor elige un día hábil.");
      setDiasHabilitado(false);
      setDiasVacaciones("");
      setEndDate("");
      setNextWorkDate("");
      return;
    }

    setStartDateError("");
    setDiasVacaciones("");
    setDiasHabilitado(true);
    setEndDate("");
    setNextWorkDate("");
    setDiasError("");
    setFestivosOmitidos([]);
  };

  const handleDiasVacacionesChange = (e) => {
    const dias = parseInt(e.target.value, 10) || 0;
    setDiasVacaciones(dias);
    setDiasError("");

    if (dias > diasDisponibles) {
      const mensaje = diasDisponibles === 1
        ? `Solo tienes 1 día disponible para solicitar este año.`
        : diasDisponibles === 0
        ? `No tienes días disponibles. Ya has utilizado los 20 días permitidos este año.`
        : `Solo tienes ${diasDisponibles} días disponibles para solicitar este año.`;
      
      setDiasError(mensaje);
      setEndDate("");
      setNextWorkDate("");
      setFestivosOmitidos([]);
      return;
    }

    if (dias > MAX_DIAS_SOLICITUD) {
      setDiasError(`Solo puedes programar un máximo de ${MAX_DIAS_SOLICITUD} días por solicitud.`);
      setDiasVacaciones("");
      setEndDate("");
      setNextWorkDate("");
      setFestivosOmitidos([]);
      return;
    }

    if (startDate && dias > 0) {
      const { fechaFin, proximaFechaLaboral, festivosEncontrados } = calcularRetornoYFestivos(startDate, dias);
      
      // Validación de superposición de fechas
      const sStart = dayjs(startDate).startOf('day').valueOf();
      const sEnd = fechaFin.startOf('day').valueOf();
      
      const solicitudesActivas = (solicitudesEmpleado || []).filter(req => 
        req.estadoSolicitud !== 'RECHAZADA' && 
        req.estadoSolicitud !== 'CANCELADA'
      );

      let overlapError = null;
      for (let req of solicitudesActivas) {
        if (!req.fechaInicioVacaciones || !req.fechaFinVacaciones) continue;
        const reqStart = dayjs(req.fechaInicioVacaciones).startOf('day').valueOf();
        const reqEnd = dayjs(req.fechaFinVacaciones).startOf('day').valueOf();

        if (sStart <= reqEnd && sEnd >= reqStart) {
          const fStart = dayjs(req.fechaInicioVacaciones).format('DD/MM/YYYY');
          const fEnd = dayjs(req.fechaFinVacaciones).format('DD/MM/YYYY');
          overlapError = `Las fechas seleccionadas chocan con otra solicitud tuya del ${fStart} al ${fEnd}.`;
          break;
        }
      }

      if (overlapError) {
        setDiasError(overlapError);
        setDiasVacaciones("");
        setEndDate("");
        setNextWorkDate("");
        setFestivosOmitidos([]);
        return;
      }

      setEndDate(fechaFin.format("YYYY-MM-DD"));
      setNextWorkDate(proximaFechaLaboral.format("YYYY-MM-DD"));
      setFestivosOmitidos(festivosEncontrados);
    } else {
      setEndDate("");
      setNextWorkDate("");
      setFestivosOmitidos([]);
    }
  };

  const handleCoordinadorChange = (e) => {
    const coordinadorId = e.target.value;
    const coordinadorSeleccionado = coordinadoresList.find(c => c.idCoordinador === coordinadorId);
    
    if (coordinadorSeleccionado) {
      setSelectedCoordinador(coordinadorId);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!startDate || diasVacaciones <= 0 || !selectedCoordinador) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }
    
    // Calcular distribución
    let diasFaltantes = parseInt(diasVacaciones, 10);
    const distribucion = [];
    
    // Filtrar periodos válidos y ordenar del más antiguo al más reciente (FIFO)
    const validPeriods = historialAjustado
      .filter(p => p.disponibles > 0 && p.periodo !== dayjs().year())
      .sort((a, b) => a.periodo - b.periodo);
      
    for (const p of validPeriods) {
      if (diasFaltantes <= 0) break;
      const tomar = Math.min(diasFaltantes, p.disponibles);
      distribucion.push({ periodo: p.periodo, tomados: tomar, restantes: p.disponibles - tomar });
      diasFaltantes -= tomar;
    }
    
    setDistribucionPreview(distribucion);
    setConfirmSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmSubmitModal(false);
    setLoading(true);
    setError(null);

    const userSes = getLocalStorageData();
    const payload = {
      idEmpleado,
      idInfoPersonal,
      unidadSolicitud: unidad,
      fechaInicioVacaciones: startDate,
      fechaFinVacaciones: endDate,
      fechaRetornoLabores: nextWorkDate,
      cantidadDiasSolicitados: diasVacaciones,
      idCoordinador: selectedCoordinador,
      idUsuarioSession: userSes?.idUsuario || userSes?.idEmpleado || idEmpleado,
      usuarioSession: userSes?.usuario || "Empleado"
    };

    try {
      setDiasHabilitado(false);
      const res = await ingresarSolicitudService(payload);
      setSuccessOpen(true);
      setTimeout(() => {
        navigate("/empleados/programar-vacaciones");
      }, 1000);
    } catch (error) {
      setError(
        error.response
          ? "Error en la solicitud. Inténtalo de nuevo."
          : "Hubo un problema con el servicio. Intenta más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOpen(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    navigate("/empleados/programar-vacaciones");
  };

  if (!isSessionVerified || !isLoading || loadingS || loadingCoordinadoresList) {
    return <Spinner />;
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f1f3f4" }}>
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: "0px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 800,
            color: "#1A237E",
            mb: 3,
            mt: 4
          }}
        >
          Programa Tus Vacaciones
        </Typography>

        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <InfoIcon color="primary" />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Días disponibles a solicitar:
          </Typography>
          <Chip
            label={`${diasDisponibles} de ${MAX_DIAS_SOLICITUD}`}
            color={diasDisponibles > 10 ? "success" : diasDisponibles > 5 ? "warning" : "error"}
            sx={{ fontWeight: "bold" }}
          />
          {hasExcepcionLimite && (
            <Chip 
              icon={<WarningIcon />} 
              label="Excepción >20 Habilitada" 
              color="secondary" 
              size="small" 
              sx={{ fontWeight: "bold", ml: 1 }} 
            />
          )}
        </Box>
        
        {historialAjustado.length > 0 && (
          <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
            {historialAjustado.filter(p => p.disponibles > 0 && p.periodo !== dayjs().year()).map((p) => (
              <Chip
                key={p.periodo}
                label={`${p.disponibles}/${p.creditos} del ${p.periodo}`}
                variant="outlined"
                color="primary"
                size="small"
              />
            ))}
          </Box>
        )}

        {limiteRestanteEsteAnio === 0 && (
          <Alert severity="warning" sx={{ mb: 3, maxWidth: "550px", width: "100%", borderRadius: 2 }}>
            <AlertTitle>Límite Anual Alcanzado</AlertTitle>
            Has programado <strong>{diasConsumidosEsteAnio}</strong> días en el año actual, alcanzando el límite máximo permitido. 
            Comunícate con Recursos Humanos si necesitas una excepción para solicitar más días.
          </Alert>
        )}

        <Box sx={{ height: 30, mb: 3 }}>
          {(error || (errorS && errorS !== "NO EXISTE SOLICITUDES") || errorCoordinadoresList) && (
            <ErrorAlert message={error || errorCoordinadoresList} visible={true} />
          )}
        </Box>

        <Paper
          component="form"
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: "550px",
            borderRadius: "8px",
            borderTop: "4px solid #1A237E",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          mb: 4,
        }}
        onSubmit={handlePreSubmit}
      >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Fecha de inicio"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={handleStartDateChange}
                error={!!startDateError}
                helperText={startDateError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon color={startDateError ? "error" : "primary"} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Cantidad de días"
                type="number"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={diasVacaciones}
                onChange={handleDiasVacacionesChange}
                inputProps={{ min: 1, max: diasDisponibles }}
                disabled={!diasHabilitado}
                error={!!diasError}
                helperText={diasError || `Máximo ${diasDisponibles} días disponibles`}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRangeIcon color={diasHabilitado ? "primary" : "disabled"} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Fecha de fin"
                fullWidth
                value={endDate ? formatDateToDisplay(endDate) : ""}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
                disabled={!diasHabilitado}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon color={diasHabilitado ? "primary" : "disabled"} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Fecha de reintegro"
                fullWidth
                value={nextWorkDate ? formatDateToDisplay(nextWorkDate) : ""}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
                disabled={!diasHabilitado}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon color={diasHabilitado ? "primary" : "disabled"} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {festivosOmitidos && festivosOmitidos.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<EventIcon />} sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    ¡Días festivos integrados en tu período!
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Las siguientes fechas son asuetos oficiales y <strong>no se descontarán</strong> de tu saldo de vacaciones:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {festivosOmitidos.map((festivo, index) => (
                      <Chip 
                        key={index} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        label={`${formatDateToDisplay(festivo.fechaDiaFestivo)} - ${festivo.nombreDiaFestivo}`} 
                        sx={{ bgcolor: 'rgba(25, 118, 210, 0.05)' }}
                      />
                    ))}
                  </Box>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="coordinador-label">Coordinador</InputLabel>
                <Select
                  labelId="coordinador-label"
                  id="coordinador-select"
                  value={selectedCoordinador}
                  label="Coordinador"
                  onChange={handleCoordinadorChange}
                  required
                  startAdornment={
                    <InputAdornment position="start" sx={{ pl: 1 }}>
                      <AssignmentIndIcon color="primary" />
                    </InputAdornment>
                  }
                >
                  {filteredCoordinadores.map((coordinador) => (
                    <MenuItem 
                      key={coordinador.idCoordinador} 
                      value={coordinador.idCoordinador}
                    >
                      {coordinador.nombreCoordinador} - {coordinador.puestoCoordinador}
                    </MenuItem>
                  ))}
                </Select>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={showAllCoordinators}
                      onChange={(e) => setShowAllCoordinators(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" color="text.secondary">
                      Si tu jefe no se encuentra o está de vacaciones, marca esta casilla para ver a todos los jefes disponibles (como suplente).
                    </Typography>
                  }
                  sx={{ mt: 0.5, ml: 0 }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Unidad"
                fullWidth
                value={unidad}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="button"
                variant="contained"
                fullWidth
                disabled={!diasHabilitado || loading || !diasVacaciones || !selectedCoordinador || !!diasError || diasDisponibles === 0}
                onClick={handlePreSubmit}
                sx={{
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1A237E 0%, #1565C0 100%)",
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                  },
                  '&.Mui-disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Solicitud"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <NotificationSnackbar
          open={successOpen}
          onClose={handleCloseSuccess}
          message="Solicitud enviada exitosamente"
          severity="success"
        />

        <ConfirmationModal
          open={confirmSubmitModal}
          title="Confirmar Distribución de Días"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmSubmitModal(false)}
          confirmText="Confirmar Solicitud"
          cancelText="Revisar"
        >
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Tus {diasVacaciones} días solicitados se descontarán de la siguiente manera:
            </Typography>
            {distribucionPreview && distribucionPreview.map(d => (
              <Typography key={d.periodo} variant="body2" sx={{ ml: 2, mb: 1 }}>
                • <strong>{d.tomados} días</strong> del período {d.periodo} (te quedarán {d.restantes} días).
              </Typography>
            ))}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
              ¿Estás seguro de continuar con la solicitud?
            </Typography>
          </Box>
        </ConfirmationModal>

        <ConfirmationModal
          open={!hasGestion && (!diasValidos || !sinDias)}
          onClose={handleCloseModal}
          icon={<WarningIcon />}
          iconBgColor="#fef2f2"
          iconColor="#A00000"
          title="No puedes solicitar vacaciones"
          titleColor="#A00000"
          buttonText="Volver"
          buttonColor="#1A237E"
          buttonHoverColor="#0D47A1"
        >
          <Typography variant="subtitle1" align="center" sx={{ lineHeight: 1.6 }}>
            <strong>No aplica a vacaciones según el artículo 70 del reglamento interno de trabajo
              y gestión del recurso humano del Consejo Nacional de Adopciones.
            </strong>
          </Typography>
        </ConfirmationModal>
      </Box>
    </Box>
  );
};

export default ProgramarVacacionesPage;