import React, { useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, IconButton, useTheme, Chip, Modal, Grid } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";

dayjs.extend(isSameOrBefore);
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import { useCalendarioGlobal } from "../../../hooks/VacationAppHooks/useCalendarioGlobal";
import { getDiasFestivos } from "../../../services/EmpleadosServices/DiasFestivos/GetDiasFestivos";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { MenuItem, Select, FormControl, InputLabel, Button } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { exportToExcel } from "../../../services/utils/exportToExcelUtils";
import { PageHeader } from "../../../components/UI/UIComponents";
import { formatDateToDisplay } from "../../../services/utils/dates/vacationUtils";
import api from "../../../config/api";

const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Selector de color por departamento
const getColorByUnidad = (unidad) => {
  const hash = Array.from(unidad || "general").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ["#1976d2", "#2e7d32", "#d32f2f", "#ed6c02", "#9c27b0", "#0288d1", "#c2185b"];
  return colors[hash % colors.length];
};

const CalendarioGlobalPage = () => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { eventos, loading, error, fetchCalendario } = useCalendarioGlobal();
  const [festivos, setFestivos] = useState([]);
  
  // Variables exclusivas de Altas Autoridades
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("Todas");
  const userData = getLocalStorageData();
  
  // Solo Director General y Subdirector General tienen acceso completo al calendario
  const isDirectorOrAdmin = 
    userData?.puesto && 
    (userData.puesto.includes("Director General") || userData.puesto.includes("Subdirector General"));

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  React.useEffect(() => {
    getDiasFestivos().then(data => {
      const mapped = (data || []).filter(f => f.estado === 'A').map(f => {
        // Para eventos de 1 día exacto en big-calendar, End debe ser Date + 1 día con 'setHours(0,0,0,0)'
        const startD = new Date(f.fechaDiaFestivo + 'T00:00:00');
        const endD = new Date(startD);
        endD.setDate(endD.getDate() + 1);

        return {
          title: `🏛️ ${f.nombreDiaFestivo}${f.medioDia ? ' (Medio Día)' : ''}`,
          start: startD,
          end: endD,
          isHoliday: true,
          allDay: true,
        };
      });
      setFestivos(mapped);
    }).catch(console.error);

    if (isDirectorOrAdmin) {
      api.get('/unidades').then(response => {
        const data = response.data.departamentos.filter((unidad) => unidad.estado === "A");
        setUnidades(data);
      }).catch(console.error);
    }
  }, [isDirectorOrAdmin]);

  const handleUnidadChange = (e) => {
    const newVal = e.target.value;
    setSelectedUnidad(newVal);
    fetchCalendario(newVal);
  };

  const handleExportExcel = () => {
    const dataToExport = eventos.map(ev => ({
      "Empleado": ev.nombreCompleto,
      "Puesto": ev.puesto || "N/A",
      "Renglón": ev.renglon || "N/A",
      "Unidad": ev.unidadSolicitud || "Sin unidad",
      "Estado": ev.estadoSolicitud === "enviada" ? "Pendiente" : "Autorizada",
      "Fecha Inicio": formatDateToDisplay(ev.fechaInicioVacaciones),
      "Fecha Fin": formatDateToDisplay(ev.fechaFinVacaciones),
      "Fecha Retorno": formatDateToDisplay(ev.fechaRetornoLabores),
    }));
    exportToExcel(dataToExport, `Reporte_Calendario_${selectedUnidad}`);
  };

  // Mapeo a formato de Calendar omitiendo multislides y recortando fines de semana
  const calendarEvents = [];
  
  eventos.forEach((ev) => {
    let currentDate = dayjs(ev.fechaInicioVacaciones).startOf('day');
    const endDate = dayjs(ev.fechaFinVacaciones).startOf('day');
    
    let currentEventStart = null;
    let currentEventEnd = null;
    
    const pushBlock = (start, end) => {
      const endD = end.add(1, 'day').toDate();
      calendarEvents.push({
        title: `${ev.estadoSolicitud === 'enviada' ? '⏳ PENDIENTE - ' : ''}${ev.nombreCompleto}`,
        start: start.toDate(),
        end: endD,
        unidad: ev.unidadSolicitud || "Sin unidad",
        estadoSolicitud: ev.estadoSolicitud,
        empleado: ev.nombreCompleto,
        fechaInicio: ev.fechaInicioVacaciones,
        fechaFin: ev.fechaFinVacaciones,
        fechaRetorno: ev.fechaRetornoLabores,
        idSolicitud: ev.idSolicitud,
        allDay: true,
      });
    };
    
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      const dayOfWeek = currentDate.day();
      
      // Si es fin de semana (0=Dom, 6=Sab) cerramos bloque temporal
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (currentEventStart !== null) {
          pushBlock(currentEventStart, currentEventEnd);
          currentEventStart = null;
          currentEventEnd = null;
        }
      } else {
        if (currentEventStart === null) {
          currentEventStart = currentDate;
        }
        currentEventEnd = currentDate;
      }
      currentDate = currentDate.add(1, 'day');
    }
    
    if (currentEventStart !== null) {
      pushBlock(currentEventStart, currentEventEnd);
    }
  });

  const allEvents = [...calendarEvents, ...festivos];

  const eventStyleGetter = (event) => {
    if (event.isHoliday) {
      return {
        style: {
          backgroundColor: "#e65100", // Naranja oscuro llamativo para días festivos
          fontWeight: "bold",
          borderRadius: "4px",
          opacity: 1,
          color: "white",
          border: "1px solid #bf360c",
          display: "block",
          fontSize: "0.85rem",
          padding: "2px 5px",
        },
      };
    }

    const isWeekendEvent = event.isWeekend; // lógica de omitir findes opcional
    const backgroundColor = event.estadoSolicitud === 'enviada' ? '#757575' : getColorByUnidad(event.unidad);
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: event.estadoSolicitud === 'enviada' ? 0.75 : 0.9,
        color: "white",
        border: event.estadoSolicitud === 'enviada' ? "1px dashed #ffffff" : "none",
        display: "block",
        fontSize: "0.85rem",
        padding: "2px 5px",
      },
    };
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={() => setMobileOpen(!mobileOpen)}
        sx={{ mr: 2, display: { md: "none" }, position: 'absolute', top: 10, left: 10, zIndex: 1300 }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{
          width: { xs: mobileOpen ? "240px" : 0, md: "240px" },
          flexShrink: { md: 0 },
          transition: "width 0.3s",
          position: { xs: "absolute", md: "relative" },
          height: "100vh",
          zIndex: 1200,
        }}
      >
        <Sidebar mobileOpen={mobileOpen} />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - 240px)` } }}>
        <PageHeader 
          title="Calendario Institucional" 
          subtitle="Visualiza las vacaciones programadas y aprobadas de todo el personal operativo."
          showBack={true}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>

          {isDirectorOrAdmin && (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="filtro-unidad-label">Filtrar por Unidad</InputLabel>
                <Select
                  labelId="filtro-unidad-label"
                  value={selectedUnidad}
                  label="Filtrar por Unidad"
                  onChange={handleUnidadChange}
                  sx={{ bgcolor: "background.paper" }}
                >
                  <MenuItem value="Todas">Todas las Unidades</MenuItem>
                  {unidades.map(u => (
                    <MenuItem key={u.idUnidad} value={u.nombreUnidad}>{u.nombreUnidad}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="success"
                startIcon={<GetAppIcon />}
                onClick={handleExportExcel}
                sx={{ whiteSpace: "nowrap" }}
              >
                Exportar Excel
              </Button>
            </Box>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            height: { xs: "850px", md: "calc(100vh - 140px)" }, // Más alto en modo desktop
            minHeight: "850px", // Evita que las cuadrículas se apachurren en laptops chicas
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            "& .rbc-calendar": { fontFamily: "Roboto, sans-serif" },
            "& .rbc-toolbar": { color: theme.palette.text.primary, mb: 2 },
            "& .rbc-toolbar button": { color: theme.palette.text.primary },
            "& .rbc-month-view": { borderColor: theme.palette.divider },
            "& .rbc-day-bg": { borderColor: theme.palette.divider },
            "& .rbc-header": { borderColor: theme.palette.divider, py: 1 },
            "& .rbc-off-range-bg": { backgroundColor: theme.palette.action.hover },
            "& .rbc-today": { backgroundColor: theme.palette.action.selected },
            "& .rbc-date-cell": { color: theme.palette.text.secondary },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Calendar
              localizer={localizer}
              events={allEvents}
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
              culture="es"
              messages={{
                next: ">",
                previous: "<",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
              }}
              eventPropGetter={eventStyleGetter}
              popup
            />
          )}
        </Paper>

        {/* Modal de detalles */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90vw",
              maxWidth: "600px",
              bgcolor: "white",
              borderRadius: "16px",
              p: 4,
              boxShadow: 24,
              outline: "none",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{ position: "absolute", top: 16, right: 16, color: "#5f6368" }}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <InfoIcon sx={{ color: selectedEvent?.isHoliday ? "#d35400" : "#1a73e8", fontSize: 50 }} />
            </Box>

            {selectedEvent && !selectedEvent.isHoliday && (
              <>
                <Typography variant="h6" gutterBottom textAlign="center" fontWeight="600" color="#202124">
                  Detalles de la Solicitud SLVC-{selectedEvent.idSolicitud}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                  <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#f8f9fa', borderRadius: '8px', p: 2, borderLeft: '4px solid #34A853' }}>
                      <Typography variant="body2" color="text.secondary">Empleado:</Typography>
                      <Typography variant="h6" fontWeight="600">{selectedEvent.empleado}</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ backgroundColor: '#f8f9fa', borderRadius: '8px', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Fecha de Inicio:</Typography>
                      <Typography variant="body1" fontWeight="500">{formatDateToDisplay(selectedEvent.fechaInicio)}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ backgroundColor: '#f8f9fa', borderRadius: '8px', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Fecha Fin:</Typography>
                      <Typography variant="body1" fontWeight="500">{formatDateToDisplay(selectedEvent.fechaFin)}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ backgroundColor: '#f8f9fa', borderRadius: '8px', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Día de Retorno:</Typography>
                      <Typography variant="body1" fontWeight="500">{formatDateToDisplay(selectedEvent.fechaRetorno)}</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ backgroundColor: '#f8f9fa', borderRadius: '8px', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">Unidad/Sede:</Typography>
                      <Typography variant="body1" fontWeight="500">{selectedEvent.unidad}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button fullWidth variant="outlined" color="primary" onClick={handleCloseModal}>
                  Cerrar
                </Button>
              </>
            )}

            {selectedEvent && selectedEvent.isHoliday && (
              <Box textAlign="center" sx={{ mt: 1, mb: 3 }}>
                <Typography variant="h4" sx={{ color: "#d35400", fontWeight: "bold", mb: 2 }}>
                  {selectedEvent.title.replace('🏛️ ', '')}
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

export default CalendarioGlobalPage;
