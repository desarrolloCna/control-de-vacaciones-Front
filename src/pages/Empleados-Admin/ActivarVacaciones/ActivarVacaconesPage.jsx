import React, { useState, useMemo, useEffect } from "react";
import { 
    Box, Container, Alert, AlertTitle, Card, CardContent, Grid, TextField, 
    IconButton, Typography, Button, List, ListItem, ListItemAvatar, Avatar,
    ListItemText, ListItemSecondaryAction, Switch, Divider, CircularProgress
} from "@mui/material";
import dayjs from "dayjs";
import Navbar from "../../../components/navBar/NavBar";
import Spinner from "../../../components/spinners/spinner";
import { useGetEmpleadosUltimoAnio } from "../../../hooks/empleadosultimoanio/useGetEmpleadosUltimoAnio";
import { useCheckSession } from "../../../services/session/checkSession";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import { registrarVacacionesEspeciales } from "../../../services/vacacionesespeciales/Vacacionesesepeciales.service";
import { PageHeader } from "../../../components/UI/UIComponents";

const ActivarVacacionesPage = () => {
    const isSessionVerified = useCheckSession();
    const userData = getLocalStorageData();
    const { empleadosU, loadingEmpleados, showErrorEmpleados, showInfoEmpleados, setEmpleadosU } = useGetEmpleadosUltimoAnio();
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState(new Set());
    const [descripciones, setDescripciones] = useState({});
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    console.log(empleadosU)

    // Effect para limpiar mensajes de éxito automáticamente después de 5 segundos
    useEffect(() => {
        if (mensaje.tipo === 'success' && mensaje.texto) {
            const timer = setTimeout(() => {
                setMensaje({ tipo: '', texto: '' });
            }, 5000); // 5 segundos

            // Cleanup function para limpiar el timer si el componente se desmonta
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    // Filtrar empleados basado en la búsqueda
    const empleadosFiltrados = useMemo(() => {
        if (!terminoBusqueda.trim()) {
            return empleadosU;
        }
        
        const terminoLower = terminoBusqueda.toLowerCase().trim();
        return empleadosU?.filter(empleado => 
            empleado.Nombre.toLowerCase().includes(terminoLower)
        );
    }, [empleadosU, terminoBusqueda]);

    // Función para manejar la selección de empleados
    const toggleEmpleadoSeleccionado = (idEmpleado) => {
        const nuevosSeleccionados = new Set(empleadosSeleccionados);
        if (nuevosSeleccionados.has(idEmpleado)) {
            nuevosSeleccionados.delete(idEmpleado);
            // Limpiar descripción cuando se deselecciona
            const nuevasDescripciones = { ...descripciones };
            delete nuevasDescripciones[idEmpleado];
            setDescripciones(nuevasDescripciones);
        } else {
            nuevosSeleccionados.add(idEmpleado);
        }
        setEmpleadosSeleccionados(nuevosSeleccionados);
    };

    // Función para actualizar la descripción de un empleado
    const actualizarDescripcion = (idEmpleado, descripcion) => {
        setDescripciones(prev => ({
            ...prev,
            [idEmpleado]: descripcion
        }));
    };

    // Función para seleccionar/deseleccionar todos los empleados filtrados
    const toggleTodosLosEmpleados = () => {
        const empleadosVisiblesIds = empleadosFiltrados.map(emp => emp.idEmpleado);
        const todosSeleccionados = empleadosVisiblesIds.every(id => 
            empleadosSeleccionados.has(id)
        );

        if (todosSeleccionados) {
            // Deseleccionar todos los visibles
            const nuevosSeleccionados = new Set(empleadosSeleccionados);
            empleadosVisiblesIds.forEach(id => nuevosSeleccionados.delete(id));
            setEmpleadosSeleccionados(nuevosSeleccionados);
            
            // Limpiar descripciones de los empleados deseleccionados
            const nuevasDescripciones = { ...descripciones };
            empleadosVisiblesIds.forEach(id => {
                delete nuevasDescripciones[id];
            });
            setDescripciones(nuevasDescripciones);
        } else {
            // Seleccionar todos los visibles
            const nuevosSeleccionados = new Set(empleadosSeleccionados);
            empleadosVisiblesIds.forEach(id => nuevosSeleccionados.add(id));
            setEmpleadosSeleccionados(nuevosSeleccionados);
        }
    };

    // Función para generar el payload usando day.js
    const generarPayload = (empleado) => {
        const hoy = dayjs();
        const manana = hoy.add(1, 'day');

        return {
            idEmpleado: empleado.idEmpleado,
            idInfoPersonal: empleado.idInfoPersonal,
            idUsuario: userData?.idUsuario || 1,
            flagAutorizacion: 1,
            fechaInicioValidez: hoy.format('YYYY-MM-DD'),
            fechaFinValidez: manana.format('YYYY-MM-DD'),
            fechaIngresoGestion: hoy.format('YYYY-MM-DD HH:mm:ss'),
            descripcion: descripciones[empleado.idEmpleado] || '' // Agregar descripción al payload
        };
    };

    // Función para procesar la activación
    const procesarActivacion = async () => {
        if (empleadosSeleccionados.size === 0) {
            setMensaje({ tipo: 'error', texto: 'Por favor selecciona al menos un empleado' });
            return;
        }

        // Validar que todos los empleados seleccionados tengan descripción
        const empleadosSinDescripcion = Array.from(empleadosSeleccionados).filter(id => 
            !descripciones[id] || descripciones[id].trim() === ''
        );

        if (empleadosSinDescripcion.length > 0) {
            setMensaje({ 
                tipo: 'error', 
                texto: `Por favor ingresa una Motivo para todos los empleados seleccionados` 
            });
            return;
        }

        setProcesando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const empleadosProcesar = empleadosU.filter(emp => 
                empleadosSeleccionados.has(emp.idEmpleado)
            );

            const resultados = [];
            const errores = [];

            // Procesar cada empleado individualmente
            for (const empleado of empleadosProcesar) {
                try {
                    const payload = generarPayload(empleado);
                    
                    // Llamar al servicio real
                    const respuesta = await registrarVacacionesEspeciales(payload);
                    console.log('Respuesta del servidor para', empleado.Nombre, ':', respuesta);
                    
                    resultados.push({
                        empleado: empleado.Nombre,
                        success: true,
                        data: respuesta
                    });
                    
                } catch (error) {
                    console.error(`Error al procesar ${empleado.Nombre}:`, error);
                    errores.push({
                        empleado: empleado.Nombre,
                        error: error.response?.data?.message || error.message || 'Error desconocido'
                    });
                }
            }

            // Mostrar resultados
            if (errores.length === 0) {
                // Todos exitosos
                setMensaje({ 
                    tipo: 'success', 
                    texto: `✅ Se activaron las vacaciones para ${resultados.length} empleado(s) correctamente` 
                });
            } else if (resultados.length === 0) {
                // Todos fallaron
                setMensaje({ 
                    tipo: 'error', 
                    texto: `❌ Error al activar las vacaciones para todos los empleados seleccionados` 
                });
            } else {
                // Mixto
                setMensaje({ 
                    tipo: 'warning', 
                    texto: `⚠️ Se procesaron ${resultados.length} empleados exitosamente, pero ${errores.length} fallaron` 
                });
            }

            // Limpiar selecciones y descripciones solo si todos fueron exitosos
            if (errores.length === 0) {
                setEmpleadosSeleccionados(new Set());
                setDescripciones({});
            }
            
        } catch (error) {
            console.error('Error general en procesarActivacion:', error);
            setMensaje({ 
                tipo: 'error', 
                texto: '❌ Error inesperado al activar las vacaciones. Intenta nuevamente.' 
            });
        } finally {
            setProcesando(false);
        }
    };

    // Calcular contadores para empleados filtrados
    const empleadosSeleccionadosFiltrados = empleadosFiltrados?.filter(emp => 
        empleadosSeleccionados.has(emp.idEmpleado)
    ).length;

    const textoSeleccionarTodos = empleadosFiltrados?.length > 0 && 
        empleadosSeleccionadosFiltrados === empleadosFiltrados.length ? 
        'Deseleccionar todos' : 'Seleccionar todos';

    // Formatear fechas para mostrar en la UI
    const fechaHoy = dayjs().format('DD/MM/YYYY');
    const fechaManana = dayjs().add(1, 'day').format('DD/MM/YYYY');

    if (!isSessionVerified || loadingEmpleados) {
        return <Spinner />;
    }

    return (
        <Box className="fade-in" sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 4 }}>
            <PageHeader 
                title="Activación Especial de Vacaciones"
                subtitle="Gestión para empleados con menos de un año de antigüedad"
            />

            <Container maxWidth="md" sx={{ mt: 3 }}>
                {/* Banner informativo */}
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    <AlertTitle>Proceso Especial de RRHH</AlertTitle>
                    Los empleados con menos de un año de antigüedad requieren autorización especial 
                    para solicitar vacaciones. Esta herramienta permite activar temporalmente 
                    esta funcionalidad mediante gestión autorizada del departamento de Recursos Humanos.
                </Alert>

                {/* Barra de búsqueda y Controles Superiores */}
                <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Buscar empleado por nombre..."
                                    value={terminoBusqueda}
                                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                                    disabled={procesando}
                                    InputProps={{
                                        startAdornment: <span style={{ marginRight: 8, fontSize: '1.2rem' }}>🔍</span>,
                                        endAdornment: terminoBusqueda && (
                                            <IconButton onClick={() => setTerminoBusqueda('')} size="small">
                                                <span>✕</span>
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ textAlign: 'center', '@media (min-width: 900px)': { textAlign: 'right' } }}>
                                <Typography variant="body2" color="text.secondary">
                                    {empleadosFiltrados?.length} de {empleadosU?.length} encontrados
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {empleadosSeleccionadosFiltrados} seleccionados
                                </Typography>
                                {empleadosFiltrados?.length > 0 && (
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={toggleTodosLosEmpleados}
                                        disabled={procesando}
                                    >
                                        {textoSeleccionarTodos}
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Lista de empleados */}
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <List disablePadding>
                        {empleadosFiltrados?.length > 0 ? (
                            empleadosFiltrados.map((empleado, index) => (
                                <React.Fragment key={empleado.idEmpleado}>
                                    <ListItem 
                                        alignItems="flex-start"
                                        sx={{ 
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            bgcolor: empleadosSeleccionados.has(empleado.idEmpleado) ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                            transition: 'background-color 0.2s',
                                            p: 3,
                                            position: 'relative'
                                        }}
                                    >
                                        <ListItemAvatar sx={{ mt: 0.5 }}>
                                            <Avatar sx={{ bgcolor: '#3b82f6', width: 48, height: 48, mr: 2 }}>
                                                {empleado?.Nombre?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
                                                    {empleado.Nombre}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box component="div" sx={{ mt: 0.5, pr: { sm: 10 } }}>
                                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                                        ID: {empleado.idEmpleado}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" color="primary" sx={{ mr: 2, fontWeight: 'bold' }}>
                                                        Días acumulados año actual: {empleado.diasTotales || 0}
                                                    </Typography>
                                                    
                                                    {empleadosSeleccionados.has(empleado.idEmpleado) && (
                                                        <Box sx={{ mt: 2, width: '100%' }}>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                label="Motivo de la activación especial"
                                                                variant="outlined"
                                                                size="small"
                                                                value={descripciones[empleado.idEmpleado] || ''}
                                                                onChange={(e) => actualizarDescripcion(empleado.idEmpleado, e.target.value)}
                                                                disabled={procesando}
                                                                inputProps={{ maxLength: 500 }}
                                                                helperText={`${descripciones[empleado.idEmpleado]?.length || 0}/500 caracteres`}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            }
                                        />
                                        
                                        <ListItemSecondaryAction sx={{ top: 32, right: 24, display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'center' }}>
                                            <Switch
                                                edge="end"
                                                color="primary"
                                                checked={empleadosSeleccionados.has(empleado.idEmpleado)}
                                                onChange={() => toggleEmpleadoSeleccionado(empleado.idEmpleado)}
                                                disabled={procesando}
                                            />
                                            <Typography variant="caption" color={empleadosSeleccionados.has(empleado.idEmpleado) ? 'primary' : 'text.secondary'} sx={{ mt: 0.5, fontWeight: 'bold' }}>
                                                {empleadosSeleccionados.has(empleado.idEmpleado) ? 'Activado' : 'Pendiente'}
                                            </Typography>
                                        </ListItemSecondaryAction>

                                        {/* Mobile action button (since absolute positioning messes up column layout on xs) */}
                                        <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'space-between', width: '100%', mt: 2, alignItems: 'center' }}>
                                            <Typography variant="body2" color={empleadosSeleccionados.has(empleado.idEmpleado) ? 'primary' : 'text.secondary'} sx={{ fontWeight: 'bold' }}>
                                                {empleadosSeleccionados.has(empleado.idEmpleado) ? 'Estado: Activado' : 'Estado: Pendiente'}
                                            </Typography>
                                            <Switch
                                                color="primary"
                                                checked={empleadosSeleccionados.has(empleado.idEmpleado)}
                                                onChange={() => toggleEmpleadoSeleccionado(empleado.idEmpleado)}
                                                disabled={procesando}
                                            />
                                        </Box>
                                    </ListItem>
                                    {index < empleadosFiltrados.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <Typography variant="h2" color="text.secondary" sx={{ mb: 2 }}>🔍</Typography>
                                <Typography variant="h6" color="text.primary" gutterBottom>No se encontraron empleados</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {terminoBusqueda ? 
                                        `No hay empleados que coincidan con "${terminoBusqueda}"` : 
                                        'No hay empleados disponibles para gestión especial'
                                    }
                                </Typography>
                                {terminoBusqueda && (
                                    <Button variant="outlined" onClick={() => setTerminoBusqueda('')}>
                                        Limpiar búsqueda
                                    </Button>
                                )}
                            </Box>
                        )}
                    </List>
                </Card>

                {/* Acciones principales y Mensajes */}
                <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {empleadosFiltrados?.length > 0 && (
                        <Button 
                            variant="contained" 
                            color="primary"
                            size="large"
                            onClick={procesarActivacion}
                            disabled={procesando || empleadosSeleccionados.size === 0}
                            sx={{ px: 5, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem', boxShadow: '0 4px 14px 0 rgb(99 102 241 / 39%)' }}
                        >
                            {procesando ? (
                                <CircularProgress size={26} color="inherit" />
                            ) : (
                                `Autorizar vacaciones (${empleadosSeleccionados.size})`
                            )}
                        </Button>
                    )}
                    
                    {mensaje.texto && (
                        <Alert severity={mensaje.tipo} sx={{ width: '100%', borderRadius: 2 }}>
                            {mensaje.texto}
                        </Alert>
                    )}
                </Box>

            </Container>
        </Box>
    );
};

export default ActivarVacacionesPage;