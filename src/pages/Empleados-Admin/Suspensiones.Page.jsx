import React, { useState, useEffect } from "react";
import { useCheckSession } from "../../services/session/checkSession";
import { useErrorAlert } from "../../hooks/LoginHooks/useErrorAlert";
import Spinner from "../../components/spinners/spinner";
import { useGetSuspensiones } from "../../hooks/Suspensiones/useGetSuspensiones";
import {
  formatDateSetCalendar,
  formatDateToDisplay,
} from "../../services/utils/dates/vacationUtils";
import ErrorAlert from "../../components/ErrorAlert/ErrorAlert";
import {
  Grid,
  TextField,
  Pagination,
  Box,
  Tabs,
  Tab,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ingresarSuspension } from "../../services/EmpleadosServices/Suspensiones/Suspensiones.service";
import api from "../../config/api";
import { PageHeader } from "../../components/UI/UIComponents";
import NotificationSnackbar from "../../components/UI/NotificationSnackbar";

const SuspensionesPage = () => {
  const isSessionVerified = useCheckSession();
  const { suspensiones, error, loading, refetch } = useGetSuspensiones();
  const { alertVisible } = useErrorAlert(error);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Tabs: 0 = Suspensiones, 1 = Bajas
  const [activeTab, setActiveTab] = useState(0);

  // Filtro por unidad
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("Todas");

  // Lista de empleados para búsqueda por DPI
  const [empleadosList, setEmpleadosList] = useState([]);
  const [dpiFound, setDpiFound] = useState(false);

  // Estado para manejar los datos del formulario
  const [formData, setFormData] = useState({
    id: null,
    idEmpleado: null,
    nombreEmpleado: "",
    dpi: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
    tipoSuspension: "suspension",
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar unidades y empleados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unidadesRes, empleadosRes] = await Promise.all([
          api.get("/unidades"),
          api.get("/employeesList"),
        ]);
        const unidadesData = unidadesRes.data.departamentos.filter((u) => u.estado === "A");
        setUnidades(unidadesData);
        setEmpleadosList(empleadosRes.data.responseData.emplloyeesList || []);
      } catch (err) {
        console.log("Error al obtener datos:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    // Buscar empleado por DPI cuando cambia el campo
    if (name === "dpi") {
      const empleado = empleadosList.find(
        (emp) => emp.numeroDocumento === value.trim()
      );
      if (empleado) {
        updated.nombreEmpleado = empleado.Nombres;
        updated.idEmpleado = empleado.idEmpleado;
        setDpiFound(true);
      } else {
        updated.nombreEmpleado = "";
        updated.idEmpleado = null;
        setDpiFound(false);
      }
    }

    setFormData(updated);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    const payload = {
      idEmpleado: formData.idEmpleado || null,
      CUI: formData.dpi,
      nombreEmpleado: formData.nombreEmpleado,
      fechaInicioSuspension: formData.fechaInicio,
      fechaFinSuspension: formData.tipoSuspension === "baja" ? null : formData.fechaFin,
      descripcionSuspension: formData.descripcion,
      tipoSuspension: formData.tipoSuspension,
      idUsuarioSession: userData.idUsuario || userData.idEmpleado,
      usuarioSession: userData.usuario || "desconocido",
    };

    try {
      const response = await ingresarSuspension(payload);
      if (response && response.status === 200) {
        // Registro en Bitácora
        try {
          await api.post("/registrarBitacora", {
            idUsuario: userData.idUsuario || userData.idEmpleado,
            usuario: userData.usuario || "desconocido",
            accion: "INSERT",
            tabla: "suspensiones",
            idRegistro: formData.idEmpleado,
            datosAnteriores: null,
            datosNuevos: payload,
            descripcion: payload.tipoSuspension === "baja" 
              ? `Registro de baja para el empleado ${formData.nombreEmpleado} (DPI: ${formData.dpi})`
              : `Registro de suspensión para el empleado ${formData.nombreEmpleado} (DPI: ${formData.dpi})`
          });
        } catch (bitErr) {
          console.warn("Error al registrar bitácora:", bitErr);
        }

        setFormData({
          id: null,
          idEmpleado: null,
          nombreEmpleado: "",
          dpi: "",
          fechaInicio: "",
          fechaFin: "",
          descripcion: "",
          tipoSuspension: "suspension",
        });
        setShowModal(false);
        setIsEditing(false);
        setSuccessMessage(
          formData.tipoSuspension === "baja"
            ? "Baja registrada correctamente. El empleado ya no podrá iniciar sesión."
            : "Suspensión ingresada correctamente."
        );
        setSuccessOpen(true);
        await refetch();
      }
    } catch (error) {
      console.error("Error al registrar:", error.message);
    }
  };

  // Filtrar por tab (tipo) + búsqueda + unidad
  const tipoFiltro = activeTab === 0 ? "suspension" : "baja";

  const filteredSuspensiones = suspensiones.filter((s) => {
    const tipo = (s.tipoSuspension || "suspension").toLowerCase();
    const matchTipo = tipo === tipoFiltro;
    const matchSearch =
      (s.nombreEmpleado || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.CUI || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTipo && matchSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuspensiones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSuspensiones.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const countSuspensiones = suspensiones.filter(s => (s.tipoSuspension || "suspension") === "suspension").length;
  const countBajas = suspensiones.filter(s => (s.tipoSuspension || "suspension") === "baja").length;

  if (!isSessionVerified || loading) {
    return <Spinner />;
  }

  return (
    <Box className="fade-in">
      <PageHeader 
        title="Gestión de Personal" 
        subtitle="Administración de suspensiones temporales y bajas institucionales" 
      />
      
      <Box sx={{ p: 3 }}>
        <div className="container">

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newVal) => { setActiveTab(newVal); setCurrentPage(1); }}
              sx={{
                "& .MuiTab-root": { fontWeight: 600, fontSize: "1rem" },
                "& .Mui-selected": { color: activeTab === 0 ? "#f57c00" : "#e53935" },
                "& .MuiTabs-indicator": { backgroundColor: activeTab === 0 ? "#f57c00" : "#e53935" },
              }}
            >
              <Tab label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  ⏸️ Suspensiones
                  <Chip label={countSuspensiones} size="small" sx={{ backgroundColor: "#f57c00", color: "#fff", fontWeight: 700 }} />
                </Box>
              } />
              <Tab label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  🚫 Bajas
                  <Chip label={countBajas} size="small" sx={{ backgroundColor: "#e53935", color: "#fff", fontWeight: 700 }} />
                </Box>
              } />
            </Tabs>
          </Box>

          {/* Búsqueda */}
          <TextField
            label="Buscar por Nombre o CUI"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {/* Botón para abrir el modal */}
          <button
            className="btn d-flex align-items-center"
            style={{
              backgroundColor: activeTab === 0 ? "#f57c00" : "#e53935",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
              padding: "8px 16px",
            }}
            onClick={() => {
              setFormData({
                id: null,
                idEmpleado: null,
                nombreEmpleado: "",
                dpi: "",
                fechaInicio: "",
                fechaFin: "",
                descripcion: "",
                tipoSuspension: activeTab === 0 ? "suspension" : "baja",
              });
              setDpiFound(false);
              setShowModal(true);
              setIsEditing(false);
            }}
          >
            <span className="me-2">
              {activeTab === 0 ? "Suspender empleado" : "Registrar Baja"}
            </span>
            <i className="fa fa-plus"></i>
          </button>

          {/* Tabla */}
          <div className="mt-4">
            <table className="table table-bordered table-hover">
              <thead style={{
                background: activeTab === 0
                  ? "linear-gradient(90deg, #e65100, #f57c00)"
                  : "linear-gradient(90deg, #b71c1c, #e53935)",
                color: "#fff"
              }}>
                <tr>
                  <th style={{ color: "#fff" }}>Nº</th>
                  <th style={{ color: "#fff" }}>Empleado</th>
                  <th style={{ color: "#fff" }}>DPI</th>
                  <th style={{ color: "#fff" }}>Fecha Inicio</th>
                  {activeTab === 0 && <th style={{ color: "#fff" }}>Fecha Fin</th>}
                  <th style={{ color: "#fff" }}>Descripción</th>
                  <th style={{ color: "#fff" }}>Tipo</th>
                </tr>
              </thead>
              {!error || filteredSuspensiones.length > 0 ? (
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 0 ? 7 : 6} className="text-center" style={{ padding: 24, color: "#888" }}>
                        {activeTab === 0
                          ? "No hay suspensiones registradas."
                          : "No hay bajas registradas."}
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((suspension, index) => (
                      <tr key={suspension.idSuspension}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{suspension.nombreEmpleado}</td>
                        <td>{suspension.CUI}</td>
                        <td>{formatDateToDisplay(suspension.fechaInicioSuspension)}</td>
                        {activeTab === 0 && (
                          <td>{formatDateToDisplay(suspension.fechaFinSuspension)}</td>
                        )}
                        <td>{suspension.descripcionSuspension}</td>
                        <td>
                          <Chip
                            label={
                              (suspension.tipoSuspension || "suspension") === "baja"
                                ? "Baja"
                                : "Suspensión"
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                (suspension.tipoSuspension || "suspension") === "baja"
                                  ? "#e53935"
                                  : "#f57c00",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              ) : (
                <Grid container justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
                  <ErrorAlert message={error} visible={alertVisible} />
                </Grid>
              )}
            </table>

            {/* Paginación */}
            <Pagination
              sx={{ mb: 5 }}
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              className="d-flex justify-content-center mt-3"
            />
          </div>
        </div>
      </Box>

      {/* Notificación de éxito */}
      <NotificationSnackbar
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={successMessage}
        severity="success"
      />

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{
                  background:
                    formData.tipoSuspension === "baja"
                      ? "linear-gradient(90deg, #b71c1c, #e53935)"
                      : "linear-gradient(90deg, #e65100, #f57c00)",
                }}
              >
                <h5 className="modal-title">
                  {formData.tipoSuspension === "baja"
                    ? "🚫 Registrar Baja de la Institución"
                    : "⏸️ Registrar Suspensión Temporal"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {/* Tipo */}
                  <div className="form-group mb-3">
                    <label htmlFor="tipoSuspension" className="fw-bold">Tipo de Acción</label>
                    <select
                      id="tipoSuspension"
                      name="tipoSuspension"
                      className="form-select"
                      value={formData.tipoSuspension}
                      onChange={handleChange}
                    >
                      <option value="suspension">⏸️ Suspensión Temporal</option>
                      <option value="baja">🚫 Baja de la Institución (Despido/Renuncia)</option>
                    </select>
                  </div>

                  {formData.tipoSuspension === "baja" && (
                    <div className="alert alert-danger" role="alert">
                      <strong>⚠️ Advertencia:</strong> Al registrar una baja, el empleado será
                      desactivado del sistema y <strong>no podrá iniciar sesión</strong>. Esta
                      acción también detendrá la acumulación de días de vacaciones.
                    </div>
                  )}

                  {/* DPI */}
                  <div className="form-group mb-3">
                    <label htmlFor="dpi" className="fw-bold">DPI</label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="dpi"
                        name="dpi"
                        className={`form-control ${dpiFound ? 'is-valid' : ''}`}
                        placeholder="Ingrese el DPI del empleado"
                        value={formData.dpi}
                        onChange={handleChange}
                        required
                      />
                      {dpiFound && (
                        <span className="input-group-text bg-success text-white">
                          <i className="fa fa-check"></i>
                        </span>
                      )}
                    </div>
                    {dpiFound && (
                      <small className="text-success fw-bold">
                        Empleado encontrado: {formData.nombreEmpleado}
                      </small>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="form-group mb-3">
                    <label htmlFor="nombreEmpleado" className="fw-bold">Nombre del Empleado</label>
                    <input
                      type="text"
                      id="nombreEmpleado"
                      name="nombreEmpleado"
                      className="form-control bg-light"
                      placeholder={dpiFound ? "" : "Ingrese el nombre completo"}
                      value={formData.nombreEmpleado}
                      onChange={handleChange}
                      readOnly={dpiFound}
                      required
                    />
                    {!dpiFound && formData.dpi.length >= 13 && (
                      <small className="text-danger">
                        No se encontró ningún empleado con este DPI.
                      </small>
                    )}
                  </div>

                  {/* Fecha de inicio */}
                  <div className="form-group mb-3">
                    <label htmlFor="fechaInicio" className="fw-bold">
                      {formData.tipoSuspension === "baja" ? "Fecha de Baja" : "Fecha de Inicio"}
                    </label>
                    <input
                      type="date"
                      id="fechaInicio"
                      name="fechaInicio"
                      className="form-control"
                      value={
                        formData.fechaInicio
                          ? formatDateSetCalendar(formData.fechaInicio)
                          : ""
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Fecha de finalización (solo para suspensiones) */}
                  {formData.tipoSuspension === "suspension" && (
                    <div className="form-group mb-3">
                      <label htmlFor="fechaFin" className="fw-bold">Fecha de Finalización</label>
                      <input
                        type="date"
                        id="fechaFin"
                        name="fechaFin"
                        className="form-control"
                        value={
                          formData.fechaFin
                            ? formatDateSetCalendar(formData.fechaFin)
                            : ""
                        }
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                  {/* Descripción */}
                  <div className="form-group mb-3">
                    <label htmlFor="descripcion" className="fw-bold">
                      {formData.tipoSuspension === "baja" ? "Motivo de la Baja" : "Descripción de la Suspensión"}
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      className="form-control"
                      rows="3"
                      placeholder={
                        formData.tipoSuspension === "baja"
                          ? "Detalle el motivo de la baja"
                          : "Detalle el motivo de la suspensión"
                      }
                      value={formData.descripcion}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  {/* Botón de envío */}
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        backgroundColor:
                          formData.tipoSuspension === "baja" ? "#e53935" : "#f57c00",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    >
                      {formData.tipoSuspension === "baja"
                        ? "Registrar Baja"
                        : "Registrar Suspensión"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default SuspensionesPage;
