import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Card, CardContent, Button, Autocomplete, TextField, CircularProgress, Alert } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Navbar from '../../../components/navBar/NavBar';
import api from '../../../config/api';

export default function SucesionPage() {
    const [coordinadores, setCoordinadores] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    
    const [saliente, setSaliente] = useState(null);
    const [entrante, setEntrante] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Traer a los coordinadores (para ser los salientes)
            const resCoord = await api.get(`/coordinadores/consultarCoordinadoresList`);
            const dataCoord = resCoord.data;
            
            // Traer a todos los empleados activos (para ser los entrantes)
            const resEmp = await api.get(`/empleados/employeesList`);
            const dataEmp = resEmp.data;
            
            if (dataCoord.coordinadores) setCoordinadores(dataCoord.coordinadores);
            if (dataEmp.empleados) setEmpleados(dataEmp.empleados);
            
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setErrorMessage("Error al cargar datos.");
        } finally {
            setLoadingData(false);
        }
    };

    const handleSucesion = async () => {
        if (!saliente || !entrante) return;
        
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');
        
        try {
            const res = await api.post(`/coordinadores/relevarCoordinador`, {
                idEmpleadoSaliente: saliente.idEmpleado,
                idEmpleadoEntrante: entrante.idEmpleado
            });
            
            const data = res.data;
            
            if (data.success) {
                setSuccessMessage("La sucesión se ha realizado correctamente. Se han trasladado permisos y solicitudes.");
                setSaliente(null);
                setEntrante(null);
                fetchData(); // Refrescar listas
            } else {
                setErrorMessage(data.message || "Error al procesar la sucesión");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Ocurrió un error en el servidor.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
                <Navbar />
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "#1e293b" }}>
                    Sucesión / Relevo de Jefatura
                </Typography>
                <Typography variant="body1" sx={{ color: "#64748b", mb: 4 }}>
                    Transfiera el rol de coordinador y todas las solicitudes de vacaciones pendientes al empleado entrante.
                </Typography>

                <Card sx={{ p: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <CardContent>
                        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}
                        {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}
                        
                        <Box display="flex" flexDirection="column" gap={4}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600} mb={1}>1. Coordinador Saliente</Typography>
                                <Autocomplete
                                    options={coordinadores}
                                    getOptionLabel={(option) => `${option.nombreCoordinador} - ${option.coordinadorUnidad}`}
                                    value={saliente}
                                    onChange={(_, newValue) => setSaliente(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Seleccione al coordinador que entrega el cargo" />}
                                />
                            </Box>
                            
                            <Box display="flex" justifyContent="center">
                                <Box sx={{ bgcolor: "#f1f5f9", p: 1.5, borderRadius: "50%" }}>
                                    <SwapHorizIcon sx={{ fontSize: 32, color: "#64748b" }} />
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" fontWeight={600} mb={1}>2. Empleado Entrante</Typography>
                                <Autocomplete
                                    options={empleados}
                                    getOptionLabel={(option) => `${option.Nombres} - ${option.puesto || ''}`}
                                    value={entrante}
                                    onChange={(_, newValue) => setEntrante(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Seleccione a la persona que asume el cargo" />}
                                />
                            </Box>
                            
                            <Button 
                                variant="contained" 
                                color="primary"
                                size="large"
                                onClick={handleSucesion}
                                disabled={!saliente || !entrante || loading}
                                sx={{ mt: 2, py: 1.5, fontWeight: 700, borderRadius: 2 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Ejecutar Sucesión"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
