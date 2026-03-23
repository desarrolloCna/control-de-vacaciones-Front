import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import { actualizarDatosLaborales, actualizarInfoPersonal, actualizarDpi, actualizarOtrosDatos } from "../../../services/EmpleadosServices/ActualizarEmpleado";
import api from "../../../config/api";
import axios from "axios";
import { API_URL } from "../../../config/enviroment";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";

const EditEmpleadoModal = ({ open, onClose, employeeData, onSaveSuccess, isAdmin: propIsAdmin, isEmbedded = false }) => {
  const currentUser = getLocalStorageData();
  const isAdmin = propIsAdmin ?? (currentUser?.idRol === 1 || currentUser?.idRol === 3);
  const [activeTab, setActiveTab] = useState(isAdmin ? 0 : 1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Catálogos
  const [catalogues, setCatalogues] = useState({
    departamentos: [],
    municipios: [],
    municipiosFiltrados: [],
    etnias: [],
    comunidades: [],
    discapacidades: [],
    puestos: [],
    unidades: [],
    renglones: [],
    niveles: [],
    parentescos: []
  });

  // Form states
  const [laboral, setLaboral] = useState({
    puesto: "",
    salario: "",
    fechaIngreso: "",
    correoInstitucional: "",
    extensionTelefonica: "",
    unidad: "",
    renglon: "",
    observaciones: "",
    coordinacion: "",
    tipoContrato: "",
    numeroCuentaCHN: "",
    numeroContrato: "",
    numeroActa: "",
    numeroAcuerdo: "",
  });

  const [dpi, setDpi] = useState({
    numeroDocumento: "",
    departamentoExpedicion: "",
    municipioExpedicion: "",
    fechaVencimientoDpi: "",
  });

  const [personal, setPersonal] = useState({
    primerNombre: "",
    segundoNombre: "",
    tercerNombre: "",
    primerApellido: "",
    segundoApellido: "",
    apellidoCasada: "",
    numeroCelular: "",
    correoPersonal: "",
    direccionResidencia: "",
    estadoCivil: "",
    genero: "",
    nit: "",
    numAfiliacionIgss: "",
    fechaNacimiento: "",
    numeroLicencia: "",
    tipoLicencia: "",
    departamentoNacimiento: "",
    municipioNacimiento: "",
  });

  const [otros, setOtros] = useState({
    nivelEducativo: {
      nivelDeEstudios: "",
      ultimoNivelAlcanzado: "",
      añoUltimoNivelCursado: "",
      Profesion: "",
      numeroColegiado: "",
      fechaColegiacion: "",
    },
    pertenenciaSociolinguistica: {
      etnia: "",
      comunidadLinguistica: "",
    },
    datosMedicos: {
      discapacidad: "",
      tipoDiscapacidad: "",
      tipoSangre: "",
      condicionMedica: "",
      tomaMedicina: "",
      nombreMedicamento: "",
      sufreAlergia: "",
    }
  });

  const [familiares, setFamiliares] = useState([]);
  const [newFamiliar, setNewFamiliar] = useState({
    nombreFamiliar: "",
    telefono: "",
    parentesco: "",
    fechaNacimiento: ""
  });
  const [addingFamiliar, setAddingFamiliar] = useState(false);

  useEffect(() => {
    if (employeeData) {
      // Soporte para estructura plana o anidada
      const dataLab = employeeData.laboral || employeeData.datosLaborales || employeeData;
      const dataPer = employeeData.personal || employeeData.infoPersonal || employeeData;
      const dataEdu = employeeData.educativo || employeeData.nivelEducativoInf || employeeData;
      const dataSoc = employeeData.sociolinguistico || employeeData.infoSoli || employeeData;
      const dataMed = employeeData.medicos || employeeData.datosMedicos || employeeData;
      const dataFam = employeeData.familiares || employeeData.responseData?.familiares || [];
      const dataDpi = employeeData.dpi || employeeData.infoDpi || employeeData;

      setDpi({
        numeroDocumento: dataDpi.numeroDocumento || "",
        departamentoExpedicion: dataDpi.departamentoExpedicion || "",
        municipioExpedicion: dataDpi.municipioExpedicion || "",
        fechaVencimientoDpi: dataDpi.fechaVencimientoDpi ? dataDpi.fechaVencimientoDpi.split("T")[0] : "",
      });

      setLaboral({
        puesto: dataLab.puesto || "",
        salario: dataLab.salario || "",
        fechaIngreso: dataLab.fechaIngreso ? dataLab.fechaIngreso.split("T")[0] : "",
        correoInstitucional: dataLab.correoInstitucional || "",
        extensionTelefonica: dataLab.extensionTelefonica || "",
        unidad: dataLab.unidad || "",
        renglon: dataLab.renglon || "",
        observaciones: dataLab.observaciones || "",
        coordinacion: dataLab.coordinacion || "",
        tipoContrato: dataLab.tipoContrato || "",
        numeroCuentaCHN: dataLab.numeroCuentaCHN || "",
        numeroContrato: dataLab.numeroContrato || "",
        numeroActa: dataLab.numeroActa || "",
        numeroAcuerdo: dataLab.numeroAcuerdo || "",
      });
      
      setPersonal({
        primerNombre: dataPer.primerNombre || "",
        segundoNombre: dataPer.segundoNombre || "",
        tercerNombre: dataPer.tercerNombre || "",
        primerApellido: dataPer.primerApellido || "",
        segundoApellido: dataPer.segundoApellido || "",
        apellidoCasada: dataPer.apellidoCasada || "",
        numeroCelular: dataPer.numeroCelular || "",
        correoPersonal: dataPer.correoPersonal || "",
        direccionResidencia: dataPer.direccionResidencia || "",
        estadoCivil: dataPer.estadoCivil || "",
        genero: dataPer.Genero || dataPer.genero || "",
        nit: dataPer.nit || "",
        numAfiliacionIgss: dataPer.numAfiliacionIgss || "",
        fechaNacimiento: dataPer.fechaNacimiento ? dataPer.fechaNacimiento.split("T")[0] : "",
        numeroLicencia: dataPer.numeroLicnecia || dataPer.numeroLicencia || "",
        tipoLicencia: dataPer.tipoLicencia || "",
        departamentoNacimiento: dataPer.departamentoNacimiento || "",
        municipioNacimiento: dataPer.municipioNacimiento || "",
      });

      setOtros({
        nivelEducativo: {
          nivelDeEstudios: dataEdu.nivelDeEstudios || "",
          ultimoNivelAlcanzado: dataEdu.ultimoNivelAlcanzado || "",
          añoUltimoNivelCursado: (dataEdu.añoUltimoNivelCursado || dataEdu.anoUltimoNivelCursado) ? (dataEdu.añoUltimoNivelCursado || dataEdu.anoUltimoNivelCursado).split("T")[0] : "",
          Profesion: dataEdu.Profesion || "",
          numeroColegiado: dataEdu.numeroColegiado || "",
          fechaColegiacion: dataEdu.fechaColegiacion ? dataEdu.fechaColegiacion.split("T")[0] : "",
        },
        pertenenciaSociolinguistica: {
          etnia: dataSoc.etnia || "",
          comunidadLinguistica: dataSoc.comunidadLinguistica || "",
        },
        datosMedicos: {
          discapacidad: dataMed.discapacidad || "",
          tipoDiscapacidad: dataMed.tipoDiscapacidad || "",
          tipoSangre: dataMed.tipoSangre || "",
          condicionMedica: dataMed.condicionMedica || "",
          tomaMedicina: dataMed.tomaMedicina || "",
          nombreMedicamento: dataMed.nombreMedicamento || "",
          sufreAlergia: dataMed.sufreAlergia || "",
        }
      });

      setFamiliares(dataFam);
    }
  }, [employeeData]);

  const handleLaboralChange = (e) => {
    setLaboral({ ...laboral, [e.target.name]: e.target.value });
  };

  const handlePersonalChange = (e) => {
    setPersonal({ ...personal, [e.target.name]: e.target.value });
  };

  const handleOtrosChange = (section, e) => {
    setOtros({
      ...otros,
      [section]: { ...otros[section], [e.target.name]: e.target.value }
    });
  };

  useEffect(() => {
    const fetchCatalogues = async () => {
      const endpointsList = [
        { key: 'departamentos', url: '/departamentos' },
        { key: 'municipios', url: '/municipios' },
        { key: 'etnias', url: '/puebloPerteneciente' },
        { key: 'comunidades', url: '/comunidadLinguistica' },
        { key: 'discapacidades', url: '/discapacidades' },
        { key: 'puestos', url: '/puestos' },
        { key: 'unidades', url: '/unidades' },
        { key: 'renglones', url: '/renglonesPresupuestarios' },
        { key: 'niveles', url: '/nivelEducativo' },
        { key: 'parentescos', url: '/parentesco' }
      ];

      for (const endpoint of endpointsList) {
        try {
          const res = await api.get(endpoint.url);
          let data = [];
          
          if (endpoint.key === 'puestos' || endpoint.key === 'unidades' || endpoint.key === 'renglones') {
            data = res.data.puestos || res.data.unidades || res.data.renglones || res.data.departamentos || res.data.responseData?.puestos || res.data.responseData?.unidades || res.data.responseData?.renglones || [];
            data = (Array.isArray(data) ? data : []).filter(d => d.estado === "A" || d.estado === undefined);
          } else if (endpoint.key === 'departamentos') {
             data = res.data.departamentos || res.data.data || [];
          } else if (endpoint.key === 'municipios') {
             data = res.data.municipios || res.data.data || [];
          } else if (endpoint.key === 'etnias') {
             data = res.data.etnias || res.data.puebloPerteneciente || res.data.data || [];
          } else if (endpoint.key === 'comunidades') {
             data = res.data.comunidadesLinguisticas || res.data.comunidadLinguistica || res.data.data || [];
          } else if (endpoint.key === 'discapacidades') {
             data = res.data.discapacidades || res.data.data || [];
          } else if (endpoint.key === 'niveles') {
             data = res.data.nivelEducativo || res.data.data || [];
          } else if (endpoint.key === 'parentescos') {
             data = res.data.parentescos || res.data.departamentos || res.data.data || [];
          }
          
          setCatalogues(prev => ({ ...prev, [endpoint.key]: Array.isArray(data) ? data : [] }));
        } catch (err) {
          console.warn(`Error al cargar catálogo ${endpoint.key}:`, err);
        }
      }
    };
    fetchCatalogues();
  }, []);

  const handleDepartamentoChange = (e) => {
    const depId = e.target.value;
    setPersonal(prev => ({ ...prev, departamentoNacimiento: depId, municipioNacimiento: "" }));
    
    // Filtrar municipios
    const filtered = catalogues.municipios.filter(
      (m) => Math.floor(m.idMunicipio / 100) === parseInt(depId)
    );
    setCatalogues(prev => ({ ...prev, municipiosFiltrados: filtered }));
  };

  // Inicializar municipios filtrados si existe departamento
  useEffect(() => {
    if (personal.departamentoNacimiento && catalogues.municipios.length > 0) {
      const filtered = catalogues.municipios.filter(
        (m) => Math.floor(m.idMunicipio / 100) === parseInt(personal.departamentoNacimiento)
      );
      setCatalogues(prev => ({ ...prev, municipiosFiltrados: filtered }));
    }
  }, [personal.departamentoNacimiento, catalogues.municipios]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const idInfo = employeeData.idInfoPersonal || employeeData.id;
    
    if (!idInfo) {
      setError("ID de empleado no encontrado");
      setLoading(false);
      return;
    }

    const errores = [];
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    const logBitacora = async (accion, tabla, datosNuevos, descripcion) => {
      try {
        await api.post("/registrarBitacora", {
          idUsuario: userData.idUsuario || userData.idEmpleado,
          usuario: userData.usuario || "desconocido",
          accion,
          tabla,
          idRegistro: idInfo,
          datosAnteriores: null,
          datosNuevos,
          descripcion
        });
      } catch (e) { console.warn("Error al registrar bitácora:", e); }
    };

    try { 
      await actualizarInfoPersonal(idInfo, personal); 
      await logBitacora("UPDATE", "infoPersonalEmpleados", personal, `Actualización de info personal del empleado ${idInfo}`);
    } catch (e) { console.warn("Error personal:", e); errores.push("personal"); }
    
    try { 
      await actualizarDpi(idInfo, dpi); 
      await logBitacora("UPDATE", "dpiEmpleados", dpi, `Actualización de DPI del empleado ${idInfo}`);
    } catch (e) { console.warn("Error dpi:", e); errores.push("dpi"); }
    
    try { 
      await actualizarOtrosDatos(idInfo, otros); 
      await logBitacora("UPDATE", "datosGenerales", otros, `Actualización de otros datos del empleado ${idInfo}`);
    } catch (e) { console.warn("Error otros:", e); errores.push("otros"); }
    
    if (isAdmin) {
      try { 
        await actualizarDatosLaborales(idInfo, laboral); 
        await logBitacora("UPDATE", "empleados", laboral, `Actualización de datos laborales del empleado ${idInfo}`);
      } catch (e) { console.warn("Error laboral:", e); errores.push("laboral"); }
    }

    if (errores.length > 0) {
      console.warn("Secciones con error:", errores);
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      setSuccess(false);
      if (onSaveSuccess) onSaveSuccess();
      if (onClose) onClose();
    }, 1500);
  };

  const handleAddFamiliar = async () => {
    if (!newFamiliar.nombreFamiliar || !newFamiliar.parentesco) {
      setError("Nombre y parentesco son obligatorios");
      return;
    }

    setAddingFamiliar(true);
    setError(null);
    const idInfo = employeeData.idInfoPersonal || employeeData.id;

    try {
      const payload = {
        idInfoPersonal: idInfo,
        ...newFamiliar
      };
      await api.post("/ingresarFamiliar", payload);
      
      // Actualizar lista local
      setFamiliares([...familiares, { ...newFamiliar }]);
      
      // Limpiar formulario
      setNewFamiliar({
        nombreFamiliar: "",
        telefono: "",
        parentesco: "",
        fechaNacimiento: ""
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al agregar familiar.");
      console.error(err);
    } finally {
      setAddingFamiliar(false);
    }
  };

  const renderContent = () => (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="scrollable" scrollButtons="auto">
          {isAdmin && <Tab label="Información Laboral" value={0} />}
          <Tab label="Información Personal" value={1} />
          <Tab label="Otros Datos" value={2} />
          {isAdmin && <Tab label="Familiares" value={3} />}
        </Tabs>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>Cambios guardados con éxito.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!isAdmin}>
                <InputLabel>Puesto</InputLabel>
                <Select name="puesto" value={laboral.puesto} onChange={handleLaboralChange} label="Puesto">
                  {catalogues.puestos.map(p => <MenuItem key={p.idPuesto} value={p.puesto}>{p.puesto}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Salario" name="salario" value={laboral.salario} onChange={handleLaboralChange} disabled={!isAdmin} InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={!isAdmin}>
                <InputLabel>Unidad</InputLabel>
                <Select name="unidad" value={laboral.unidad} onChange={handleLaboralChange} label="Unidad">
                  {catalogues.unidades.map(u => <MenuItem key={u.idUnidad} value={u.nombreUnidad}>{u.nombreUnidad}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={!isAdmin}>
                <InputLabel>Renglón</InputLabel>
                <Select name="renglon" value={laboral.renglon} onChange={handleLaboralChange} label="Renglón">
                  {catalogues.renglones.map(r => <MenuItem key={r.idRenglonPresupuestario} value={r.renglon}>{r.descripcion}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Fecha de Ingreso" name="fechaIngreso" type="date" value={laboral.fechaIngreso} onChange={handleLaboralChange} disabled={!isAdmin} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={!isAdmin}>
                <InputLabel>Renglón</InputLabel>
                <Select name="renglon" value={laboral.renglon} onChange={handleLaboralChange} label="Renglón">
                  {catalogues.renglones.map(r => <MenuItem key={r.idRenglonPresupuestario} value={r.renglon}>{r.descripcion}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={!isAdmin}>
                <InputLabel>Tipo de Contrato</InputLabel>
                <Select name="tipoContrato" value={laboral.tipoContrato} onChange={handleLaboralChange} label="Tipo de Contrato">
                  <MenuItem value="Permanente">Permanente</MenuItem>
                  <MenuItem value="Temporal">Temporal</MenuItem>
                  <MenuItem value="Consultor">Consultor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Correo Institucional" name="correoInstitucional" value={laboral.correoInstitucional} onChange={handleLaboralChange} disabled={!isAdmin} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Extensión Telefónica" name="extensionTelefonica" value={laboral.extensionTelefonica} onChange={handleLaboralChange} disabled={!isAdmin} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Número de Cuenta CHN" name="numeroCuentaCHN" value={laboral.numeroCuentaCHN} onChange={handleLaboralChange} disabled={!isAdmin} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Número de Contrato" name="numeroContrato" value={laboral.numeroContrato} onChange={handleLaboralChange} disabled={!isAdmin} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Número de Acta" name="numeroActa" value={laboral.numeroActa} onChange={handleLaboralChange} disabled={!isAdmin} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Número de Acuerdo" name="numeroAcuerdo" value={laboral.numeroAcuerdo} onChange={handleLaboralChange} disabled={!isAdmin} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Observaciones" name="observaciones" value={laboral.observaciones} onChange={handleLaboralChange} disabled={!isAdmin} />
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>Documento de Identificación (DPI)</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Número de DPI" name="numeroDocumento" value={dpi.numeroDocumento} onChange={(e) => setDpi({...dpi, numeroDocumento: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Vencimiento DPI" name="fechaVencimientoDpi" type="date" value={dpi.fechaVencimientoDpi} onChange={(e) => setDpi({...dpi, fechaVencimientoDpi: e.target.value})} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Depto. Expedición</InputLabel>
                <Select value={dpi.departamentoExpedicion} onChange={(e) => setDpi({...dpi, departamentoExpedicion: e.target.value, municipioExpedicion: ""})} label="Depto. Expedición">
                  {catalogues.departamentos.map(d => <MenuItem key={d.IdDepartamento} value={d.IdDepartamento}>{d.departamento}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!dpi.departamentoExpedicion}>
                <InputLabel>Muni. Expedición</InputLabel>
                <Select value={dpi.municipioExpedicion} onChange={(e) => setDpi({...dpi, municipioExpedicion: e.target.value})} label="Muni. Expedición">
                  {catalogues.municipios.filter(m => Math.floor(m.idMunicipio / 100) === parseInt(dpi.departamentoExpedicion)).map(m => (
                    <MenuItem key={m.idMunicipio} value={m.idMunicipio}>{m.municipio}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>Nombres y Apellidos</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Primer Nombre" name="primerNombre" value={personal.primerNombre} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Segundo Nombre" name="segundoNombre" value={personal.segundoNombre} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Tercer Nombre" name="tercerNombre" value={personal.tercerNombre} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Primer Apellido" name="primerApellido" value={personal.primerApellido} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Segundo Apellido" name="segundoApellido" value={personal.segundoApellido} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Apellido Casada" name="apellidoCasada" value={personal.apellidoCasada} onChange={handlePersonalChange} />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>Datos de Contacto y Otros</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Género</InputLabel>
                <Select name="genero" value={personal.genero} onChange={handlePersonalChange} label="Género">
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Estado Civil</InputLabel>
                <Select name="estadoCivil" value={personal.estadoCivil} onChange={handlePersonalChange} label="Estado Civil">
                  <MenuItem value="Soltero">Soltero</MenuItem>
                  <MenuItem value="Casado">Casado</MenuItem>
                  <MenuItem value="Divorciado">Divorciado</MenuItem>
                  <MenuItem value="Viudo">Viudo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={personal.fechaNacimiento} onChange={handlePersonalChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Departamento Nac.</InputLabel>
                <Select value={personal.departamentoNacimiento} onChange={handleDepartamentoChange} label="Departamento Nac.">
                  {catalogues.departamentos.map(d => <MenuItem key={d.IdDepartamento} value={d.IdDepartamento}>{d.departamento}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!personal.departamentoNacimiento}>
                <InputLabel>Municipio Nac.</InputLabel>
                <Select name="municipioNacimiento" value={personal.municipioNacimiento} onChange={handlePersonalChange} label="Municipio Nac.">
                  {catalogues.municipiosFiltrados.map(m => <MenuItem key={m.idMunicipio} value={m.idMunicipio}>{m.municipio}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Correo Personal" name="correoPersonal" value={personal.correoPersonal} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Número Celular" name="numeroCelular" value={personal.numeroCelular} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Dirección de Residencia" name="direccionResidencia" value={personal.direccionResidencia} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="NIT" name="nit" value={personal.nit} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="No. Afiliación IGSS" name="numAfiliacionIgss" value={personal.numAfiliacionIgss} onChange={handlePersonalChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="No. Licencia" name="numeroLicencia" value={personal.numeroLicencia} onChange={handlePersonalChange} />
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>Nivel Educativo</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Estudios</InputLabel>
                <Select name="nivelDeEstudios" value={otros.nivelEducativo.nivelDeEstudios} onChange={(e) => handleOtrosChange('nivelEducativo', e)} label="Nivel de Estudios">
                  {catalogues.niveles.map(n => <MenuItem key={n.idNivelEducativo} value={n.nivelEducativo}>{n.nivelEducativo}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Último Nivel Alcanzado" name="ultimoNivelAlcanzado" value={otros.nivelEducativo.ultimoNivelAlcanzado} onChange={(e) => handleOtrosChange('nivelEducativo', e)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Año de Egreso" name="añoUltimoNivelCursado" type="date" value={otros.nivelEducativo.añoUltimoNivelCursado} onChange={(e) => handleOtrosChange('nivelEducativo', e)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Profesión" name="Profesion" value={otros.nivelEducativo.Profesion} onChange={(e) => handleOtrosChange('nivelEducativo', e)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="No. Colegiado" name="numeroColegiado" value={otros.nivelEducativo.numeroColegiado} onChange={(e) => handleOtrosChange('nivelEducativo', e)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Fecha Colegiación" name="fechaColegiacion" type="date" value={otros.nivelEducativo.fechaColegiacion} onChange={(e) => handleOtrosChange('nivelEducativo', e)} InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>Pertenencia Sociolingüística</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Etnia</InputLabel>
                <Select name="etnia" value={otros.pertenenciaSociolinguistica.etnia} onChange={(e) => handleOtrosChange('pertenenciaSociolinguistica', e)} label="Etnia">
                  {catalogues.etnias.map(e => <MenuItem key={e.idPuebloPerteneciente} value={e.pueblo}>{e.pueblo}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Comunidad Lingüística</InputLabel>
                <Select name="comunidadLinguistica" value={otros.pertenenciaSociolinguistica.comunidadLinguistica} onChange={(e) => handleOtrosChange('pertenenciaSociolinguistica', e)} label="Comunidad Lingüística">
                  {catalogues.comunidades.map(c => <MenuItem key={c.idComunidadLinguistica} value={c.tipoComunidad}>{c.tipoComunidad}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>Datos Médicos</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Sangre</InputLabel>
                <Select name="tipoSangre" value={otros.datosMedicos.tipoSangre} onChange={(e) => handleOtrosChange('datosMedicos', e)} label="Tipo de Sangre">
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>¿Discapacidad?</InputLabel>
                <Select name="discapacidad" value={otros.datosMedicos.discapacidad} onChange={(e) => handleOtrosChange('datosMedicos', e)} label="¿Discapacidad?">
                  <MenuItem value="Sí">Sí</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              {otros.datosMedicos.discapacidad === "Sí" && (
                <FormControl fullWidth>
                  <InputLabel>Tipo Discapacidad</InputLabel>
                  <Select name="tipoDiscapacidad" value={otros.datosMedicos.tipoDiscapacidad} onChange={(e) => handleOtrosChange('datosMedicos', e)} label="Tipo Discapacidad">
                    {catalogues.discapacidades.map(d => <MenuItem key={d.idDiscapacidad} value={d.tipoDiscapacidad}>{d.tipoDiscapacidad}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>¿Toma Medicina?</InputLabel>
                <Select name="tomaMedicina" value={otros.datosMedicos.tomaMedicina} onChange={(e) => handleOtrosChange('datosMedicos', e)} label="¿Toma Medicina?">
                  <MenuItem value="Sí">Sí</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              {otros.datosMedicos.tomaMedicina === "Sí" && (
                <TextField fullWidth label="Nombre Medicamento" name="nombreMedicamento" value={otros.datosMedicos.nombreMedicamento} onChange={(e) => handleOtrosChange('datosMedicos', e)} />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Condición Médica" name="condicionMedica" value={otros.datosMedicos.condicionMedica} onChange={(e) => handleOtrosChange('datosMedicos', e)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Alergias" name="sufreAlergia" value={otros.datosMedicos.sufreAlergia} onChange={(e) => handleOtrosChange('datosMedicos', e)} />
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ color: "primary.main", mb: 2 }}>Familiares Registrados</Typography>
            {familiares.length === 0 ? (
              <Typography color="text.secondary" sx={{ mb: 3 }}>No hay familiares registrados. El empleado puede agregarlos desde su perfil en la sección "Familiares".</Typography>
            ) : (
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {familiares.map((f, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2" color="primary">Nombre:</Typography>
                          <Typography variant="body1">{f.nombreFamiliar}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle2" color="primary">Parentesco:</Typography>
                          <Typography variant="body1">{f.parentesco}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle2" color="primary">Teléfono:</Typography>
                          <Typography variant="body1">{f.telefono}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography variant="subtitle2" color="primary">Nacimiento:</Typography>
                          <Typography variant="body1">{f.fechaNacimiento ? new Date(f.fechaNacimiento).toLocaleDateString() : "—"}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {isAdmin && (
              <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Agregar Nuevo Familiar</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth size="small" label="Nombre Completo" value={newFamiliar.nombreFamiliar} onChange={(e) => setNewFamiliar({...newFamiliar, nombreFamiliar: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Parentesco</InputLabel>
                      <Select value={newFamiliar.parentesco} label="Parentesco" onChange={(e) => setNewFamiliar({...newFamiliar, parentesco: e.target.value})}>
                        {catalogues.parentescos.map((p) => <MenuItem key={p.idParentesco} value={p.parentesco}>{p.parentesco}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField fullWidth size="small" label="Teléfono" value={newFamiliar.telefono} onChange={(e) => setNewFamiliar({...newFamiliar, telefono: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField fullWidth size="small" label="Nacimiento" type="date" value={newFamiliar.fechaNacimiento} onChange={(e) => setNewFamiliar({...newFamiliar, fechaNacimiento: e.target.value})} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button variant="contained" fullWidth onClick={handleAddFamiliar} disabled={addingFamiliar || !newFamiliar.nombreFamiliar || !newFamiliar.parentesco}>
                      {addingFamiliar ? "Guardando..." : "Agregar"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {!isEmbedded && (
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={loading}
            sx={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)" }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
          </Button>
        </DialogActions>
      )}

      {isEmbedded && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSave} 
            disabled={loading}
            sx={{ px: 6, py: 1.5, background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Actualizar Mi Expediente"}
          </Button>
        </Box>
      )}
    </Box>
  );

  if (isEmbedded) return renderContent();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: 1, borderColor: "divider" }}>
        Editar Perfil de Empleado - {employeeData?.personal?.idEmpleado || employeeData?.laboral?.idEmpleado || employeeData?.idEmpleado || employeeData?.idInfoPersonal}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default EditEmpleadoModal;
