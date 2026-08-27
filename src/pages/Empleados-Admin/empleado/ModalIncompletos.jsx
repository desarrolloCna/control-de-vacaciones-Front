import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Typography, IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import api from "../../../config/api";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

export default function ModalIncompletos({ open, onClose, onResume }) {
  const [incompletos, setIncompletos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (open) {
      cargarIncompletos();
    }
  }, [open]);

  const cargarIncompletos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/empleados-incompletos");
      setIncompletos(res.data.responseData?.incompletos || res.data.incompletos || []);
    } catch (err) {
      console.error("Error al cargar registros incompletos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (row) => {
    setLoadingId(row.idInfoPersonal);
    try {
      const fullData = await getFullEmployeeData(row.idInfoPersonal);
      
      // Mapear los datos de getFullEmployeeData a wizardData
      let activeStep = 1; // Ya tiene DPI e InfoPersonal
      
      const newWizardData = {
        idDpi: row.idDpi,
        idInfoPersonal: row.idInfoPersonal,
        numeroDocumento: row.numeroDocumento,
        primerNombre: fullData.personal.primerNombre,
        segundoNombre: fullData.personal.segundoNombre,
        tercerNombre: fullData.personal.tercerNombre,
        primerApellido: fullData.personal.primerApellido,
        segundoApellido: fullData.personal.segundoApellido,
        apellidoCasada: fullData.personal.apellidoCasada,
        numeroCelular: fullData.personal.numeroCelular,
        correoPersonal: fullData.personal.correoPersonal,
        direccionResidencia: fullData.personal.direccionResidencia,
        estadoCivil: fullData.personal.estadoCivil,
        genero: fullData.personal.genero,
        departamentoNacimiento: fullData.personal.departamentoNacimiento,
        municipioNacimiento: fullData.personal.municipioNacimiento,
        nit: fullData.personal.nit,
        numAfiliacionIgss: fullData.personal.numAfiliacionIgss,
        fechaNacimiento: fullData.personal.fechaNacimiento,
        numeroLicencia: fullData.personal.numeroLicencia,
        tipoLicencia: fullData.personal.tipoLicencia,
      };

      if (fullData.familiares && fullData.familiares.length > 0) {
        newWizardData.familiares = fullData.familiares;
        activeStep = 2; // Tiene familiares
      }

      if (fullData.educativo && Object.keys(fullData.educativo).length > 0) {
        // Mapear datos educativos si existen
        newWizardData.idNivelEducativo = fullData.educativo.idNivelEducativo;
        newWizardData.nivelEducativo = fullData.educativo.nivelEducativo;
        newWizardData.tituloAcademico = fullData.educativo.tituloAcademico;
        newWizardData.constanciaEstudios = fullData.educativo.constanciaEstudios;
        newWizardData.cursosRecibidos = fullData.educativo.cursosRecibidos;
        activeStep = 3;
      }

      if (fullData.sociolinguistico && Object.keys(fullData.sociolinguistico).length > 0) {
        newWizardData.comunidadLinguistica = fullData.sociolinguistico.comunidadLinguistica;
        newWizardData.puebloPertenencia = fullData.sociolinguistico.puebloPertenencia;
        newWizardData.idiomaMaterno = fullData.sociolinguistico.idiomaMaterno;
        newWizardData.segundoIdioma = fullData.sociolinguistico.segundoIdioma;
        
        // Asumimos que si tiene sociolinguistico, también tiene médicos porque se guardan juntos
        if (fullData.medicos && Object.keys(fullData.medicos).length > 0) {
          newWizardData.tipoSangre = fullData.medicos.tipoSangre;
          newWizardData.alergias = fullData.medicos.alergias;
          newWizardData.enfermedades = fullData.medicos.enfermedades;
          newWizardData.contactoEmergencia = fullData.medicos.contactoEmergencia;
          newWizardData.telefonoEmergencia = fullData.medicos.telefonoEmergencia;
          newWizardData.parentescoEmergencia = fullData.medicos.parentescoEmergencia;
        }
        activeStep = 4; // Tiene datos generales
      }

      if (activeStep === 4) {
          activeStep = 5;
      }

      onResume(newWizardData, activeStep);
    } catch (error) {
      console.error("Error al obtener datos completos:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">Recuperar Registros Incompletos</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Esta lista muestra a las personas cuyo registro se inició pero no se ha completado (no han llegado al último paso de Datos de Empleo). Seleccione "Continuar" para retomar el proceso.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : incompletos.length === 0 ? (
          <Typography align="center" color="text.secondary" p={4}>No hay registros incompletos actualmente.</Typography>
        ) : (
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>DPI</strong></TableCell>
                  <TableCell><strong>Nombre Completo</strong></TableCell>
                  <TableCell><strong>Fecha Inicio</strong></TableCell>
                  <TableCell align="center"><strong>Acción</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incompletos.map((row) => (
                  <TableRow key={row.idInfoPersonal}>
                    <TableCell>{row.numeroDocumento}</TableCell>
                    <TableCell>
                      {row.primerNombre} {row.segundoNombre} {row.primerApellido} {row.segundoApellido}
                    </TableCell>
                    <TableCell>{new Date(row.fechaIngreso).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={loadingId === row.idInfoPersonal ? <CircularProgress size={16} color="inherit" /> : <PlayCircleOutlineIcon />}
                        disabled={loadingId === row.idInfoPersonal}
                        onClick={() => handleResume(row)}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        Continuar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
