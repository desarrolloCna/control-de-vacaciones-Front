import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import api from "../../../config/api";
import { Container, Button, Select, MenuItem, FormControl, InputLabel, Box, Chip, Modal, Typography, Grid, Tooltip, IconButton } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PageHeader } from "../../../components/UI/UIComponents";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { API_URL } from "../../../config/enviroment";
import { exportToExcel } from "../../../services/utils/exportToExcelUtils";
import { getDiasFestivosOmitidos, getDetalleFestivosOmitidos, formatDateToDisplay, parseRecalculatedDates } from "../../../services/utils/dates/vacationUtils";
import useDiasFestivos from "../../../hooks/DiasFestivos/useDiasFestivos";
import dayjs from "dayjs";


export const ReporteVacacionesEmpleados = () => {
  const isSessionVerified = useCheckSession();

  const [vacacionesList, setVacacionesList] = useState([]);
  const [allVacaciones, setAllVacaciones] = useState([]);
  const [unidad, setUnidad] = useState("Todas");
  const [selectedEstado, setSelectedEstado] = useState("Todos");
  const [unidades, setUnidades] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // Hook para cargar los días festivos
  useDiasFestivos();

  const handleOpenModal = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const baseEndpoint = `${API_URL}/vacacionesReport`;

  const getData = async (unidadSeleccionada) => {
    try {
      const response = await api.get(`/vacacionesReport?unidad=${encodeURIComponent(unidadSeleccionada)}`);
      const data = response.data.reporteVacaciones || [];
      setAllVacaciones(data);
    } catch (error) {
      console.log("Error al obtener los datos", error);
      setAllVacaciones([]);
    }
  };

  const getUnidades = async () => {
    try {
      const response = await api.get(`/unidades`);
      const data = response.data.departamentos.filter((unidad) => unidad.estado === "A");
      setUnidades(data);
    } catch (error) {
      console.log("Error al obtener las unidades", error);
    }
  };

  useEffect(() => {
    getUnidades();
  }, []);

  useEffect(() => {
    getData(unidad);
  }, [unidad]);

  // Filtro local por estado
  useEffect(() => {
    if (selectedEstado === "Todos") {
      setVacacionesList(allVacaciones);
    } else {
      setVacacionesList(allVacaciones.filter(v => 
        (v.estadoSolicitud || "").toLowerCase() === selectedEstado.toLowerCase()
      ));
    }
  }, [selectedEstado, allVacaciones]);

  const formatDate = (value) => {
    if (!value) return "";
    return dayjs(value).format("DD/MM/YYYY");
  };

  const getEstadoChip = (estado) => {
    const map = {
      autorizadas: { label: "Autorizada", color: "#4caf50" },
      enviada: { label: "Pendiente", color: "#ff9800" },
      rechazada: { label: "Rechazada", color: "#f44336" },
      finalizadas: { label: "Finalizada", color: "#2196f3" },
      reprogramada: { label: "Reprogramada", color: "#9c27b0" },
      reprogramacion: { label: "Reprogramada", color: "#9c27b0" },
      cancelada: { label: "Reprogramada", color: "#9c27b0" },
    };
    const info = map[(estado || "").toLowerCase()] || { label: estado, color: "#9e9e9e" };
    return info;
  };

  const handleExportExcel = () => {
    if (vacacionesList.length === 0) return;
    const dataToExport = vacacionesList.map(v => ({
      "Gestión": v.correlativo || ("SLVC-" + v.idSolicitud),
      "Empleado": v.Nombre,
      "Unidad": v.unidadSolicitud,
      "Puesto": v.puesto || "",
      "Renglón": v.renglon || "",
      "Inicio Vacaciones": formatDate(v.fechaInicioVacaciones),
      "Fin Vacaciones": formatDate(v.fechaFinVacaciones),
      "Retorno a Labores": formatDate(v.fechaRetornoLabores),
      "Días Solicitados": v.cantidadDiasSolicitados,
      "Días Festivos Integrados": getDiasFestivosOmitidos(v.fechaInicioVacaciones, v.fechaRetornoLabores),
      "Estado": v.estadoSolicitud,
      "Fecha Autorización": formatDate(v.fechaAutorizacion),
    }));
    const estadoLabel = selectedEstado === "Todos" ? "Todos" : selectedEstado;
    exportToExcel(dataToExport, `Reporte_Vacaciones_${unidad}_${estadoLabel}`, "Vacaciones", `Reporte de Vacaciones - Unidad: ${unidad === "Todas" ? "Todas las Unidades" : unidad} | Estado: ${estadoLabel}`);
  };

  const columns = [
    {
      name: "correlativo",
      label: "Gestión",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center", fontWeight: 600 } }),
        customBodyRender: (value, tableMeta) => value || `SLVC-${tableMeta.rowData[0]}`
      }
    },
    {
      name: "Nombre",
      label: "Empleado",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "left" } })
      }
    },
    {
      name: "unidadSolicitud",
      label: "Unidad",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } })
      }
    },
    {
      name: "fechaInicioVacaciones",
      label: "Inicio",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } }),
        customBodyRender: (value) => formatDate(value)
      }
    },
    {
      name: "fechaFinVacaciones",
      label: "Fin",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } }),
        customBodyRender: (value) => formatDate(value)
      }
    },
    {
      name: "cantidadDiasSolicitados",
      label: "Días",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center", fontWeight: 600 } })
      }
    },
    {
      name: "diasFestivosOmitidos",
      label: "Festivos Integrados",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } }),
        customBodyRender: (value, tableMeta) => {
          const rowData = vacacionesList[tableMeta.rowIndex];
          if (!rowData) return "0";
          return getDiasFestivosOmitidos(rowData.fechaInicioVacaciones, rowData.fechaRetornoLabores);
        }
      }
    },
    {
      name: "estadoSolicitud",
      label: "Estado",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } }),
        customBodyRender: (value) => {
          const info = getEstadoChip(value);
          return <Chip label={info.label} sx={{ backgroundColor: info.color, color: "#fff", fontWeight: 600, minWidth: 100 }} size="small" />;
        }
      }
    },
    {
      name: "acciones",
      label: "Acciones",
      options: {
        customHeadRender: (columnMeta) => (
          <th key={columnMeta.index} style={{ background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)", color: "#FFF", textAlign: "center", padding: "12px 8px", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>{columnMeta.label}</th>
        ),
        setCellProps: () => ({ style: { textAlign: "center" } }),
        customBodyRender: (value, tableMeta) => {
          const rowData = vacacionesList[tableMeta.rowIndex];
          return (
            <Tooltip title="Ver Detalles">
              <IconButton onClick={() => handleOpenModal(rowData)} color="primary">
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          );
        }
      }
    }
  ];

  const options = {
    textLabels: {
      body: { noMatch: "Seleccione una unidad o \"Todas\" para ver el reporte", toolTip: "Ordenar" },
      pagination: { next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", downloadCsv: "Descargar CSV", print: "Imprimir", viewColumns: "Ver Columnas", filterTable: "Filtrar Tabla" },
      filter: { all: "Todo", title: "Filtros", reset: "Reiniciar" },
      viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
      selectedRows: { text: "fila(s) seleccionada(s)", delete: "Eliminar", deleteAria: "Eliminar Filas Seleccionadas" },
    },
    filterType: "checkbox",
    responsive: "standard",
    setRowProps: (row, dataIndex) => ({
      style: { backgroundColor: dataIndex % 2 === 0 ? "#f5f5f5" : "#ffffff" }
    }),
    download: false,
    selectableRows: "none",
    customToolbar: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="unidad-select-label">Filtrar por Unidad</InputLabel>
          <Select
            labelId="unidad-select-label"
            value={unidad}
            label="Filtrar por Unidad"
            onChange={(e) => setUnidad(e.target.value)}
          >
            <MenuItem value="Todas"><strong>📋 Todas las Unidades</strong></MenuItem>
            {unidades.map((u) => (
              <MenuItem key={u.idUnidad} value={u.nombreUnidad}>
                {u.nombreUnidad}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="estado-select-label">Filtrar por Estado</InputLabel>
          <Select
            labelId="estado-select-label"
            value={selectedEstado}
            label="Filtrar por Estado"
            onChange={(e) => setSelectedEstado(e.target.value)}
          >
            <MenuItem value="Todos"><strong>📊 Todos los Estados</strong></MenuItem>
            <MenuItem value="autorizadas"><Chip label="Autorizada" sx={{ backgroundColor: '#4caf50', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="enviada"><Chip label="Pendiente" sx={{ backgroundColor: '#ff9800', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="rechazada"><Chip label="Rechazada" sx={{ backgroundColor: '#f44336', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="finalizadas"><Chip label="Finalizada" sx={{ backgroundColor: '#2196f3', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="reprogramacion"><Chip label="Reprogramada" sx={{ backgroundColor: '#9c27b0', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
          </Select>
        </FormControl>
      </Box>
    )
  };

  if (!isSessionVerified) {
    return <Spinner />;
  }
  
  return (
    <Box className="fade-in">
      <PageHeader 
        title="Reporte de Vacaciones" 
        subtitle={`Gestión institucional — ${unidad} | Estado: ${selectedEstado}`} 
      />
      
      <Box sx={{ p: 3 }}>
        <Container maxWidth="xl">
          <Button
            variant="contained"
            startIcon={<GetAppIcon />}
            sx={{ 
              backgroundColor: "#1A237E", 
              color: "#fff", 
              mb: 2, 
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: 600,
              '&:hover': { backgroundColor: "#0D47A1" }
            }}
            onClick={handleExportExcel}
          >
            Exportar a Excel
          </Button>
          <MUIDataTable
            title={`Reporte de Vacaciones — ${unidad} | Estado: ${selectedEstado}`}
            data={vacacionesList}
            columns={columns}
            options={options}
          />
        </Container>
      </Box>

      {/* Modal de detalles */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90vw",
            maxWidth: "700px",
            maxHeight: "90vh",
            bgcolor: "white",
            borderRadius: "16px",
            p: 4,
            boxShadow: 24,
            overflow: "auto",
            outline: "none",
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ 
              position: "absolute", 
              top: 16, 
              right: 16, 
              color: "#5f6368",
              backgroundColor: '#f8f9fa',
              '&:hover': { backgroundColor: '#e8eaed' }
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <InfoIcon sx={{ color: "#1a73e8", fontSize: 50 }} />
          </Box>

          {selectedSolicitud && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography id="modal-title" variant="h5" sx={{ fontWeight: 800, color: "#2c3e50" }}>
                  📋 Detalles de la Solicitud
                </Typography>
                {getDiasFestivosOmitidos(selectedSolicitud.fechaInicioVacaciones, selectedSolicitud.fechaRetornoLabores) > 0 ? (
                  <Tooltip
                    title={
                      <Box sx={{ p: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Días Festivos Cruzados:</Typography>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {getDetalleFestivosOmitidos(selectedSolicitud.fechaInicioVacaciones, selectedSolicitud.fechaRetornoLabores).map((f, i) => (
                            <li key={i}>{f.nombreDiaFestivo} ({formatDateToDisplay(f.fechaDiaFestivo)})</li>
                          ))}
                        </ul>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Chip
                      icon={<EventAvailableIcon />}
                      label={`${getDiasFestivosOmitidos(selectedSolicitud.fechaInicioVacaciones, selectedSolicitud.fechaRetornoLabores)} Días Festivos Integrados`}
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: "bold", backgroundColor: "#e8f5e9", cursor: 'help' }}
                    />
                  </Tooltip>
                ) : (
                  <Chip
                    label="0 Días Festivos Integrados"
                    color="default"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  />
                )}
              </Box>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', 
                    p: 2,
                    borderLeft: '4px solid #1a73e8'
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Gestión
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {selectedSolicitud.correlativo || ("SLVC-" + selectedSolicitud.idSolicitud)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', 
                    p: 2,
                    borderLeft: '4px solid #34A853'
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Empleado
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {selectedSolicitud.Nombre}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', 
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PlayCircleOutlineIcon sx={{ color: '#4caf50', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        INICIO DE VACACIONES
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="500">
                      {formatDateToDisplay(selectedSolicitud.fechaInicioVacaciones)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', 
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <StopCircleIcon sx={{ color: '#f57c00', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        FIN DE VACACIONES
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="500">
                      {formatDateToDisplay(selectedSolicitud.fechaFinVacaciones)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', 
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AssignmentReturnIcon sx={{ color: '#1976d2', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        REINTEGRO LABORAL
                      </Typography>
                    </Box>
                    {selectedSolicitud && parseRecalculatedDates(selectedSolicitud.observaciones_rrhh) ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: "medium", color: "#9e9e9e", textDecoration: 'line-through' }}>
                          {parseRecalculatedDates(selectedSolicitud.observaciones_rrhh).oldDate}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#d32f2f" }}>
                          ➔ {parseRecalculatedDates(selectedSolicitud.observaciones_rrhh).newDate}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" fontWeight="500">
                        {formatDateToDisplay(selectedSolicitud.fechaRetornoLabores)}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', 
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DescriptionIcon sx={{ color: '#9c27b0', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        DÍAS SOLICITADOS
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="500">
                      {selectedSolicitud.cantidadDiasSolicitados} días
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleCloseModal} 
                  sx={{ 
                    borderRadius: '24px',
                    px: 4,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Cerrar Detalles
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ReporteVacacionesEmpleados;
