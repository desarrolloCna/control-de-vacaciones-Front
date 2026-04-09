import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Avatar, Chip, Fade } from "@mui/material";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import CakeIcon from "@mui/icons-material/Cake";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import api from "../../config/api";

export default function KioscoPage() {
    const [datos, setDatos] = useState({
        vacacionesActivas: [],
        proximosRetornos: [],
        cumpleanosMes: []
    });
    const [hora, setHora] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/kiosco/datos');
            if (res.data && res.data.data) {
                setDatos(res.data.data);
            }
        } catch (error) {
            console.error("Error al cargar datos del kiosco:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Carga inicial
        fetchData();

        // Reloj en tiempo real
        const timerReloj = setInterval(() => {
            setHora(new Date());
        }, 1000);

        // Auto-refresh de datos cada 5 minutos
        const timerData = setInterval(() => {
            fetchData();
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(timerReloj);
            clearInterval(timerData);
        };
    }, []);

    const formatoFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const d = new Date(fechaStr);
        // Evita el timezone shift usando utc si la BD viene en YYYY-MM-DD
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d.toLocaleDateString("es-GT", { day: '2-digit', month: 'short' });
    };

    const darkBg = "#0b0f19";
    const cardBg = "#151b2b";
    
    return (
        <Box sx={{ bgcolor: darkBg, minHeight: "100vh", w: "100vw", color: "white", p: 4, boxSizing: "border-box", overflow: "hidden" }}>
            
            {/* Cabecera */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, borderBottom: '1px solid #1e293b', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box 
                        component="img" 
                        src="/logocna.png" 
                        alt="CNA Logo" 
                        sx={{ height: 60, filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.2))' }}
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#e2e8f0', letterSpacing: '-0.5px' }}>
                            Consejo Nacional de Adopciones
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                            Panel Informativo Institucional
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                        {hora.toLocaleTimeString("es-GT", { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#94a3b8', textTransform: 'capitalize' }}>
                        {hora.toLocaleDateString("es-GT", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={4} sx={{ height: 'calc(100vh - 150px)' }}>
                {/* Columna 1: Vacaciones Activas Hoy */}
                <Grid item xs={4}>
                    <Card sx={{ height: '100%', bgcolor: cardBg, borderRadius: 4, border: '1px solid #1e293b' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, color: '#fbbf24' }}>
                                <BeachAccessIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>De Vacaciones</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                                {datos.vacacionesActivas.map((emp, i) => (
                                    <Fade in timeout={500 + (i * 100)} key={emp.idSolicitud}>
                                        <Box sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 3, display: 'flex', alignItems: 'center', borderLeft: '4px solid #fbbf24' }}>
                                            <Avatar sx={{ bgcolor: '#d97706', mr: 2, width: 48, height: 48, fontWeight: 700 }}>
                                                {emp.nombreCompleto.charAt(0)}
                                            </Avatar>
                                            <Box flexGrow={1}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                                                    {emp.nombreCompleto}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>{emp.unidad || "—"}</Typography>
                                            </Box>
                                        </Box>
                                    </Fade>
                                ))}
                                {!loading && datos.vacacionesActivas.length === 0 && (
                                    <Typography variant="h6" sx={{ color: '#64748b', textAlign: 'center', mt: 4, fontStyle: 'italic' }}>
                                        Nadie de vacaciones hoy
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Columna 2: Regresan pronto */}
                <Grid item xs={4}>
                    <Card sx={{ height: '100%', bgcolor: cardBg, borderRadius: 4, border: '1px solid #1e293b' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, color: '#10b981' }}>
                                <FlightLandIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>Regresan Pronto</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {datos.proximosRetornos.map((emp, i) => (
                                    <Fade in timeout={500 + ((i+5) * 100)} key={i}>
                                        <Box sx={{ p: 2, bgcolor: '#1e293b', borderRadius: 3, display: 'flex', alignItems: 'center', borderLeft: '4px solid #10b981' }}>
                                            <Box flexGrow={1}>
                                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                                                    {emp.nombreCompleto}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>{emp.unidad || "—"}</Typography>
                                            </Box>
                                            <Chip 
                                                icon={<AccessTimeIcon fontSize="small"/>}
                                                label={`Vuelve el ${formatoFecha(emp.fechaRetornoLabores)}`}
                                                sx={{ bgcolor: '#064e3b', color: '#34d399', fontWeight: 700, borderRadius: 2 }}
                                            />
                                        </Box>
                                    </Fade>
                                ))}
                                {!loading && datos.proximosRetornos.length === 0 && (
                                    <Typography variant="h6" sx={{ color: '#64748b', textAlign: 'center', mt: 4, fontStyle: 'italic' }}>
                                        No hay retornos en los próximos 5 días
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Columna 3: Cumpleaños */}
                <Grid item xs={4}>
                    <Card sx={{ height: '100%', bgcolor: cardBg, borderRadius: 4, border: '1px solid #1e293b' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, color: '#ec4899' }}>
                                <CakeIcon sx={{ fontSize: 40, mr: 2 }} />
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>Cumpleaños del Mes</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                                {datos.cumpleanosMes.map((emp, i) => {
                                    const hoy = new Date();
                                    const fechaNac = new Date(emp.fechaNacimiento);
                                    fechaNac.setMinutes(fechaNac.getMinutes() + fechaNac.getTimezoneOffset());
                                    const esHoy = fechaNac.getDate() === hoy.getDate();
                                    
                                    return (
                                        <Fade in timeout={500 + ((i+10) * 100)} key={i}>
                                            <Box sx={{ p: 2, bgcolor: esHoy ? '#500724' : '#1e293b', borderRadius: 3, display: 'flex', alignItems: 'center', borderLeft: `4px solid ${esHoy ? '#f472b6' : '#ec4899'}` }}>
                                                <Avatar sx={{ bgcolor: esHoy ? '#ec4899' : '#831843', mr: 2, width: 48, height: 48, fontWeight: 700 }}>
                                                    {emp.nombreCompleto.charAt(0)}
                                                </Avatar>
                                                <Box flexGrow={1}>
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                                                        {emp.nombreCompleto} {esHoy && "🎉"}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                        {emp.unidad || "—"}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 800, color: esHoy ? '#f472b6' : '#fbcfe8', ml: 2 }}>
                                                    {fechaNac.getDate()}
                                                </Typography>
                                            </Box>
                                        </Fade>
                                    );
                                })}
                                {!loading && datos.cumpleanosMes.length === 0 && (
                                    <Typography variant="h6" sx={{ color: '#64748b', textAlign: 'center', mt: 4, fontStyle: 'italic' }}>
                                        Sin cumpleaños este mes
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
