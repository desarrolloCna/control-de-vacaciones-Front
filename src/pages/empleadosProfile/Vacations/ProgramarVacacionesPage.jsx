import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import Spinner from "../../../components/spinners/spinner";
import dayjs from "dayjs";
import { useCheckSession } from "../../../services/session/checkSession";
import {
  calcularFechaFin,
  calcularProximaFechaLaboral,
  esDiaLaboral,
} from "../../../services/utils/dates/vacationUtils.js";
import useDiasFestivos from "../../../hooks/DiasFestivos/useDiasFestivos.js";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData.js";
import { ingresarSolicitudService } from "../../../services/VacationApp/InresarSolicitud.service.js";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";
import { useNavigate } from "react-router-dom";
import Slide from "@mui/material/Slide";
import { useSolicitudById } from "../../../hooks/VacationAppHooks/useSolicitudById.js";
import { useGetCoordinadoresList } from "../../../hooks/Coordinadores/useGetCoordinadoresList.js";

const ProgramarVacacionesPage = () => {
  const isSessionVerified = useCheckSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [diasVacaciones, setDiasVacaciones] = useState("0");
  const [endDate, setEndDate] = useState("");
  const [nextWorkDate, setNextWorkDate] = useState("");
  const [unidad, setUnidad] = useState("");
  const [selectedCoordinador, setSelectedCoordinador] = useState("");
  const [idEmpleado, setIdEmpleado] = useState("");
  const [idInfoPersonal, setIdInfoPersonal] = useState("");
  const [diasHabilitado, setDiasHabilitado] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLeyOpen, setModalLeyOpen] = useState(false);
  const navigate = useNavigate();

  const { solicitud, diasValidos, errorS, loadingS } = useSolicitudById();
  const { coordinadoresList, errorCoordinadoresList, loadingCoordinadoresList } = useGetCoordinadoresList();

  const { isLoading, errorDF } = useDiasFestivos();
  const minStartDate = dayjs().add(7, "day").format("YYYY-MM-DD");
  const lastStartDate = dayjs()
    .endOf("year")
    .subtract(30, "day")
    .format("YYYY-MM-DD");

  const formatDateToDisplay = (date) => dayjs(date).format("DD/MM/YYYY");

  useEffect(() => {
    const userData = getLocalStorageData();
    if (userData?.unidad) {
      setUnidad(userData.unidad);
      setIdEmpleado(userData.idEmpleado);
      setIdInfoPersonal(userData.idInfoPersonal);
    }
    // Verifica si hay una solicitud en proceso al cargar
    if (solicitud && (solicitud.estadoSolicitud == "enviada" || solicitud.estadoSolicitud == "autorizadas") ) {
      setModalOpen(true);
    }
  }, [solicitud]);

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    if (!esDiaLaboral(selectedDate)) {
      alert("Por favor selecciona solo días hábiles (Lunes a Viernes).");
      setStartDate("");
      setDiasHabilitado(false);
      return;
    }
    setStartDate(selectedDate);
    setDiasVacaciones("");
    setDiasHabilitado(true);
    setEndDate("");
    setNextWorkDate("");
  };

  const handleDiasVacacionesChange = (e) => {
    const dias = parseInt(e.target.value, 10) || 0;
    setDiasVacaciones(dias);

    if (dias > 20) {
      alert("Solo puedes programar un máximo de 20 días.");
      setDiasVacaciones("");
      setEndDate("");
      setNextWorkDate("");
      return;
    }

    if (startDate && dias > 0) {
      const fechaFin = calcularFechaFin(startDate, dias);
      setEndDate(fechaFin.format("YYYY-MM-DD"));

      const proximaFechaLaboral = calcularProximaFechaLaboral(fechaFin);
      setNextWorkDate(proximaFechaLaboral.format("YYYY-MM-DD"));
    }
  };

  const handleCoordinadorChange = (e) => {
    const coordinadorId = e.target.value;
    const coordinadorSeleccionado = coordinadoresList.find(c => c.idCoordinador === coordinadorId);
    
    if (coordinadorSeleccionado) {
      setSelectedCoordinador(coordinadorId);
      setUnidad(coordinadorSeleccionado.coordinadorUnidad);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      idEmpleado,
      idInfoPersonal,
      unidadSolicitud: unidad,
      fechaInicioVacaciones: startDate,
      fechaFinVacaciones: endDate,
      fechaRetornoLabores: nextWorkDate,
      cantidadDiasSolicitados: diasVacaciones,
    };

    try {
      setDiasHabilitado(false);
      const res = await ingresarSolicitudService(payload);
      setSuccessOpen(true);
      setTimeout(() => {
        navigate("/empleados/programar-vacaciones");
      }, 1000);
    } catch (error) {
      setError(
        error.response
          ? "Error en la solicitud. Inténtalo de nuevo."
          : "Hubo un problema con el servicio. Intenta más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    navigate("/empleados/programar-vacaciones");
  };

  if (!isSessionVerified || !isLoading || loadingS || loadingCoordinadoresList) {
    return <Spinner />;
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f1f3f4" }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        sx={{ mr: 2, display: { md: "none" } }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{
          width: { xs: mobileOpen ? "240px" : 0, md: "240px" },
          flexShrink: { md: 0 },
          overflowY: "auto",
          transition: "width 0.3s",
          borderRight: { md: "1px solid #ddd" },
          position: { xs: "absolute", md: "relative" },
          zIndex: 1200,
        }}
      >
        <Sidebar mobileOpen={mobileOpen} />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: "0px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontFamily: "'Roboto', 'cursive', sans-serif",
            color: "#054c95",
            fontWeight: "bold",
            mt: 10,
          }}
        >
          Programa tus vacaciones
        </Typography>

        <Box sx={{ height: 30, mb: 3 }}>
          {(error || (errorS && errorS !== "NO EXISTE SOLICITUDES") || errorCoordinadoresList) && (
            <ErrorAlert message={error || errorCoordinadoresList} visible={true} />
          )}
        </Box>

        <Paper
          component="form"
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: "500px",
            borderRadius: "8px",
            mb: 15,
          }}
          onSubmit={handleSubmit}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Fecha de inicio"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={handleStartDateChange}
                inputProps={{ min: minStartDate, max: lastStartDate}}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Cantidad de días"
                type="number"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={diasVacaciones}
                onChange={handleDiasVacacionesChange}
                inputProps={{ min: 1 }}
                disabled={!diasHabilitado}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Fecha de fin"
                fullWidth
                value={endDate ? formatDateToDisplay(endDate) : ""}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
                disabled={!diasHabilitado}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Fecha de reintegro"
                fullWidth
                value={nextWorkDate ? formatDateToDisplay(nextWorkDate) : ""}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
                disabled={!diasHabilitado}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="coordinador-label">Coordinador</InputLabel>
                <Select
                  labelId="coordinador-label"
                  id="coordinador-select"
                  value={selectedCoordinador}
                  label="Coordinador"
                  onChange={handleCoordinadorChange}
                  required
                >
                  {coordinadoresList?.map((coordinador) => (
                    <MenuItem 
                      key={coordinador.idCoordinador} 
                      value={coordinador.idCoordinador}
                    >
                      {coordinador.nombreCoordinador}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Unidad"
                fullWidth
                value={unidad}
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={!diasHabilitado || loading || !diasVacaciones || !selectedCoordinador}
              >
                {loading ? <CircularProgress size={24} /> : "Enviar Solicitud"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Snackbar
          open={successOpen}
          onClose={() => setSuccessOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          TransitionComponent={Slide}
          sx={{
            "& .MuiSnackbarContent-root": {
              padding: "8px 16px",
              minWidth: "200px",
            },
          }}
        >
          <Alert
            onClose={() => setSuccessOpen(false)}
            severity="success"
            sx={{
              width: "100%",
              fontSize: "1.0Srem",
              backgroundColor: "#28a745",
              color: "#ffffff",
              "& .MuiAlert-icon": {
                color: "#ffffff",
              },
              "& .MuiAlert-action": {
                color: "#ffffff",
              },
            }}
          >
            Solicitud enviada exitosamente
          </Alert>
        </Snackbar>

        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              width: 400,
              height: "auto",
              minHeight: 300,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <WarningIcon color="warning" sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              id="modal-title"
              variant="h6"
              component="h2"
              align="center"
              sx={{
                fontFamily: '"Times New Roman", Times, serif',
                color: "#A00000",
              }}
            >
              Solicitud en Proceso
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">
                <strong>Número de Gestión:</strong>{" "}
                {solicitud ? solicitud.idSolicitud : "..."}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Fecha Inicio Vacaciones:</strong>{" "}
                {solicitud
                  ? new Date(
                      solicitud.fechaInicioVacaciones
                    ).toLocaleDateString("es-ES")
                  : "..."}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Fecha fin de vacaciones:</strong>{" "}
                {solicitud
                  ? new Date(solicitud.fechaFinVacaciones).toLocaleDateString(
                      "es-ES"
                    )
                  : "..."}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Fecha de Reintegro Laboral:</strong>{" "}
                {solicitud
                  ? new Date(solicitud.fechaRetornoLabores).toLocaleDateString(
                      "es-ES"
                    )
                  : "..."}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Días Solicitados:</strong>{" "}
                {solicitud ? solicitud.cantidadDiasSolicitados : "..."}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Estado de la Solicitud:</strong>{" "}
                {solicitud ? solicitud.estadoSolicitud : "..."}
              </Typography>
            </Box>

            <Button
              onClick={handleCloseModal}
              variant="contained"
              sx={{ mt: 2, display: "block", mx: "auto" }}
            >
              Volver
            </Button>
          </Box>
        </Modal>

        <Modal
          open={!diasValidos && !solicitud}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              width: 400,
              height: "auto",
              minHeight: 300,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <WarningIcon color="warning" sx={{ fontSize: 40 }} />
            </Box>
            <Typography
              id="modal-title"
              variant="h6"
              component="h2"
              align="center"
              sx={{
                fontFamily: '"Times New Roman", Times, serif',
                color: "#A00000",
              }}
            >
              No puedes solicitar vacaciones
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">
                <strong>No aplica a vacaciones segun el articulo 70 del reglamento interno de trabajo
                  y gestión del recurso humano del Consejo Nacional de Adopcion.      
                </strong>{" "}
              </Typography>
            </Box>

            <Button
              onClick={handleCloseModal}
              variant="contained"
              sx={{ mt: 2, display: "block", mx: "auto" }}
            >
              Volver
            </Button>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default ProgramarVacacionesPage;