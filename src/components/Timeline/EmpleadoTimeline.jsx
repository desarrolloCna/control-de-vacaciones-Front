import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Chip } from "@mui/material";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent, timelineOppositeContentClasses } from "@mui/lab";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import api from "../../config/api";

export default function EmpleadoTimeline({ idEmpleado }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!idEmpleado) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/reportes/timeline/${idEmpleado}`);
        setEventos(res.data.data || []);
      } catch (err) {
        console.error("Error cargando timeline:", err);
        setError("No se pudo cargar el historial cronológico.");
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [idEmpleado]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (eventos.length === 0) return <Alert severity="info">No hay historial de eventos registrado para este empleado.</Alert>;

  const getEventStyles = (tipo, estado) => {
    if (tipo === 'ACREDITACION') {
      return { 
        color: '#2e7d32', 
        bgcolor: '#e8f5e9', 
        icon: <AddCircleOutlineIcon />, 
        title: 'Días Acreditados',
        descColor: '#1b5e20'
      };
    }
    
    // Es una SOLICITUD
    const est = (estado || '').toLowerCase();
    switch (est) {
      case 'autorizadas':
      case 'finalizadas':
        return { 
            color: '#1976d2', 
            bgcolor: '#e3f2fd', 
            icon: <FlightTakeoffIcon />, 
            title: 'Vacaciones Tomadas',
            descColor: '#0d47a1'
        };
      case 'rechazadas':
      case 'cancelada':
        return { 
            color: '#d32f2f', 
            bgcolor: '#ffebee', 
            icon: <CancelIcon />, 
            title: `Solicitud ${est === 'rechazadas' ? 'Rechazada' : 'Cancelada'}`,
            descColor: '#b71c1c'
        };
      case 'reprogramacion':
      case 'enviada':
      default:
        return { 
            color: '#ed6c02', 
            bgcolor: '#fff3e0', 
            icon: <PendingActionsIcon />, 
            title: `Solicitud Pendiente (${estado})`,
            descColor: '#e65100'
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      // Ajuste de Timezone local para evitar cambio de fecha en parseo directo (fechas tipo YYYY-MM-DD sin TZ)
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', bgcolor: '#fafafa' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 3 }}>
          Historial Cronológico de Vacaciones
        </Typography>

        <Timeline
            sx={{
                [`& .${timelineOppositeContentClasses.root}`]: {
                    flex: 0.2, // Ajusta el ancho de la columna de fechas
                },
                m: 0, p: 0
            }}
        >
          {eventos.map((ev, index) => {
            const isLast = index === eventos.length - 1;
            const style = getEventStyles(ev.tipoEvento, ev.estado);
            const isAcreditacion = ev.tipoEvento === 'ACREDITACION';

            return (
              <TimelineItem key={`${ev.tipoEvento}-${ev.idRelacionado}-${index}`}>
                <TimelineOppositeContent sx={{ m: 'auto 0', color: 'text.secondary', fontWeight: 600 }}>
                  <Typography variant="body2">{formatDate(ev.fechaEvento)}</Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineConnector sx={{ bgcolor: index === 0 ? 'transparent' : 'grey.300' }} />
                  <TimelineDot sx={{ bgcolor: style.color, color: '#fff', p: 1, boxShadow: 2 }}>
                    {style.icon}
                  </TimelineDot>
                  <TimelineConnector sx={{ bgcolor: isLast ? 'transparent' : 'grey.300' }} />
                </TimelineSeparator>

                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Box 
                    sx={{ 
                        bgcolor: '#fff', 
                        p: 2, 
                        borderRadius: 3, 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        borderLeft: `4px solid ${style.color}`,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateX(4px)' }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: style.descColor }}>
                        {style.title}
                        </Typography>
                        {ev.correlativo && (
                            <Chip label={ev.correlativo} size="small" sx={{ bgcolor: '#f0f0f0', fontWeight: 600, fontSize: '0.7rem' }} />
                        )}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {isAcreditacion 
                        ? `Se sumaron +${ev.cantidadDias} días a la cuenta (Periodo ${ev.periodo || 'N/A'}).`
                        : `Se procesó una solicitud por ${ev.cantidadDias} días hábiles (del ${formatDate(ev.fechaExtra1)} al ${formatDate(ev.fechaExtra2)}).`}
                    </Typography>
                  </Box>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </CardContent>
    </Card>
  );
}
