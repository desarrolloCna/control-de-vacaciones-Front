import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ViewListIcon from "@mui/icons-material/ViewList";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SearchIcon from "@mui/icons-material/Search";
import GetAppIcon from "@mui/icons-material/GetApp";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { getEstado } from "../../../config/statusConfig.js";
import { useSolicitudes } from "../../../hooks/VacationAppHooks/useSolicitudes";
import api from "../../../config/api";
import { formatDateToDisplay } from "../../../services/utils/dates/vacationUtils";
import { getDiasFestivos } from "../../../services/EmpleadosServices/DiasFestivos/GetDiasFestivos";
import { StyledButton } from "../../../components/UI/UIComponents";
import NotificationSnackbar from "../../../components/UI/NotificationSnackbar";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Solicitudes.styles.css";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

// Extender dayjs con los plugins necesarios
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { es },
});

const calendarMessages = {
  allDay: "Todo el día",
  previous: "<",
  next: ">",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay solicitudes programadas",
  showMore: (total) => `+ Ver más (${total})`,
};

const SolicitudesPage = () => {
  const isSessionVerified = useCheckSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [descripcionRechazo, setDescripcionRechazo] = useState("");
  const [searchText, setSearchText] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [isEstadoChanged, setIsEstadoChanged] = useState(false);
  const { solicitudesU, cantadSolicitudes, errorU, loadingU, refetch } = useSolicitudes();
  const [successOpen, setSuccessOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [festivos, setFestivos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Cargar Días Festivos
  useEffect(() => {
    getDiasFestivos().then(data => {
      const formattedFestivos = data.map(festivo => ({
        id: `festivo-${festivo.idDiaFestivo}`,
        title: `🏢 ${festivo.nombreFestividad || "Día Festivo"}`,
        start: parse(festivo.fechaDiaFestivo, "yyyy-MM-dd", new Date()),
        end: parse(festivo.fechaDiaFestivo, "yyyy-MM-dd", new Date()),
        color: "#E65100", // naranja oscuro para destacar
        isFestivo: true,
        isWeekend: false,
        allDay: true,
        tooltipContent: `Día Festivo Institucional: ${festivo.nombreFestividad}`
      }));
      setFestivos(formattedFestivos);
    }).catch(err => console.error("Error al obtener festivos:", err));
  }, []);

  // Función para generar colores únicos por empleado
  const getEmployeeColor = (employeeName) => {
    const colors = [
      "#4285F4", "#34A853", "#FBBC05", "#EA4335", "#ff6b6b",
      "#2ECC71", "#E74C3C", "#3498DB", "#1ABC9C", "#9B59B6",
      "#34495E", "#16A085", "#27AE60", "#2980B9", "#8E44AD",
      "#2C3E50", "#F39C12", "#D35400", "#C0392B", "#7F8C8D",
    ];
    
    let hash = 0;
    for (let i = 0; i < employeeName.length; i++) {
      hash = employeeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Transformar solicitudes a eventos del calendario
  useEffect(() => {
    if (solicitudesU && solicitudesU.length > 0) {
      const eventosFiltrados = solicitudesU.filter(
        solicitud => ["autorizadas", "enviada", "aceptada", "reprogramada", "aceptadas", "reprogramadas"].includes((solicitud.estadoSolicitud || "").toLowerCase())
      );
      
      const events = [];
      const today = dayjs().startOf('day');
      
      eventosFiltrados.forEach((solicitud) => {
        const fechaInicio = dayjs(solicitud.fechaInicioVacaciones).startOf('day');
        const fechaFin = dayjs(solicitud.fechaFinVacaciones).endOf('day'); // IMPORTANTE: .endOf('day') para incluir todo el día
        
        // Color por empleado
        const baseColor = getEmployeeColor(solicitud.nombreCompleto);
        
        // Estado dinámico para el tooltip con capitalización inicial
        const rawStatus = solicitud.estadoSolicitud || "Desconocido";
        const estadoObj = getEstado(rawStatus) || { label: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1) };
        const estado = estadoObj.label;
        
        // Crear un evento para cada día del rango (INCLUSIVE - ambos extremos incluidos)
        let currentDate = fechaInicio;
        
        while (currentDate.isSameOrBefore(fechaFin, 'day')) {
          const dayOfWeek = currentDate.day();
          const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
          
          // Determinar brillo según el día de la semana
          let colorBrightness = 1.0;
          if (dayOfWeek === 1) colorBrightness = 0.9;      // Lunes
          else if (dayOfWeek === 2) colorBrightness = 0.85; // Martes
          else if (dayOfWeek === 3) colorBrightness = 0.8;  // Miércoles
          else if (dayOfWeek === 4) colorBrightness = 0.75; // Jueves
          else if (dayOfWeek === 5) colorBrightness = 0.7;  // Viernes
          else if (dayOfWeek === 6) colorBrightness = 0.5;  // Sábado
          else if (dayOfWeek === 0) colorBrightness = 0.4;  // Domingo
          
          // Convertir color HEX a RGB
          const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : null;
          };
          
          const rgb = hexToRgb(baseColor);
          if (rgb) {
            const adjustedColor = isWeekendDay 
              ? '#f5f5f5' // Color gris para fines de semana
              : `rgb(
                ${Math.round(rgb.r * colorBrightness)},
                ${Math.round(rgb.g * colorBrightness)},
                ${Math.round(rgb.b * colorBrightness)}
              )`;
            
            const isStartingDay = currentDate.isSame(fechaInicio, 'day');
            const isEndingDay = currentDate.isSame(fechaFin, 'day');
            const isCurrentDay = currentDate.isSame(today, 'day');
            
            // Calcular el índice del día para el ID único
            const dayIndex = currentDate.diff(fechaInicio, 'day');
            
            events.push({
              id: `${solicitud.idSolicitud}-${dayIndex}`,
              title: isWeekendDay ? "Fin de semana" : solicitud.nombreCompleto,
              start: currentDate.toDate(), // Convertir a objeto Date
              end: currentDate.endOf('day').toDate(), // Fin del día
              estado: estado,
              empleado: solicitud.nombreCompleto,
              dias: solicitud.cantidadDiasSolicitados,
              fechaRetorno: solicitud.fechaRetornoLabores,
              color: adjustedColor,
              originalColor: baseColor,
              isWeekend: isWeekendDay,
              isStartingDay: isStartingDay,
              isEndingDay: isEndingDay,
              isCurrentDay: isCurrentDay,
              isSingleDay: fechaInicio.isSame(fechaFin, 'day'),
              solicitudData: solicitud,
              tooltipContent: isWeekendDay 
                ? "Fin de semana - No laborable"
                : `${solicitud.nombreCompleto} - ${estado}\nDías: ${solicitud.cantidadDiasSolicitados}\n${isStartingDay ? '🏁 Inicio' : ''}${isEndingDay ? ' 🏁 Fin' : ''}`,
            });
          }
          
          // Avanzar al siguiente día
          currentDate = currentDate.add(1, 'day');
        }
      });
      
      setCalendarEvents(events);
    }
  }, [solicitudesU]);

  // Función para obtener el color del badge según el estado
  const getEstadoColor = (estado) => getEstado(estado).muiColor;

  // Función para obtener el texto del estado
  const getEstadoText = (estado) => getEstado(estado).label;

  const handleVerSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalOpen(true);
    setDescripcionRechazo("");
    if (solicitud) setIsEstadoChanged(false);
  };

  const handleSelectEvent = (event) => {
    // No abrir modal para eventos de fin de semana
    if (event.isWeekend) return;
    
    if (event.isFestivo) {
      setSelectedSolicitud(event);
      setModalOpen(true);
      return;
    }

    if (event.solicitudData) {
      setSelectedSolicitud(event.solicitudData);
      setModalOpen(true);
    }
  };

  const handleAutorizar = async () => {
    if (!selectedSolicitud) return;

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    const payload = {
      estadoSolicitud: "autorizadas",
      idEmpleado: selectedSolicitud.idEmpleado,
      idSolicitud: selectedSolicitud.idSolicitud,
      idUsuarioSession: userData.idUsuario || userData.idEmpleado,
      usuarioSession: userData.usuario || "desconocido",
    };

    try {
      const response = await api.put(
        `/UpdateEstadoSolicitud`,
        payload
      );

      setModalOpen(false);
      setSuccessOpen(true);
      await refetch();
    } catch (error) {
      console.error("Error al autorizar la solicitud:", error);
      alert("Hubo un error al autorizar la solicitud.");
    }
  };

  const handleRechazar = async () => {
    if (!descripcionRechazo) {
      alert("La descripción es requerida para rechazar la solicitud");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    const payload = {
      estadoSolicitud: "rechazada",
      idEmpleado: selectedSolicitud.idEmpleado,
      idSolicitud: selectedSolicitud.idSolicitud,
      descripcionRechazo: descripcionRechazo,
      idUsuarioSession: userData.idUsuario || userData.idEmpleado,
      usuarioSession: userData.usuario || "desconocido",
    };

    try {
      const response = await api.put(
        `/UpdateEstadoSolicitud`,
        payload
      );

      setModalOpen(false);
      setDescripcionRechazo("");
      setSuccessOpen(true);
      await refetch();
    } catch (error) {
      console.error("Error al rechazar la solicitud:", error);
      alert("Hubo un error al rechazar la solicitud.");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDescripcionRechazo("");
    setSelectedEvent(null);
  };

  const filteredSolicitudes = solicitudesU
    ?.filter(
      (solicitud) =>
        solicitud.nombreCompleto
          .toLowerCase()
          .includes(searchText.toLowerCase()) &&
        (estadoFilter ? solicitud.estadoSolicitud === estadoFilter : true)
    )
    .sort((a, b) => b.idSolicitud - a.idSolicitud) || [];

  const handleExportDataToExcel = () => {
    const dataToExport = filteredSolicitudes.map((solicitud) => ({
      ID: solicitud.correlativo || ("SLVC" + solicitud.idSolicitud),
      Empleado: solicitud.nombreCompleto,
      "Tipo Solicitud": "Solicitud de vacaciones",
      Estado: getEstado(solicitud.estadoSolicitud).label,
      "Fecha Inicio": formatDateToDisplay(solicitud.fechaInicioVacaciones),
      "Fecha Fin": formatDateToDisplay(solicitud.fechaFinVacaciones),
      "Fecha Reintegro": formatDateToDisplay(solicitud.fechaRetornoLabores),
      "Días Solicitados": solicitud.cantidadDiasSolicitados
    }));

    exportToExcel(dataToExport, 'Reporte_Solicitudes_Vacaciones');
  };

  const handleExportDataToPdf = () => {
    const dataToExport = filteredSolicitudes.map((solicitud) => ({
      ID: solicitud.correlativo || ("SLVC" + solicitud.idSolicitud),
      Empleado: solicitud.nombreCompleto,
      "Tipo Solicitud": "Solicitud de vacaciones",
      Estado: getEstado(solicitud.estadoSolicitud).label,
      "Fecha Inicio": formatDateToDisplay(solicitud.fechaInicioVacaciones),
      "Fecha Fin": formatDateToDisplay(solicitud.fechaFinVacaciones),
      "Fecha Reintegro": formatDateToDisplay(solicitud.fechaRetornoLabores),
      "Días Solicitados": solicitud.cantidadDiasSolicitados
    }));

    exportToPdf(dataToExport, 'Reporte_Solicitudes_Vacaciones');
  };

  const handleDownloadPDF = async (idSolicitud, idEmpleado) => {
    try {
      const response = await api.get(`/descargarInformePDF/${idSolicitud}/${idEmpleado}`, {
        responseType: 'blob'
      });
      
      const fileName = selectedSolicitud?.correlativo || `Solicitud_${idSolicitud}`;
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
      console.error("Error al descargar el PDF:", error);
      alert("Error al descargar el informe oficial. Por favor intente de nuevo.");
    }
  };

  const eventStyleGetter = (event) => {
    const isWeekendEvent = event.isWeekend;
    const isFestivo = event.isFestivo;
    
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "4px",
        color: isWeekendEvent ? "#999" : "white",
        border: "0px",
        display: "block",
        fontSize: "11px",
        padding: "2px 4px",
        margin: "1px 0",
        fontWeight: isFestivo ? "bold" : (isWeekendEvent ? "400" : "500"),
        opacity: event.isCurrentDay ? 1 : 0.9,
        boxShadow: event.isCurrentDay ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
        borderLeft: event.isSingleDay ? "3px solid #4CAF50" : 
                   event.isStartingDay ? "3px solid #4CAF50" : "none",
        borderRight: event.isSingleDay ? "3px solid #F44336" :
                    event.isEndingDay ? "3px solid #F44336" : "none",
        height: "22px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: isWeekendEvent ? "default" : "pointer",
        textDecoration: isWeekendEvent ? "line-through" : "none",
        position: 'relative',
      },
    };
  };

  // Función auxiliar para verificar si las vacaciones están activas
  const isVacationActive = (solicitud) => {
    if (!solicitud) return false;
    
    const fechaInicio = dayjs(solicitud.fechaInicioVacaciones);
    const fechaFin = dayjs(solicitud.fechaFinVacaciones);
    const today = dayjs();
    
    const isStartingToday = fechaInicio.isSame(today, 'day');
    const isOngoing = today.isBetween(fechaInicio, fechaFin, 'day', '[]'); // Incluye ambos extremos
    
    return isStartingToday || isOngoing;
  };

  // Función para renderizar el evento con tooltip
  const EventComponent = ({ event }) => {
    if (event.isWeekend) {
      return (
        <Tooltip 
          title="Fin de semana - No laborable"
          arrow
          placement="top"
        >
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            color: '#999',
            padding: '2px 4px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: '400',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'default',
            textDecoration: 'line-through',
            border: '1px dashed #ddd'
          }}>
            Fin de semana
          </div>
        </Tooltip>
      );
    }
    
    if (event.isFestivo) {
      return (
        <Tooltip title={event.tooltipContent} arrow placement="top">
          <div style={{
            backgroundColor: event.color,
            color: 'white',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(230,81,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {event.title}
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip 
        title={
          <div style={{ padding: '4px' }}>
            <strong>{event.empleado}</strong>
            <div>Estado: {event.estado}</div>
            <div>Días: {event.dias}</div>
            {event.isStartingDay && <div>🏁 Inicio de vacaciones</div>}
            {event.isEndingDay && <div>🏁 Fin de vacaciones</div>}
            {event.isSingleDay && <div>📅 Día único</div>}
          </div>
        }
        arrow
        placement="top"
      >
        <div style={{ 
          backgroundColor: event.color, 
          color: 'white',
          padding: '2px 4px',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: '500',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          position: 'relative'
        }}>
          {event.empleado}
          {event.isStartingDay && (
            <span style={{
              position: 'absolute',
              left: '2px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '8px'
            }}>🏁</span>
          )}
          {event.isEndingDay && (
            <span style={{
              position: 'absolute',
              right: '2px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '8px'
            }}>🏁</span>
          )}
          {event.isSingleDay && (
            <>
              <span style={{
                position: 'absolute',
                left: '2px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '8px'
              }}>🏁</span>
              <span style={{
                position: 'absolute',
                right: '2px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '8px'
              }}>🏁</span>
            </>
          )}
        </div>
      </Tooltip>
    );
  };

  if (!isSessionVerified || loadingU) {
    return <Spinner />;
  }

  // Contar solicitudes por estado
  const solicitudesPendientes = solicitudesU?.filter(s => s.estadoSolicitud === "enviada").length || 0;
  const solicitudesAprobadas = solicitudesU?.filter(s => s.estadoSolicitud === "autorizadas").length || 0;

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

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A237E', mb: 1 }}>
            Solicitudes de Vacaciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión y autorización de períodos vacacionales del CNA Sistema
          </Typography>
        </Box>

      <Box sx={{ mb: 3 }}>
          
          <Button
            variant="outlined"
            startIcon={showCalendar ? <ViewListIcon /> : <CalendarTodayIcon />}
            onClick={() => setShowCalendar(!showCalendar)}
            sx={{
              borderRadius: '24px',
              textTransform: 'none',
              fontWeight: 600,
              padding: '6px 20px',
              transition: 'all 0.2s ease',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }
            }}
          >
            {showCalendar ? "Ver Lista" : "Ver Calendario"}
          </Button>
        </Box>

        {showCalendar ? (
          // VISTA CALENDARIO
          <Box>
            {/* Estadísticas rápidas */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Card sx={{ flex: 1, boxShadow: 3, borderTop: '4px solid #1a73e8', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventNoteIcon sx={{ color: '#1a73e8', fontSize: 36 }} />
                  <Box>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {solicitudesU?.length || 0}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Total Solicitudes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1, boxShadow: 3, borderTop: '4px solid #f57c00', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventNoteIcon sx={{ color: '#f57c00', fontSize: 36 }} />
                  <Box>
                    <Typography variant="h5" sx={{ color: '#f57c00' }} fontWeight="bold">
                      {solicitudesPendientes}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Pendientes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1, boxShadow: 3, borderTop: '4px solid #43a047', borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventNoteIcon sx={{ color: '#43a047', fontSize: 36 }} />
                  <Box>
                    <Typography variant="h5" sx={{ color: '#43a047' }} fontWeight="bold">
                      {solicitudesAprobadas}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Aprobadas
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Calendario */}
            <Card sx={{ mb: 3, boxShadow: 3, borderRadius: '12px', overflow: 'hidden' }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ color: '#1a73e8' }} />
                    <Typography variant="h6" fontWeight="600" color="#202124">
                      Calendario de Vacaciones
                    </Typography>
                  </Box>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    Mostrando solicitudes aprobadas y pendientes. Los fines de semana se muestran en gris.
                  </Typography>
                }
              />
              <CardContent>
                <Box sx={{ height: 950, position: 'relative' }}>
                  {calendarEvents.length === 0 && festivos.length === 0 ? (
                    <Box className="calendar-empty">
                      <EventNoteIcon className="calendar-empty-icon" />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay solicitudes activas
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No hay solicitudes aprobadas o pendientes para mostrar en el calendario.
                      </Typography>
                    </Box>
                  ) : (
                    <Calendar
                      localizer={localizer}
                      events={[...calendarEvents, ...festivos]}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
                      dayPropGetter={(date) => {
                        const day = date.getDay();
                        if (day === 0 || day === 6) {
                          return {
                            style: {
                              backgroundColor: 'rgba(0,0,0,0.03)',
                              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)',
                              color: '#999',
                            },
                          };
                        }
                        return {};
                      }}
                      onSelectEvent={handleSelectEvent}
                      eventPropGetter={eventStyleGetter}
                      messages={calendarMessages}
                      defaultView={Views.MONTH}
                      views={[Views.MONTH, Views.WEEK, Views.DAY]}
                      culture="es"
                      components={{
                        event: EventComponent
                      }}
                      popup
                      showMultiDayTimes
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : (
          // VISTA TABLA
          <>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Buscar por empleado"
                variant="outlined"
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1a73e8" },
                    "&:hover fieldset": { borderColor: "#0d5fc1" },
                  },
                }}
              />
              <TextField
                select
                label="Filtrar por estado"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                variant="outlined"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="enviada">En espera</MenuItem>
                <MenuItem value="autorizadas">Autorizadas</MenuItem>
                <MenuItem value="rechazada">Rechazada</MenuItem>
                <MenuItem value="finalizadas">Finalizadas</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4, width: '100%' }}>
              {solicitudesU && solicitudesU.length > 0 ? (
                filteredSolicitudes.length > 0 ? (
                  filteredSolicitudes.map((solicitud) => {
                    const estadoObj = getEstado(solicitud.estadoSolicitud || "");
                    return (
                      <Paper
                        key={solicitud.idSolicitud}
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
                              {solicitud.correlativo || ("SLVC" + solicitud.idSolicitud)}
                            </Typography>
                            <Chip
                              label={estadoObj.label}
                              sx={{
                                backgroundColor: estadoObj.color,
                                color: estadoObj.textColor || '#fff',
                                fontWeight: "bold",
                                minWidth: "120px",
                              }}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                            {solicitud.nombreCompleto}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Tipo: Solicitud de vacaciones
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">Inicio</Typography>
                              <Typography variant="body2" fontWeight="600">{formatDateToDisplay(solicitud.fechaInicioVacaciones || solicitud.fechaAcreditacion)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">Fin</Typography>
                              <Typography variant="body2" fontWeight="600">{formatDateToDisplay(solicitud.fechaFinVacaciones || solicitud.fechaAcreditacion)}</Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleVerSolicitud(solicitud)}
                          sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            alignSelf: { xs: 'flex-start', sm: 'center' },
                            minWidth: 140,
                            color: 'secondary.main',
                            borderColor: 'secondary.main',
                            '&:hover': {
                              backgroundColor: 'secondary.light',
                              color: '#fff',
                            }
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </Paper>
                    );
                  })
                ) : (
                  <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                    <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight="600">No se encontraron solicitudes</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Cambia los filtros de búsqueda para ver más resultados.</Typography>
                  </Paper>
                )
              ) : (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                  <EventNoteIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "gray" }}>
                    No hay solicitudes disponibles.
                  </Typography>
                </Paper>
              )}
            </Box>
          </>
        )}

        {/* Notificación de éxito */}
        <NotificationSnackbar
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          message="Solicitud procesada exitosamente"
          severity="success"
        />

        {/* Modal de detalles */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90vw",
              maxWidth: "700px",
              maxHeight: "90vh",
              bgcolor: "white",
              borderRadius: "16px",
              p: 4,
              boxShadow: 24,
              overflow: "auto",
              outline: "none",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{ 
                position: "absolute", 
                top: 16, 
                right: 16, 
                color: "#5f6368",
                backgroundColor: '#f8f9fa',
                '&:hover': { backgroundColor: '#e8eaed' }
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <InfoIcon sx={{ color: selectedSolicitud?.isFestivo ? "#d35400" : "#1a73e8", fontSize: 50 }} />
            </Box>

            {selectedSolicitud && !selectedSolicitud.isFestivo && (
              <>
                <Typography variant="h5" gutterBottom textAlign="center" fontWeight="600" color="#202124">
                  📋 Detalles de la Solicitud
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2,
                      borderLeft: '4px solid #1a73e8'
                    }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Gestión
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {selectedSolicitud.correlativo || ("SLVC" + selectedSolicitud.idSolicitud)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2,
                      borderLeft: '4px solid #34A853'
                    }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Empleado
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {selectedSolicitud.nombreCompleto}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2
                    }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Fecha inicio vacaciones
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDateToDisplay(selectedSolicitud.fechaInicioVacaciones)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2
                    }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Fecha Fin vacaciones
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDateToDisplay(selectedSolicitud.fechaFinVacaciones)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2
                    }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Fecha retorno a labores
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDateToDisplay(selectedSolicitud.fechaRetornoLabores)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2
                    }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Cantidad de días solicitados
                      </Typography>
                      <Typography variant="h6" color="#1a73e8" fontWeight="600">
                        {selectedSolicitud.cantidadDiasSolicitados} días
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Estado de la solicitud:
                      </Typography>
                      <Chip
                        label={getEstado(selectedSolicitud.estadoSolicitud).label}
                        variant="filled"
                        sx={{
                          backgroundColor: getEstado(selectedSolicitud.estadoSolicitud).color,
                          color: getEstado(selectedSolicitud.estadoSolicitud).textColor || '#fff',
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          height: "32px",
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Alerta si las vacaciones inician hoy o están en curso */}
                  {isVacationActive(selectedSolicitud) && selectedSolicitud.estadoSolicitud === "autorizadas" && (
                    <Grid item xs={12}>
                      <Alert 
                        severity="warning" 
                        sx={{ 
                          mt: 2,
                          borderRadius: '8px',
                          backgroundColor: '#FFF3E0',
                          color: '#E65100',
                          '& .MuiAlert-icon': { color: '#FF9800' }
                        }}
                        icon={
                          <Box sx={{ 
                            backgroundColor: '#FF9800', 
                            color: 'white', 
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            ⚠️
                          </Box>
                        }
                      >
                        <Typography variant="body1" fontWeight="500">
                          {dayjs(selectedSolicitud.fechaInicioVacaciones).isSame(dayjs(), 'day')
                            ? "🎯 Las vacaciones de este empleado INICIAN HOY" 
                            : "🏖️ Este empleado se encuentra actualmente de vacaciones"}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>

                {(selectedSolicitud.estadoSolicitud === "rechazada" ||
                  selectedSolicitud.estadoSolicitud === "enviada") && (
                  <TextField
                    label="Descripción del Rechazo"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={
                      selectedSolicitud.estadoSolicitud === "rechazada"
                        ? selectedSolicitud.descripcionRechazo
                        : descripcionRechazo
                    }
                    onChange={(e) => setDescripcionRechazo(e.target.value)}
                    sx={{ mt: 2 }}
                    inputProps={{
                      readOnly: selectedSolicitud.estadoSolicitud !== "enviada",
                    }}
                  />
                )}

                {/* Modal Footer y Botones de Aprobación */}
                
                {(selectedSolicitud.estadoSolicitud === "autorizadas" || selectedSolicitud.estadoSolicitud === "enviada" || selectedSolicitud.estadoSolicitud === "finalizadas") && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleDownloadPDF(selectedSolicitud.idSolicitud, selectedSolicitud.idEmpleado)}
                      startIcon={<DescriptionIcon />}
                      sx={{
                        borderRadius: '24px',
                        textTransform: 'none',
                        fontWeight: '600',
                        px: 4,
                        py: 1.2,
                        backgroundColor: '#2e7d32',
                        '&:hover': { backgroundColor: '#1b5e20' }
                      }}
                    >
                      Descargar Informe Oficial
                    </Button>
                  </Box>
                )}

                {(selectedSolicitud.estadoSolicitud === "enviada" || selectedSolicitud.estadoSolicitud === "rechazada") && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      mt: 4,
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleAutorizar}
                      disabled={selectedSolicitud.estadoSolicitud !== "enviada" && selectedSolicitud.estadoSolicitud !== "rechazada"}
                      sx={{
                        backgroundColor: "#34A853",
                        '&:hover': { backgroundColor: "#2e8b47" },
                        borderRadius: '24px',
                        textTransform: 'none',
                        fontWeight: '500',
                        px: 4,
                        py: 1
                      }}
                      startIcon={<span>✅</span>}
                    >
                      Autorizar Solicitud
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleRechazar}
                      disabled={selectedSolicitud.estadoSolicitud !== "enviada"}
                      sx={{
                        backgroundColor: "#EA4335",
                        '&:hover': { backgroundColor: "#d33426" },
                        borderRadius: '24px',
                        textTransform: 'none',
                        fontWeight: '500',
                        px: 4,
                        py: 1
                      }}
                      startIcon={<span>❌</span>}
                    >
                      Rechazar Solicitud
                    </Button>
                  </Box>
                )}
              </>
            )}

            {selectedSolicitud && selectedSolicitud.isFestivo && (
              <Box textAlign="center" sx={{ mt: 1, mb: 3 }}>
                <Typography variant="h4" sx={{ color: "#d35400", fontWeight: "bold", mb: 2 }}>
                  {selectedSolicitud.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "#3c4043", fontSize: "1.2rem", lineHeight: 1.6, px: 2 }}>
                  ¡El <strong>CNA Sistema</strong> te desea un excelente y reparador descanso! 🎉
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleCloseModal} 
                  sx={{ 
                    mt: 4, 
                    backgroundColor: '#d35400', 
                    '&:hover': { backgroundColor: '#a04000' },
                    borderRadius: '24px',
                    px: 4,
                    py: 1,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  Entendido
                </Button>
              </Box>
            )}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default SolicitudesPage;