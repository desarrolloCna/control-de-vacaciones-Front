import React, { useState, useEffect } from "react";
import { Box,IconButton,Typography,Table,TableBody,TableCell,TableContainer,TableHead,TableRow, Paper,Button,Modal,TextField,MenuItem,Grid,Snackbar,Slide,Alert,Chip,Card,CardHeader,CardContent,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ViewListIcon from "@mui/icons-material/ViewList";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { useSolicitudes } from "../../../hooks/VacationAppHooks/useSolicitudes";
import axios from "axios";
import { formatDateToDisplay } from "../../../services/utils/dates/vacationUtils";
import { API_URL } from "../../../config/enviroment";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Solicitudes.styles.css";

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
  // Validar sesion y permisos
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

  // Función para verificar si una fecha está entre dos fechas (sin dayjs plugin)
  const isDateBetween = (date, start, end) => {
    const checkDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return checkDate >= startDate && checkDate <= endDate;
  };

  // Función para verificar si es el mismo día
  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Transformar solicitudes a eventos del calendario
  useEffect(() => {
    if (solicitudesU && solicitudesU.length > 0) {
      const events = solicitudesU.map((solicitud) => {
        const fechaInicio = new Date(solicitud.fechaInicioVacaciones);
        const fechaFin = new Date(solicitud.fechaFinVacaciones);
        const today = new Date();
        
        // Determinar color según estado y fechas
        let color = "#6c757d"; // Default gray
        
        if (solicitud.estadoSolicitud === "autorizadas") {
          color = "#28a745"; // Green for approved
        } else if (solicitud.estadoSolicitud === "rechazada") {
          color = "#dc3545"; // Red for rejected
        } else if (solicitud.estadoSolicitud === "enviada") {
          color = "#ffc107"; // Yellow for pending
        } else if (solicitud.estadoSolicitud === "finalizadas") {
          color = "#17a2b8"; // Blue for finished
        }

        // Check if vacation starts today or is ongoing
        const isStartingToday = isSameDay(today, fechaInicio);
        const isOngoing = isDateBetween(today, fechaInicio, fechaFin);
        
        if (isStartingToday || isOngoing) {
          color = "#fd7e14"; // Orange for active/starting today
        }

        return {
          id: solicitud.idSolicitud,
          title: `${solicitud.nombreCompleto} - ${solicitud.cantidadDiasSolicitados}d`,
          start: fechaInicio,
          end: fechaFin,
          estado: solicitud.estadoSolicitud,
          empleado: solicitud.nombreCompleto,
          dias: solicitud.cantidadDiasSolicitados,
          fechaRetorno: solicitud.fechaRetornoLabores,
          color: color,
          solicitudData: solicitud,
        };
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

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: "4px",
      opacity: 0.9,
      color: "white",
      border: "0px",
      display: "block",
      fontSize: "12px",
      padding: "2px 4px",
    },
  });

  // Función auxiliar para verificar si las vacaciones están activas
  const isVacationActive = (solicitud) => {
    if (!solicitud) return false;
    
    const fechaInicio = new Date(solicitud.fechaInicioVacaciones);
    const fechaFin = new Date(solicitud.fechaFinVacaciones);
    const today = new Date();
    
    const isStartingToday = isSameDay(today, fechaInicio);
    const isOngoing = isDateBetween(today, fechaInicio, fechaFin);
    
    return isStartingToday || isOngoing;
  };

  if (!isSessionVerified || loadingU) {
    return <Spinner />;
  }

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
            }}
          >
            SOLICITUDES DE VACACIONES
          </Typography>
          
          <Button
            variant="contained"
            startIcon={showCalendar ? <ViewListIcon /> : <CalendarTodayIcon />}
            onClick={() => setShowCalendar(!showCalendar)}
            sx={{
              backgroundColor: showCalendar ? '#6c757d' : '#0d6efd',
              '&:hover': {
                backgroundColor: showCalendar ? '#5a6268' : '#0b5ed7',
              },
            }}
          >
            {showCalendar ? "Ver Lista" : "Ver Calendario"}
          </Button>
        </Box>

        {showCalendar ? (
          // VISTA CALENDARIO
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardHeader 
              title="Calendario de Vacaciones" 
              subheader={`Total de solicitudes: ${solicitudesU?.length || 0}`}
            />
            <CardContent>
              <Box sx={{ height: 600 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  messages={calendarMessages}
                  defaultView="month"
                  views={["month", "week", "day"]}
                  culture="es"
                />
              </Box>
            </CardContent>
          </Card>
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
                    "& fieldset": { borderColor: "green" },
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

            <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
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
                            backgroundColor: "#424242",
                            color: "#fff",
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
                      <TableRow key={solicitud.idSolicitud}>
                        <TableCell align="center">
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
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="h6" sx={{ color: "gray" }}>
                          No hay solicitudes disponibles.
                        </Typography>
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
              backgroundColor: "#28a745",
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
              top: "2%",
              left: "55%",
              transform: "translate(-50%, 0)",
              width: "80vw",
              maxWidth: "700px",
              bgcolor: "white",
              borderRadius: 2,
              p: 4,
              boxShadow: 24,
              overflow: "hidden",
              outline: "none",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{ position: "absolute", top: 16, right: 16, color: "red" }}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <InfoIcon sx={{ color: "primary.main", fontSize: 50 }} />
            </Box>

            {selectedSolicitud && (
              <>
                <Typography variant="h6" gutterBottom textAlign="center">
                  Detalles de la Solicitud
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">
                      Gestión:
                    </Typography>
                    {"SLVC" + selectedSolicitud.idSolicitud}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">
                      Empleado:
                    </Typography>
                    {selectedSolicitud.nombreCompleto}
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">
                      Fecha inicio vacaciones:
                    </Typography>
                    {formatDateToDisplay(
                      selectedSolicitud.fechaInicioVacaciones
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">
                      Fecha Fin vacaciones:
                    </Typography>
                    {formatDateToDisplay(selectedSolicitud.fechaFinVacaciones)}
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">
                      Fecha retorno a labores:
                    </Typography>
                    {formatDateToDisplay(selectedSolicitud.fechaRetornoLabores)}
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">
                      Cantidad de días solicitados:
                    </Typography>
                    {selectedSolicitud.cantidadDiasSolicitados}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" fontWeight="bold">
                      Estado de la solicitud:
                    </Typography>
                    <Chip
                      label={getEstadoText(selectedSolicitud.estadoSolicitud)}
                      color={getEstadoColor(selectedSolicitud.estadoSolicitud)}
                      variant="filled"
                      sx={{
                        fontWeight: "bold",
                        mt: 1,
                      }}
                    />
                  </Grid>

                  {/* Alerta si las vacaciones inician hoy o están en curso */}
                  {isVacationActive(selectedSolicitud) && selectedSolicitud.estadoSolicitud === "autorizadas" && (
                    <Grid item xs={12}>
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        {isSameDay(new Date(), new Date(selectedSolicitud.fechaInicioVacaciones)) 
                          ? "⚠️ Las vacaciones de este empleado INICIAN HOY" 
                          : "⚠️ Este empleado se encuentra actualmente de vacaciones"}
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
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleAutorizar}
                      disabled={selectedSolicitud.estadoSolicitud !== "enviada"}
                      sx={{
                        backgroundColor: "#28a745",
                        "&:hover": { backgroundColor: "#218838" },
                        mt: 3,
                        mx: 1,
                      }}
                    >
                      Autorizar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleRechazar}
                      disabled={selectedSolicitud.estadoSolicitud !== "enviada"}
                      sx={{
                        backgroundColor: "#dc3545",
                        "&:hover": { backgroundColor: "#c82333" },
                        mt: 3,
                        mx: 1,
                      }}
                    >
                      Rechazar
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