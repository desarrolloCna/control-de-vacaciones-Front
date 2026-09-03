import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import api from "../../../config/api";
import { Container, Button, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { PageHeader } from "../../../components/UI/UIComponents";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { API_URL } from "../../../config/enviroment";
import { exportToExcel } from "../../../services/utils/exportToExcelUtils";
import { exportResumenAnual } from "../../../services/utils/exportResumenAnualExcelUtils";
import EditEmpleadoModal from "../../../components/EmpleadosPage/EditEmpleadoModal/EditEmpleadoModal";
import EditIcon from "@mui/icons-material/Edit";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";
import { Menu, IconButton } from "@mui/material";
import ModalSucesionPuesto from "./ModalSucesionPuesto";
import ModalBajaEmpleado from "./ModalBajaEmpleado";

export const ReporteEmpleado = () => {
  const isSessionVerified = useCheckSession();

  const [empleados, setEmpleados] = useState([]);
  const [allEmpleados, setAllEmpleados] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("Todas");
  const [selectedRenglon, setSelectedRenglon] = useState("Todos");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [fetchingEmp, setFetchingEmp] = useState(false);
  
  // States for Modals and Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [openSucesion, setOpenSucesion] = useState(false);
  const [openBaja, setOpenBaja] = useState(false);

  const endpoint = `${API_URL}/employeesList`;

  const getData = async () => {
    try {
      const response = await api.get(`/employeesList`);
      const data = response.data?.responseData?.emplloyeesList || [];
      setAllEmpleados(data);
      setEmpleados(data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const getUnidades = async () => {
    try {
      const response = await api.get(`/unidades`);
      const data = response.data.departamentos.filter((u) => u.estado === "A");
      setUnidades(data);
    } catch (error) {
      console.log("Error al obtener las unidades", error);
    }
  };

  useEffect(() => {
    getData();
    getUnidades();
  }, []);

  const handleEditClick = async (idInfoPersonal) => {
    setFetchingEmp(true);
    try {
      const fullData = await getFullEmployeeData(idInfoPersonal);
      setSelectedEmp(fullData);
      setOpenEdit(true);
    } catch (error) {
      alert("Error al obtener los datos del empleado");
    } finally {
      setFetchingEmp(false);
    }
  };

  useEffect(() => {
    let filtered = allEmpleados;
    if (selectedUnidad !== "Todas") {
      filtered = filtered.filter(emp => emp.unidad === selectedUnidad);
    }
    if (selectedRenglon !== "Todos") {
      filtered = filtered.filter(emp => emp.renglon === selectedRenglon);
    }
    setEmpleados(filtered);
  }, [selectedUnidad, selectedRenglon, allEmpleados]);

  const handleExportExcel = () => {
    if (empleados.length === 0) return;
    const dataToExport = empleados.map(emp => ({
      "Código": emp.idEmpleado,
      "CUI": emp.numeroDocumento,
      "Nombres y Apellidos": emp.Nombres,
      "Celular": emp.celular || "",
      "E-mail": emp.correo || "",
      "Puesto": emp.puesto || "",
      "Unidad": emp.unidad || "",
      "Renglón": emp.renglon || "",
      "Tipo Contrato": emp.tipoContrato || "",
      "Fecha Ingreso": emp.fechaIngresoLabores || "",
    }));
    exportToExcel(dataToExport, `Informe_Empleados_${selectedUnidad}`, "Empleados", `Informe de Empleados - Unidad: ${selectedUnidad === "Todas" ? "Todas las Unidades" : selectedUnidad}`);
  };

  const handleExportResumenAnual = async () => {
    try {
      const response = await api.get(`/employeesList/resumen-anual-011-022`);
      let data = response.data?.resumen || [];
      
      // Filtrar por la unidad seleccionada en pantalla
      if (selectedUnidad !== "Todas") {
        data = data.filter(emp => emp.unidad === selectedUnidad);
      }

      // Filtrar por el renglón seleccionado en pantalla
      if (selectedRenglon !== "Todos") {
        data = data.filter(emp => emp.renglon === selectedRenglon);
      }

      if (data.length === 0) {
        alert("No hay datos de vacaciones para los filtros seleccionados.");
        return;
      }
      exportResumenAnual(data);
    } catch (error) {
      console.error("Error al exportar resumen anual", error);
      alert("Error al exportar resumen anual");
    }
  };

  const headerStyle = {
    background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
    color: "#FFF",
    textAlign: "center",
    padding: "12px 8px",
    borderLeft: "1px solid rgba(255,255,255,0.2)",
    borderRight: "1px solid rgba(255,255,255,0.2)"
  };

  const columns = [
    {
      name: "idEmpleado", label: "Código",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center", fontWeight: 600 } })
      }
    },
    {
      name: "numeroDocumento", label: "CUI",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center" } })
      }
    },
    {
      name: "Nombres", label: "Nombres y Apellidos",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "left" } })
      }
    },
    {
      name: "celular", label: "Celular",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center" } })
      }
    },
    {
      name: "correo", label: "E-mail",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center" } })
      }
    },
    {
      name: "puesto", label: "Puesto",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center" } })
      }
    },
    {
      name: "unidad", label: "Unidad",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center" } })
      }
    },
    {
      name: "fechaIngresoLabores", label: "Fecha Ingreso",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center" } })
      }
    },
    {
      name: "idInfoPersonal", label: "Acciones",
      options: {
        customHeadRender: (cm) => <th key={cm.index} style={headerStyle}>{cm.label}</th>,
        setCellProps: () => ({ style: { textAlign: "center" } }),
        customBodyRender: (value, tableMeta) => {
          // Find full employee data based on idInfoPersonal
          const empData = empleados.find(e => e.idInfoPersonal === value) || {};
          return (
            <IconButton 
              size="small" 
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setSelectedRowData(empData);
              }}
              disabled={fetchingEmp}
            >
              <MoreVertIcon />
            </IconButton>
          );
        }
      }
    }
  ];

  const options = {
    filterType: "checkbox",
    responsive: "standard",
    setRowProps: (row, dataIndex) => ({
      style: { backgroundColor: dataIndex % 2 === 0 ? "#f5f5f5" : "#ffffff" }
    }),
    download: false,
    selectableRows: "none",
    textLabels: {
      body: { noMatch: "No se encontraron empleados.", toolTip: "Ordenar", columnHeaderTooltip: (column) => `Ordenar por ${column.label}` },
      pagination: { next: "Siguiente página", previous: "Página anterior", rowsPerPage: "Filas por página:", displayRows: "de" },
      toolbar: { search: "Buscar", downloadCsv: "Descargar CSV", print: "Imprimir", viewColumns: "Ver columnas", filterTable: "Filtrar tabla" },
      filter: { all: "Todos", title: "Filtros", reset: "Restablecer" },
      viewColumns: { title: "Mostrar columnas", titleAria: "Mostrar/ocultar columnas" },
      selectedRows: { text: "fila(s) seleccionada(s)", delete: "Eliminar", deleteAria: "Eliminar filas seleccionadas" }
    },
    customToolbar: () => (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="renglon-emp-label">Filtrar por Renglón</InputLabel>
          <Select
            labelId="renglon-emp-label"
            value={selectedRenglon}
            label="Filtrar por Renglón"
            onChange={(e) => setSelectedRenglon(e.target.value)}
          >
            <MenuItem value="Todos"><strong>📋 Todos los Renglones</strong></MenuItem>
            <MenuItem value="011">011</MenuItem>
            <MenuItem value="021">021</MenuItem>
            <MenuItem value="022">022</MenuItem>
            <MenuItem value="029">029</MenuItem>
            <MenuItem value="031">031</MenuItem>
            <MenuItem value="Sub-018">Sub-018</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel id="unidad-emp-label">Filtrar por Unidad</InputLabel>
          <Select
            labelId="unidad-emp-label"
            value={selectedUnidad}
            label="Filtrar por Unidad"
            onChange={(e) => setSelectedUnidad(e.target.value)}
          >
            <MenuItem value="Todas"><strong>📋 Todas las Unidades</strong></MenuItem>
            {unidades.map((u) => (
              <MenuItem key={u.idUnidad} value={u.nombreUnidad}>
                {u.nombreUnidad}
              </MenuItem>
            ))}
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
        title="Informe de Empleados" 
        subtitle={`Listado general — ${selectedUnidad}`} 
      />
      
      <Box sx={{ p: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              sx={{ 
                backgroundColor: "#1A237E", 
                color: "#fff", 
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: 600,
                '&:hover': { backgroundColor: "#0D47A1" }
              }}
              onClick={handleExportExcel}
            >
              Exportar a Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              sx={{ 
                backgroundColor: "#00acc1", 
                color: "#fff", 
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: 600,
                '&:hover': { backgroundColor: "#00838f" }
              }}
              onClick={handleExportResumenAnual}
            >
              Resumen Anual (011/022)
            </Button>
          </Box>
          <Box sx={{ pb: 6 }}>
            <MUIDataTable title="Directorio de Empleados" data={empleados} columns={columns} options={options} />
          </Box>

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => {
              setAnchorEl(null);
              setOpenEdit(true);
            }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar Datos
            </MenuItem>
            <MenuItem onClick={() => {
              setAnchorEl(null);
              setOpenSucesion(true);
            }}>
              Cambiar Puesto
            </MenuItem>
            <MenuItem onClick={() => {
              setAnchorEl(null);
              setOpenBaja(true);
            }} sx={{ color: 'error.main' }}>
              Dar de Baja
            </MenuItem>
          </Menu>

          <EditEmpleadoModal
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            employeeData={selectedRowData}
            onSaveSuccess={getData}
          />
          
          {openSucesion && selectedRowData && (
            <ModalSucesionPuesto
              open={openSucesion}
              onClose={() => setOpenSucesion(false)}
              empleado={selectedRowData}
              onSuccess={() => getData()}
            />
          )}
          
          {openBaja && selectedRowData && (
            <ModalBajaEmpleado
              open={openBaja}
              onClose={() => setOpenBaja(false)}
              empleado={selectedRowData}
              onSuccess={() => getData()}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
};
