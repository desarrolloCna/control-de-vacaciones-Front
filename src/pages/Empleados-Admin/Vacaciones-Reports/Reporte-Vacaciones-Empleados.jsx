import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import api from "../../../config/api";
import { Container, Button, Select, MenuItem, FormControl, InputLabel, Box, Chip } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { PageHeader } from "../../../components/UI/UIComponents";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { API_URL } from "../../../config/enviroment";
import { exportToExcel } from "../../../services/utils/exportToExcelUtils";
import dayjs from "dayjs";


export const ReporteVacacionesEmpleados = () => {
  const isSessionVerified = useCheckSession();

  const [vacacionesList, setVacacionesList] = useState([]);
  const [allVacaciones, setAllVacaciones] = useState([]);
  const [unidad, setUnidad] = useState("Todas");
  const [selectedEstado, setSelectedEstado] = useState("Todos");
  const [unidades, setUnidades] = useState([]);

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
      autorizadas: { label: "Autorizada", color: "#43a047" },
      enviada: { label: "Pendiente", color: "#f57c00" },
      rechazada: { label: "Rechazada", color: "#e53935" },
      finalizadas: { label: "Finalizada", color: "#1e88e5" },
      reprogramada: { label: "Reprogramada", color: "#8e24aa" },
      cancelada: { label: "Reprogramada", color: "#8e24aa" },
    };
    const info = map[(estado || "").toLowerCase()] || { label: estado, color: "#757575" };
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
      "Estado": v.estadoSolicitud,
      "Fecha Autorización": formatDate(v.fechaAutorizacion),
    }));
    const estadoLabel = selectedEstado === "Todos" ? "Todos" : selectedEstado;
    exportToExcel(dataToExport, `Reporte_Vacaciones_${unidad}_${estadoLabel}`, "Vacaciones");
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
            <MenuItem value="autorizadas"><Chip label="Autorizada" sx={{ backgroundColor: '#43a047', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="enviada"><Chip label="Pendiente" sx={{ backgroundColor: '#f57c00', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="rechazada"><Chip label="Rechazada" sx={{ backgroundColor: '#e53935', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="finalizadas"><Chip label="Finalizada" sx={{ backgroundColor: '#1e88e5', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
            <MenuItem value="reprogramada"><Chip label="Reprogramada" sx={{ backgroundColor: '#8e24aa', color: '#fff', fontWeight: 600 }} size="small" /></MenuItem>
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
              backgroundColor: "#2e7d32", 
              color: "#fff", 
              mb: 2, 
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              '&:hover': { backgroundColor: "#1b5e20" }
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
    </Box>
  );
};
