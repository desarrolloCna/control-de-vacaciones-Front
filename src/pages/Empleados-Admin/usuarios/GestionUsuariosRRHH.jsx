import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, Typography, Button, IconButton, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, 
  Alert, Tooltip, Select, MenuItem, FormControl, InputLabel,
  FormGroup, FormControlLabel, Checkbox, FormLabel,
  Card, CardContent, Grid, List, ListItem, ListItemAvatar,
  Avatar, ListItemText, ListItemSecondaryAction, Divider
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useCheckSession } from "../../../services/session/checkSession.js";
import Spinner from "../../../components/spinners/spinner.jsx";
import api from "../../../config/api.js";
import { PageHeader } from "../../../components/UI/UIComponents";

export default function GestionUsuariosRRHH() {
  const isSessionVerified = useCheckSession();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newUserData, setNewUserData] = useState({ usuario: "", pass: "", idRol: 3 });
  const [selectedModules, setSelectedModules] = useState([]);

  // Available modules for Admin Panel
  const moduleOptions = [
    { id: "/ingresar-nuevo-empleado", label: "Ingresar Empleados" },
    { id: "/lista-de-empleados", label: "Informe de Empleados" },
    { id: "/vacaciones-empleados", label: "Reporte de Vacaciones" },
    { id: "/suspensiones", label: "Suspensiones" },
    { id: "/dias-festivos", label: "Días Festivos" },
    { id: "/crear-usuarios-rrhh", label: "Usuarios RRHH" },
    { id: "/activar-vacaciones", label: "Activar Vacaciones" },
    { id: "/excepcion-limite", label: "Excepciones de Límite" },
    { id: "/cancelar-vacaciones", label: "Cancelar Vacaciones" },
    { id: "/bitacora", label: "Bitácora de Cambios" },
    { id: "/ajustar-saldos", label: "Ajuste de Saldos" }
  ];

  const handleToggleModule = (moduleId) => {
    setSelectedModules((prev) => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/obtenerRRHH");
      setUsuarios(res.data.usuarios || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error al cargar empleados y usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSessionVerified) fetchUsuarios();
  }, [isSessionVerified]);

  const handleOpenCreate = (emp) => {
    setSelectedEmp(emp);
    setIsEditing(false);
    setNewUserData({ 
      usuario: emp.nombreCompleto.toLowerCase().replace(/\s+/g, "."), 
      pass: "CNA.2024*",
      idRol: 3 // Default to RRHH
    });
    setOpenModal(true);
    setSelectedModules([]); // Reset checkboxes
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setIsEditing(true);
    let parsedPermisos = [];
    try {
      if (emp.permisosModulos) {
        parsedPermisos = JSON.parse(emp.permisosModulos);
      }
    } catch (e) {
      console.error("Error parseando permisos", e);
    }
    
    setNewUserData({
      usuario: emp.usuario,
      pass: "", // No actualizamos password aqui
      idRol: emp.idRol || 3
    });
    setOpenModal(true);
    setSelectedModules(parsedPermisos);
  };

  const handleSaveUser = async () => {
    try {
      if (isEditing) {
        await api.put(`/admin/actualizarRRHH/${selectedEmp.idUsuario}`, {
          idRol: parseInt(newUserData.idRol),
          permisos: selectedModules
        });
        setSuccess(`Permisos actualizados para ${selectedEmp.nombreCompleto}`);
      } else {
        await api.post("/admin/crearRRHH", {
          idEmpleado: selectedEmp.idEmpleado,
          idRol: parseInt(newUserData.idRol),
          usuario: newUserData.usuario,
          pass: newUserData.pass,
          permisos: selectedModules
        });
        setSuccess(`Acceso creado para ${selectedEmp.nombreCompleto}`);
      }
      setOpenModal(false);
      fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar el usuario.");
    }
  };

  const handleDeleteUser = async (idUsuario, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar el acceso para ${nombre}?`)) {
      try {
        await api.delete(`/admin/eliminarRRHH/${idUsuario}`);
        setSuccess(`Acceso eliminado para ${nombre}`);
        fetchUsuarios();
      } catch (err) {
        setError("Error al eliminar acceso.");
      }
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return usuarios;
    const term = terminoBusqueda.toLowerCase().trim();
    return usuarios.filter(u => 
      u.nombreCompleto.toLowerCase().includes(term) ||
      (u.usuario && u.usuario.toLowerCase().includes(term))
    );
  }, [usuarios, terminoBusqueda]);

  if (!isSessionVerified) return <Spinner />;

  return (
    <Box className="fade-in" sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 4 }}>
      <PageHeader 
        title="Gestión de Accesos Administrativos" 
        subtitle="Administre permisos para personal de RRHH y Administradores del sistema" 
      />
      
      <Container maxWidth="lg" sx={{ mt: 3 }}>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        {/* Barra de Búsqueda */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar por nombre o usuario..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
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
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Typography variant="body2" color="text.secondary">
                  {usuariosFiltrados?.length} usuarios en total
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Usuarios */}
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>
          ) : (
            <List disablePadding>
              {usuariosFiltrados?.length > 0 ? (
                usuariosFiltrados.map((row, index) => (
                  <React.Fragment key={row.idEmpleado}>
                    <ListItem 
                      alignItems="flex-start"
                      sx={{ 
                        flexDirection: { xs: 'column', md: 'row' },
                        p: 3,
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.04)' }
                      }}
                    >
                      <ListItemAvatar sx={{ mt: 0.5 }}>
                        <Avatar sx={{ bgcolor: row.idUsuario ? '#10b981' : '#64748b', width: 56, height: 56, mr: 2 }}>
                          {row.nombreCompleto?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
                            {row.nombreCompleto}
                          </Typography>
                        }
                        secondary={
                          <Box component="div" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box>
                              <Typography variant="body2" color="text.primary" fontWeight="500">
                                {row.puesto}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {row.unidad}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                              {row.usuario ? (
                                <Chip label={`@${row.usuario}`} size="small" color="primary" variant="outlined" />
                              ) : (
                                <Chip label="Sin cuenta" size="small" color="default" variant="outlined" />
                              )}

                              {row.nombreRol && (
                                <Chip 
                                  label={row.nombreRol} 
                                  size="small" 
                                  color={row.idRol === 2 ? "secondary" : "info"} 
                                  variant="filled" 
                                />
                              )}

                              {row.idUsuario ? (
                                <Chip label="ACTIVO" size="small" color="success" />
                              ) : (
                                <Chip label="SIN ACCESO" size="small" color="error" variant="outlined" />
                              )}
                            </Box>

                            {/* Mostrar módulos habilitados si es RRHH o Admin (No SuperAdmin) */}
                            {row.idUsuario && row.idRol !== 1 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                                  Módulos Habilitados:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {(() => {
                                    try {
                                      const permisos = JSON.parse(row.permisosModulos || "[]");
                                      return moduleOptions
                                        .filter(opt => permisos.includes(opt.id))
                                        .map(opt => (
                                          <Chip 
                                            key={opt.id} 
                                            label={opt.label} 
                                            size="small" 
                                            sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }} 
                                          />
                                        ));
                                    } catch (e) {
                                      return <Typography variant="caption">Error en permisos</Typography>;
                                    }
                                  })()}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction 
                        sx={{ 
                          right: { xs: 'auto', md: 24 }, 
                          position: { xs: 'relative', md: 'absolute' }, 
                          top: { xs: 'auto', md: '50%' },
                          transform: { xs: 'none', md: 'translateY(-50%)' },
                          mt: { xs: 2, md: 0 },
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {!row.idUsuario ? (
                          <Button
                            startIcon={<PersonAddIcon />}
                            variant="contained"
                            size="medium"
                            color="primary"
                            onClick={() => handleOpenCreate(row)}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3, boxShadow: '0 4px 10px 0 rgb(59 130 246 / 30%)' }}
                          >
                            Crear Acceso
                          </Button>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button 
                              variant="outlined" 
                              color="primary" 
                              size="medium"
                              onClick={() => handleOpenEdit(row)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Editar Permisos
                            </Button>
                            <Tooltip title="Eliminar Acceso">
                              <IconButton color="error" onClick={() => handleDeleteUser(row.idUsuario, row.nombreCompleto)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < usuariosFiltrados.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h2" color="text.secondary" sx={{ mb: 2 }}>🔍</Typography>
                  <Typography variant="h6" color="text.primary" gutterBottom>No se encontraron resultados</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prueba buscando con otro nombre de empleado
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Card>

        {/* Modal Crear Usuario */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}>Crear Acceso Administrativo</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <strong>Empleado objetivo:</strong> {selectedEmp?.nombreCompleto}
            </Alert>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="rol-label">Rol Asignado</InputLabel>
              <Select
                labelId="rol-label"
                value={newUserData.idRol}
                label="Rol Asignado"
                onChange={(e) => setNewUserData({ ...newUserData, idRol: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={3}>Recursos Humanos (RRHH)</MenuItem>
                <MenuItem value={2}>Administrador de Permisos (VP)</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth label="Nombre de Usuario"
              margin="normal"
              value={newUserData.usuario}
              disabled={isEditing}
              onChange={(e) => setNewUserData({ ...newUserData, usuario: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            
            {!isEditing && (
              <TextField
                fullWidth label="Contraseña Temporal"
                margin="normal"
                type="text"
                value={newUserData.pass}
                onChange={(e) => setNewUserData({ ...newUserData, pass: e.target.value })}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            )}

            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                Módulos Permitidos para este Usuario:
              </FormLabel>
              <FormGroup>
                {moduleOptions.map((mod) => (
                  <FormControlLabel
                    key={mod.id}
                    control={
                      <Checkbox 
                        checked={selectedModules.includes(mod.id)} 
                        onChange={() => handleToggleModule(mod.id)} 
                        color="primary"
                      />
                    }
                    label={<Typography variant="body2">{mod.label}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
            <Button 
              onClick={handleSaveUser} 
              variant="contained" 
              disabled={!isEditing && (!newUserData.usuario || !newUserData.pass)}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {isEditing ? "Guardar Cambios" : "Crear Acceso"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
