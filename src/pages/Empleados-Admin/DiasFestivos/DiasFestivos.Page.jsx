import React, { useState, useMemo } from 'react';
import { 
  Box, Container, Typography, Paper, Modal, TextField, 
  Switch, Button, CircularProgress, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import Navbar from '../../../components/navBar/NavBar';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useDiasFestivosAdmin } from '../../../hooks/DiasFestivos/useDiasFestivosAdmin';
import { useCheckSession } from '../../../services/session/checkSession';
import Spinner from '../../../components/spinners/spinner';
import { PageHeader } from '../../../components/UI/UIComponents';
const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function DiasFestivosPage() {
  const isSessionVerified = useCheckSession();
  const { diasFestivos, loading, error, createDiaFestivo, updateDiaFestivo, deleteDiaFestivo } = useDiasFestivosAdmin();
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    fechaDiaFestivo: '',
    nombreDiaFestivo: '',
    medioDia: false,
    estado: 'A'
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Años disponibles basados en los datos (o años por defecto)
  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear().toString()]);
    (diasFestivos || []).forEach(fiesta => {
      if (fiesta && typeof fiesta.fechaDiaFestivo === 'string' && fiesta.fechaDiaFestivo.length >= 4) {
        years.add(fiesta.fechaDiaFestivo.substring(0, 4));
      }
    });
    return Array.from(years).sort().reverse();
  }, [diasFestivos]);

  // Filtrar festivos por el año seleccionado
  const filteredFestivos = useMemo(() => {
    return (diasFestivos || []).filter(fiesta => {
      if (!fiesta || typeof fiesta.fechaDiaFestivo !== 'string' || fiesta.fechaDiaFestivo.length < 4) return false;
      return fiesta.fechaDiaFestivo.substring(0, 4) === selectedYear;
    }).sort((a, b) => {
      if (!a.fechaDiaFestivo || !b.fechaDiaFestivo) return 0;
      return new Date(a.fechaDiaFestivo).getTime() - new Date(b.fechaDiaFestivo).getTime();
    });
  }, [diasFestivos, selectedYear]);

  if (!isSessionVerified) {
    return <Spinner />;
  }

  const handleOpenNew = () => {
    setIsEdit(false);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFormData({ 
      fechaDiaFestivo: `${yyyy}-${mm}-${dd}`, 
      nombreDiaFestivo: '', 
      medioDia: false, 
      estado: 'A' 
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (fiesta) => {
    setIsEdit(true);
    setCurrentId(fiesta.idDiasFestivos);
    setFormData({
      fechaDiaFestivo: fiesta.fechaDiaFestivo,
      nombreDiaFestivo: fiesta.nombreDiaFestivo,
      medioDia: fiesta.medioDia === 1 || fiesta.medioDia === true,
      estado: fiesta.estado
    });
    setOpenModal(true);
  };

  const handleDelete = async () => {
    if(window.confirm('¿Está seguro de eliminar este día festivo de forma permanente?')) {
      const success = await deleteDiaFestivo(currentId);
      if(success) {
        // Registro en Bitácora
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        try {
          await api.post("/registrarBitacora", {
            idUsuario: userData.idUsuario || userData.idEmpleado,
            usuario: userData.usuario || "desconocido",
            accion: "DELETE",
            tabla: "dias_festivos",
            idRegistro: currentId,
            datosAnteriores: { id: currentId },
            datosNuevos: null,
            descripcion: `Eliminación permanente del día festivo ID: ${currentId}`
          });
        } catch (bitErr) { console.warn("Error bitácora:", bitErr); }
        setOpenModal(false);
      }
    }
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      medioDia: formData.medioDia ? 1 : 0
    };

    let success = false;
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    if (isEdit) {
      success = await updateDiaFestivo(currentId, payload);
      if (success) {
        try {
          await api.post("/registrarBitacora", {
            idUsuario: userData.idUsuario || userData.idEmpleado,
            usuario: userData.usuario || "desconocido",
            accion: "UPDATE",
            tabla: "dias_festivos",
            idRegistro: currentId,
            datosAnteriores: null,
            datosNuevos: payload,
            descripcion: `Actualización del día festivo: ${formData.nombreDiaFestivo}`
          });
        } catch (bitErr) { console.warn("Error bitácora:", bitErr); }
      }
    } else {
      success = await createDiaFestivo(payload);
      if (success) {
        try {
          await api.post("/registrarBitacora", {
            idUsuario: userData.idUsuario || userData.idEmpleado,
            usuario: userData.usuario || "desconocido",
            accion: "INSERT",
            tabla: "dias_festivos",
            idRegistro: null,
            datosAnteriores: null,
            datosNuevos: payload,
            descripcion: `Creación de nuevo día festivo: ${formData.nombreDiaFestivo} (${formData.fechaDiaFestivo})`
          });
        } catch (bitErr) { console.warn("Error bitácora:", bitErr); }
      }
    }

    if(success) {
      setOpenModal(false);
    }
  };

  return (
    <Box className="fade-in">
      <PageHeader 
        title="Días Festivos" 
        subtitle={`Gestión de feriados institucionales — Año ${selectedYear}`} 
      />
      
      <Box sx={{ p: 3 }}>
        <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
              Historial de Días Festivos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Listado de feriados configurados separados por año de gestión.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenNew}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)', height: 48 }}
          >
            Nuevo Feriado
          </Button>
        </Box>

        <Box mb={3} display="flex" gap={2} alignItems="center">
          <FormControl sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 1 }} size="small">
            <InputLabel>Filtrar por Año</InputLabel>
            <Select
              value={selectedYear}
              label="Filtrar por Año"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: '12px', width: '100%', overflowX: 'auto', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "linear-gradient(90deg, #1A237E 0%, #1565C0 100%)" }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Nombre Festividad</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">¿Medio Día?</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">Estado</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell>
                </TableRow>
              ) : filteredFestivos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No hay días festivos configurados para el año {selectedYear}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFestivos.map((fiesta) => (
                  <TableRow key={fiesta.idDiasFestivos || Math.random()} sx={{ '&:hover': { backgroundColor: '#f1f5f9' } }}>
                    <TableCell>
                      {typeof fiesta.fechaDiaFestivo === 'string' && fiesta.fechaDiaFestivo.includes('-') 
                        ? fiesta.fechaDiaFestivo.split('-').reverse().join('/') 
                        : '---'}
                    </TableCell>
                    <TableCell>{fiesta.nombreDiaFestivo}</TableCell>
                    <TableCell align="center">{fiesta.medioDia ? 'Sí' : 'No'}</TableCell>
                    <TableCell align="center">{fiesta.estado}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenEdit(fiesta)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal Insertar/Editar */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={styleModal}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {isEdit ? 'Editar Día Festivo' : 'Nuevo Día Festivo'}
              </Typography>
              {isEdit && (
                <IconButton color="error" onClick={handleDelete} title="Eliminar Festivo">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            
            <TextField
              label="Fecha"
              type="date"
              fullWidth
              variant="outlined"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={formData.fechaDiaFestivo}
              onChange={(e) => setFormData({...formData, fechaDiaFestivo: e.target.value})}
            />
            <TextField
              label="Nombre del Feriado"
              fullWidth
              variant="outlined"
              margin="normal"
              value={formData.nombreDiaFestivo}
              onChange={(e) => setFormData({...formData, nombreDiaFestivo: e.target.value})}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2, justifyContent: 'space-between' }}>
              <Typography>¿Aplica como Medio Día?</Typography>
              <Switch 
                checked={formData.medioDia}
                onChange={(e) => setFormData({...formData, medioDia: e.target.checked})}
                color="primary"
              />
            </Box>

            {isEdit && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Typography>Estado (Activo)</Typography>
                <Switch 
                  checked={formData.estado === 'A'}
                  onChange={(e) => setFormData({...formData, estado: e.target.checked ? 'A' : 'I'})}
                  color="success"
                />
              </Box>
            )}

            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSave} 
              sx={{ mt: 2, py: 1.5, background: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)' }}
            >
              Guardar Feriado
            </Button>
          </Box>
        </Modal>

      </Container>
      </Box>
    </Box>
  );
}
