import React, { useState, useEffect } from "react";
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
  Snackbar,
  Slide,
  Alert,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ViewListIcon from "@mui/icons-material/ViewList";
import EventNoteIcon from "@mui/icons-material/EventNote";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { useSolicitudes } from "../../../hooks/VacationAppHooks/useSolicitudes";
import axios from "axios";
import { formatDateToDisplay } from "../../../services/utils/dates/vacationUtils";
import { API_URL } from "../../../config/enviroment";
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
  const { solicitudesU, cantadSolicitudes, errorU, loadingU } = useSolicitudes();
  const [successOpen, setSuccessOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Función para generar colores únicos por empleado
  const getEmployeeColor = (employeeName) => {
    const colors = [
      "#4285F4", "#34A853", "#FBBC05", "#EA4335", "#8E44AD",
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
        solicitud => solicitud.estadoSolicitud === "autorizadas" || 
                     solicitud.estadoSolicitud === "enviada"
      );
      
      const events = [];
      const today = dayjs().startOf('day');
      
      eventosFiltrados.forEach((solicitud) => {
        const fechaInicio = dayjs(solicitud.fechaInicioVacaciones).startOf('day');
        const fechaFin = dayjs(solicitud.fechaFinVacaciones).endOf('day'); // IMPORTANTE: .endOf('day') para incluir todo el día
        
        // Color por empleado
        const baseColor = getEmployeeColor(solicitud.nombreCompleto);
        
        // Estado específico para el tooltip
        const estado = solicitud.estadoSolicitud === "autorizadas" ? "Aprobada" : "Pendiente";
        
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
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "enviada":
        return "warning";
      case "autorizadas":
        return "success";
      case "rechazada":
        return "error";
      case "finalizadas":
        return "info";
      default:
        return "default";
    }
  };

  // Función para obtener el texto del estado
  const getEstadoText = (estado) => {
    switch (estado) {
      case "enviada":
        return "En espera de aprobación";
      case "autorizadas":
        return "Vacaciones autorizadas";
      case "rechazada":
        return "Vacaciones Rechazadas";
      case "finalizadas":
        return "Vacaciones Finalizadas";
      default:
        return estado;
    }
  };

  const handleVerSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalOpen(true);
    setDescripcionRechazo("");
    if (solicitud) setIsEstadoChanged(false);
  };

  const handleSelectEvent = (event) => {
    // No abrir modal para eventos de fin de semana
    if (event.isWeekend) return;
    
    setSelectedEvent(event);
    setSelectedSolicitud(event.solicitudData);
    setModalOpen(true);
  };

  const handleAutorizar = async () => {
    if (!selectedSolicitud) return;

    const payload = {
      estadoSolicitud: "autorizadas",
      idEmpleado: selectedSolicitud.idEmpleado,
      idSolicitud: selectedSolicitud.idSolicitud,
    };

    try {
      const response = await axios.put(
        `${API_URL}/UpdateEstadoSolicitud`,
        payload
      );
      setSuccessOpen(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

    const payload = {
      estadoSolicitud: "rechazada",
      idEmpleado: selectedSolicitud.idEmpleado,
      idSolicitud: selectedSolicitud.idSolicitud,
    };

    try {
      const response = await axios.put(
        `${API_URL}/UpdateEstadoSolicitud`,
        payload
      );
      setSuccessOpen(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

  const eventStyleGetter = (event) => {
    const isWeekendEvent = event.isWeekend;
    
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
        fontWeight: isWeekendEvent ? "400" : "500",
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={() => setMobileOpen(!mobileOpen)}
        sx={{ mr: 2, display: { md: "none" }, position: 'fixed', top: 16, left: 16, zIndex: 1300 }}
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

      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          ml: { md: "0px" },
          width: { md: `calc(100% - 240px)` }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "bold",
              color: "#202124"
            }}
          >
            SOLICITUDES DE VACACIONES
          </Typography>
          
          <Button
            variant="contained"
            startIcon={showCalendar ? <ViewListIcon /> : <CalendarTodayIcon />}
            onClick={() => setShowCalendar(!showCalendar)}
            sx={{
              backgroundColor: showCalendar ? '#5f6368' : '#1a73e8',
              '&:hover': {
                backgroundColor: showCalendar ? '#4a4d51' : '#0d5fc1',
              },
              borderRadius: '24px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
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
              <Card sx={{ flex: 1, boxShadow: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventNoteIcon sx={{ color: '#4285F4', fontSize: 30 }} />
                  <Box>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {solicitudesU?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Solicitudes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1, boxShadow: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventNoteIcon sx={{ color: '#FBBC05', fontSize: 30 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#FBBC05' }} fontWeight="bold">
                      {solicitudesPendientes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pendientes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ flex: 1, boxShadow: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EventNoteIcon sx={{ color: '#34A853', fontSize: 30 }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#34A853' }} fontWeight="bold">
                      {solicitudesAprobadas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                <Box sx={{ height: 650, position: 'relative' }}>
                  {calendarEvents.length === 0 ? (
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
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: "100%" }}
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

            <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3, borderRadius: '12px' }}>
              <Table aria-label="solicitudes table">
                <TableHead>
                  <TableRow>
                    {["ID", "Empleado", "Tipo Solicitud", "Estado", "Acción"].map(
                      (header) => (
                        <TableCell
                          key={header}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#1a73e8",
                            color: "#fff",
                            fontSize: '0.95rem',
                            padding: '16px'
                          }}
                        >
                          {header}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudesU && solicitudesU.length > 0 ? (
                    filteredSolicitudes.map((solicitud) => (
                      <TableRow 
                        key={solicitud.idSolicitud}
                        sx={{ 
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell align="center" sx={{ fontWeight: '500' }}>
                          {"SLVC" + solicitud.idSolicitud}
                        </TableCell>
                        <TableCell align="center">
                          {solicitud.nombreCompleto}
                        </TableCell>
                        <TableCell align="center">
                          Solicitud de vacaciones
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getEstadoText(solicitud.estadoSolicitud)}
                            color={getEstadoColor(solicitud.estadoSolicitud)}
                            variant="filled"
                            sx={{
                              fontWeight: "bold",
                              minWidth: "160px",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleVerSolicitud(solicitud)}
                            sx={{
                              backgroundColor: '#1a73e8',
                              '&:hover': { backgroundColor: '#0d5fc1' },
                              borderRadius: '20px',
                              textTransform: 'none',
                              fontWeight: '500'
                            }}
                          >
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 4 }}>
                          <EventNoteIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: "gray" }}>
                            No hay solicitudes disponibles.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Snackbar para mostrar el mensaje de éxito */}
        <Snackbar
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          TransitionComponent={Slide}
          sx={{
            "& .MuiSnackbarContent-root": {
              padding: "8px 16px",
              minWidth: "200px",
            },
          }}
        >
          <Alert
            onClose={() => setSuccessOpen(false)}
            severity="success"
            sx={{
              width: "100%",
              fontSize: "1.0rem",
              backgroundColor: "#34A853",
              color: "#ffffff",
              "& .MuiAlert-icon": {
                color: "#ffffff",
              },
              "& .MuiAlert-action": {
                color: "#ffffff",
              },
            }}
          >
            Solicitud procesada exitosamente
          </Alert>
        </Snackbar>

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
              <InfoIcon sx={{ color: "#1a73e8", fontSize: 50 }} />
            </Box>

            {selectedSolicitud && (
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
                        {"SLVC" + selectedSolicitud.idSolicitud}
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
                        label={getEstadoText(selectedSolicitud.estadoSolicitud)}
                        color={getEstadoColor(selectedSolicitud.estadoSolicitud)}
                        variant="filled"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '0.9rem',
                          height: '32px'
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

                {selectedSolicitud.estadoSolicitud === "enviada" && (
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
                      disabled={selectedSolicitud.estadoSolicitud !== "enviada"}
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
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default SolicitudesPage;