import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Alert,
  Slide,
  Snackbar,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Navbar from "../../../components/navBar/NavBar";
import BackButton from "../../../components/BackButton/BackButton";
import { useCheckSession } from "../../../services/session/checkSession";
import Spinner from "../../../components/spinners/spinner";
import { useNavigate } from "react-router-dom";

// Sub-formularios (se renderizan DENTRO del Wizard, no como páginas separadas)
import StepDpi from "./steps/StepDpi";
import StepInfoPersonal from "./steps/StepInfoPersonal";
import StepFamiliares from "./steps/StepFamiliares";
import StepNivelEducativo from "./steps/StepNivelEducativo";
import StepDatosGenerales from "./steps/StepDatosGenerales";
import StepEmpleadoNuevo from "./steps/StepEmpleadoNuevo";

// ──── Stepper Personalizado ────
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: "linear-gradient(90deg, #1A237E 0%, #0D47A1 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")(({ ownerState }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 48,
  height: 48,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease",
  ...(ownerState.active && {
    background: "linear-gradient(135deg, #1A237E 0%, #0D47A1 100%)",
    boxShadow: "0 4px 16px rgba(13,71,161,0.4)",
    transform: "scale(1.15)",
  }),
  ...(ownerState.completed && {
    background: "linear-gradient(135deg, #2E7D32 0%, #43A047 100%)",
  }),
}));

const stepIcons = {
  1: <BadgeIcon />,
  2: <PersonIcon />,
  3: <PeopleIcon />,
  4: <SchoolIcon />,
  5: <MedicalServicesIcon />,
  6: <WorkIcon />,
};

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;
  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckCircleIcon /> : stepIcons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const STEPS = [
  "DPI",
  "Datos Personales",
  "Familiares",
  "Nivel Educativo",
  "Datos Generales",
  "Datos de Empleo",
];

export default function WizardNuevoEmpleado() {
  const isSessionVerified = useCheckSession();
  const navigate = useNavigate();

  // Estado central del wizard (en memoria, NO en localStorage)
  const [activeStep, setActiveStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    idDpi: null,
    idInfoPersonal: null,
  });

  // Snackbar/Alert
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showResetWarning, setShowResetWarning] = useState(false);

  // Al montar, verificar si hay datos huérfanos en localStorage (de un intento previo)
  useEffect(() => {
    const storedData = localStorage.getItem("datosEmpleado");
    if (storedData) {
      // Limpiar datos huérfanos y advertir
      localStorage.removeItem("datosEmpleado");
      setShowResetWarning(true);
    }
  }, []);

  // Callback que reciben los sub-steps al completarse exitosamente
  const handleStepComplete = useCallback(
    (stepData) => {
      // Mesclar datos del paso completado
      setWizardData((prev) => ({ ...prev, ...stepData }));

      // Guardar temporalmente en localStorage para que los otros steps lo lean
      const merged = { ...wizardData, ...stepData };
      localStorage.setItem("datosEmpleado", JSON.stringify(merged));

      // Mostrar toast de éxito
      setSnackbar({
        open: true,
        message: `Paso "${STEPS[activeStep]}" guardado correctamente.`,
        severity: "success",
      });

      // Avanzar al siguiente paso
      if (activeStep < STEPS.length - 1) {
        setActiveStep((prev) => prev + 1);
      }
    },
    [activeStep, wizardData]
  );

  // Callback cuando todo el proceso finaliza (último paso)
  const handleWizardFinish = useCallback(() => {
    localStorage.removeItem("datosEmpleado");
    setSnackbar({
      open: true,
      message: "¡Empleado registrado exitosamente! Redirigiendo al panel...",
      severity: "success",
    });
    setTimeout(() => navigate("/panel"), 1500);
  }, [navigate]);

  // Antes de cerrar/recargar la pestaña, advertir al usuario
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activeStep > 0) {
        e.preventDefault();
        e.returnValue = "Tiene un proceso de registro incompleto. Si cierra esta página perderá toda la información no guardada.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeStep]);

  if (!isSessionVerified) return <Spinner />;

  const renderStep = () => {
    const commonProps = {
      wizardData,
      onStepComplete: handleStepComplete,
      onFinish: handleWizardFinish,
    };

    switch (activeStep) {
      case 0:
        return <StepDpi {...commonProps} />;
      case 1:
        return <StepInfoPersonal {...commonProps} />;
      case 2:
        return <StepFamiliares {...commonProps} />;
      case 3:
        return <StepNivelEducativo {...commonProps} />;
      case 4:
        return <StepDatosGenerales {...commonProps} />;
      case 5:
        return <StepEmpleadoNuevo {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh", pb: 5 }}>
        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <BackButton />
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              mt: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Header */}
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: "linear-gradient(90deg, #1A237E, #0D47A1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Registro de Nuevo Empleado
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Complete los 6 pasos para registrar un nuevo colaborador en el sistema
            </Typography>

            {/* Alerta de Reset */}
            {showResetWarning && (
              <Alert
                severity="warning"
                icon={<WarningAmberIcon />}
                onClose={() => setShowResetWarning(false)}
                sx={{ mb: 3, borderRadius: 2 }}
              >
                Se detectó un proceso de registro anterior incompleto. Los datos no guardados se han descartado.
                Por favor, inicie el proceso nuevamente.
              </Alert>
            )}

            {/* Stepper Premium */}
            <Box sx={{ mb: 4 }}>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                connector={<ColorlibConnector />}
              >
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={ColorlibStepIcon}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      >
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Contenido del paso actual */}
            <Box
              sx={{
                minHeight: 400,
                animation: "fadeIn 0.3s ease-in-out",
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
              key={activeStep}
            >
              {renderStep()}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Snackbar de éxito/error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
