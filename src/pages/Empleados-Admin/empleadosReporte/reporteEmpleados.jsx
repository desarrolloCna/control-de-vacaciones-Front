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
import EditEmpleadoModal from "../../../components/EmpleadosPage/EditEmpleadoModal/EditEmpleadoModal";
import EditIcon from "@mui/icons-material/Edit";
import { getFullEmployeeData } from "../../../services/EmpleadosServices/GetFullEmployeeData";

export const ReporteEmpleado = () => {
  const isSessionVerified = useCheckSession();

  const [empleados, setEmpleados] = useState([]);
  const [allEmpleados, setAllEmpleados] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("Todas");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [fetchingEmp, setFetchingEmp] = useState(false);

  const endpoint = `${API_URL}/employeesList`;

  const getData = async () => {
    try {
      const response = await api.get(`/employeesList`);
      const data = response.data.responseData.emplloyeesList;
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
    if (selectedUnidad === "Todas") {
      setEmpleados(allEmpleados);
    } else {
      setEmpleados(allEmpleados.filter(emp => emp.unidad === selectedUnidad));
    }
  }, [selectedUnidad, allEmpleados]);

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
        customBodyRender: (value) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleEditClick(value)}
            disabled={fetchingEmp}
          >
            Editar
          </Button>
        )
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
      <FormControl sx={{ minWidth: 220, mr: 2 }} size="small">
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
            title={`Informe de Empleados — ${selectedUnidad}`}
            data={empleados}
            columns={columns}
            options={options}
          />
        </Container>
      </Box>

      {selectedEmp && (
        <EditEmpleadoModal 
          open={openEdit} 
          onClose={() => {
            setOpenEdit(false);
            setSelectedEmp(null);
          }} 
          employeeData={selectedEmp} 
          onSaveSuccess={() => {
            getData();
            setSelectedEmp(null);
          }}
        />
      )}
    </Box>
  );
};
