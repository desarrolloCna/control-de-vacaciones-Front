import React, { useState, useContext, useEffect, useMemo } from "react";
import {
  Button, CssBaseline, TextField, Link, Box, Typography, InputAdornment, Fade, Checkbox, FormControlLabel, IconButton, Chip, Tooltip, Slide
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ErrorAlert from "../../components/ErrorAlert/ErrorAlert.jsx";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AuthContext from "../../services/context/AuthContext.jsx";
import { handleClickShowPassword, handleMouseDownPassword, handleSubmit } from "../../services/utils/EventeHandlers/eventHandlersLogin.js";
import { Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import api from "../../config/api.js";
import { endpointsPost } from "../../config/endpoints.js";
import { useRedirectLogin } from "../../hooks/LoginHooks/RedirectLoginHook.js";
import { useErrorAlertTemp } from "../../hooks/LoginHooks/useErrorAlert.js";
import cnaLogo from "../../assets/logo.jpg";

/* ====== FRASES MOTIVACIONALES ====== */
const FRASES = [
  "Cada niño merece una familia llena de amor, y cada familia merece la alegría de un hogar completo.",
  "Detrás de cada expediente hay un sueño: el de un niño con una familia y una familia con un hijo.",
  "Somos el puente entre la esperanza de un niño y el amor de una familia.",
  "Nuestro equipo trabaja con el corazón para unir familias y transformar vidas.",
  "Hoy, gracias a tu trabajo, un niño está más cerca de encontrar su hogar.",
  "Familias que buscan dar amor, niños que merecen recibirlo. Ese es nuestro propósito.",
  "El mejor equipo de trabajo es el que cambia vidas. Gracias por ser parte de él.",
  "Cada día en el CNA es una oportunidad para darle a un niño la familia que merece.",
  "Unidos por una misión: que ningún niño crezca sin el amor de una familia.",
  "Tu dedicación hace posible lo más hermoso: unir corazones en familia.",
];

/* ====== SALUDO DINÁMICO ====== */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: "Buenos días", emoji: "☀️" };
  if (h < 18) return { text: "Buenas tardes", emoji: "🌤️" };
  return { text: "Buenas noches", emoji: "🌙" };
};

/* ====== FECHA EN ESPAÑOL ====== */
const getFormattedDate = () => {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const d = new Date();
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
};

/* ====== KEYFRAMES CSS ====== */
const floatKeyframes = `
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-20vh) scale(1); opacity: 0; }
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}
@keyframes shine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
`;

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { authenticate, loading, error } = useContext(AuthContext);
  useRedirectLogin();
  const { alertVisible } = useErrorAlertTemp(error);
  
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "1") {
      setSessionExpiredMsg("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
      // Limpiar URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // Frase aleatoria (cambia al cargar)
  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);
  const greeting = useMemo(() => getGreeting(), []);
  const formattedDate = useMemo(() => getFormattedDate(), []);

  // Detectar Caps Lock
  const handleKeyEvent = (e) => setCapsLock(e.getModifierState('CapsLock'));

  // Recuperar usuario recordado
  useEffect(() => {
    const saved = localStorage.getItem("cna_remembered_user");
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  // Guardar/eliminar usuario al cambiar checkbox
  useEffect(() => {
    if (rememberMe && username) {
      localStorage.setItem("cna_remembered_user", username);
    } else if (!rememberMe) {
      localStorage.removeItem("cna_remembered_user");
    }
  }, [rememberMe, username]);

  // Estados para recuperación de contraseña
  const [openReset, setOpenReset] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: "", text: "" });

  const handleResetPassword = async () => {
    if (!resetIdentifier) {
      setResetMessage({ type: "error", text: "Por favor ingrese su DPI o Usuario" });
      return;
    }
    setResetLoading(true);
    setResetMessage({ type: "", text: "" });
    try {
      const response = await api.post(endpointsPost.requestPasswordReset, { identifier: resetIdentifier });
      setResetMessage({ 
        type: "success", 
        text: `${response.data.responseData} Si no lo recibe en unos minutos, verifique su bandeja de entrada (incluyendo Spam) o asegúrese de haber ingresado correctamente su DPI o Usuario.` 
      });
      setResetIdentifier("");
    } catch (err) {
      setResetMessage({ type: "error", text: err.response?.data?.responseData || "Error al solicitar el reseteo" });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <style>{floatKeyframes}</style>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        
        {/* ==================== PANEL IZQUIERDO ==================== */}
        <Box
          sx={{
            flex: { xs: "none", md: "0 0 42%" },
            background: "linear-gradient(160deg, #3d1e08 0%, #6b3a1f 35%, #8b5e3c 65%, #b07a4f 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            px: { xs: 4, md: 8 },
            py: { xs: 5, md: 0 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <Box sx={{
            position: "absolute", width: 300, height: 300, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)", top: -80, left: -100,
          }} />
          <Box sx={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%", animation: "pulse 4s ease-in-out infinite",
            border: "1px solid rgba(255,255,255,0.06)", bottom: -60, right: -40,
          }} />

          {/* Logo + Name */}
          <Fade in timeout={800}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 5, zIndex: 1 }}>
              <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "50%", width: 60, height: 60 }}>
                <Box
                  component="img"
                  src={cnaLogo}
                  alt="CNA Logo"
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid rgba(255,200,100,0.5)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                />
                {/* Shine effect */}
                <Box sx={{
                  position: "absolute", top: 0, left: "-100%",
                  width: "100%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shine 4s ease-in-out infinite",
                }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  Consejo Nacional
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 400,
                    fontSize: "1.1rem",
                  }}
                >
                  de Adopciones
                </Typography>
              </Box>
            </Box>
          </Fade>

          {/* Welcome text */}
          <Fade in timeout={1200}>
            <Box sx={{ zIndex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#ffd580",
                  fontWeight: 300,
                  fontSize: { xs: "1.5rem", md: "1.8rem" },
                  lineHeight: 1.4,
                  mb: 1,
                }}
              >
                {greeting.emoji} {greeting.text}.
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "1.05rem",
                  fontWeight: 300,
                  maxWidth: 340,
                  mb: 3,
                }}
              >
                Inicie sesión para acceder al sistema de control de vacaciones.
              </Typography>
              {/* Frase motivacional */}
              <Box sx={{
                borderLeft: "3px solid rgba(255,200,100,0.4)",
                pl: 2,
                py: 0.5,
              }}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "0.88rem",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    maxWidth: 300,
                  }}
                >
                  "{frase}"
                </Typography>
              </Box>
            </Box>
          </Fade>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: 4 + i * 2,
                height: 4 + i * 2,
                borderRadius: "50%",
                bgcolor: `rgba(255, 200, 100, ${0.15 + i * 0.03})`,
                left: `${15 + i * 14}%`,
                animation: `floatUp ${8 + i * 3}s linear infinite`,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}

          {/* Date + Footer */}
          <Box sx={{ position: { md: "absolute" }, bottom: 25, left: { md: 64 }, mt: { xs: 5, md: 0 }, zIndex: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", mb: 0.5, fontWeight: 500 }}>
              📅 {formattedDate}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
              © {new Date().getFullYear()} CNA — Sistema Institucional
            </Typography>
          </Box>
        </Box>

        {/* ==================== PANEL DERECHO ==================== */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: darkMode ? "#1a1a2e" : "#fafbfc",
            px: { xs: 3, md: 6 },
            py: { xs: 5, md: 0 },
            position: "relative",
            transition: "background-color 0.4s ease",
          }}
        >
          <Fade in timeout={1000}>
            <Box sx={{ width: "100%", maxWidth: 420 }}>

              {/* Dark mode toggle + Version */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, mb: 2 }}>
                <Chip
                  label="v1.0"
                  size="small"
                  sx={{
                    bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "#f0f0f0",
                    color: darkMode ? "rgba(255,255,255,0.5)" : "#999",
                    fontSize: "0.7rem",
                    height: 22,
                    fontWeight: 600,
                  }}
                />
                <Tooltip title={darkMode ? "Modo claro" : "Modo oscuro"} arrow>
                  <IconButton
                    onClick={() => setDarkMode(!darkMode)}
                    size="small"
                    sx={{
                      color: darkMode ? "#ffd580" : "#999",
                      transition: "all 0.3s ease",
                      "&:hover": { bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "#f0f0f0" },
                    }}
                  >
                    {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: darkMode ? "#fff" : "#1a1a2e",
                  mb: 0.5,
                  fontSize: { xs: "1.8rem", md: "2rem" },
                  transition: "color 0.3s ease",
                }}
              >
                Iniciar Sesión
              </Typography>
              <Box sx={{ width: 50, height: 4, bgcolor: "#f5a623", borderRadius: 2, mb: 4 }} />

              {/* Error alert */}
              <ErrorAlert message={sessionExpiredMsg || error} visible={Boolean(sessionExpiredMsg) || alertVisible} />

              {/* Form */}
              <Box
                component="form"
                onSubmit={(e) => handleSubmit(e, authenticate, username, password)}
                noValidate
              >
                {/* Username */}
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkMode ? "#bbb" : "#555", mb: 0.8, transition: "color 0.3s ease" }}>
                  Usuario
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="username"
                  name="username"
                  autoFocus
                  autoComplete="username"
                  placeholder="Ingrese su nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: darkMode ? "rgba(255,255,255,0.06)" : "#f8f9fb",
                      transition: "all 0.3s ease",
                      "& fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.12)" : "#e0e0e0", transition: "all 0.3s ease" },
                      "&:hover fieldset": { borderColor: darkMode ? "rgba(255,200,100,0.3)" : "#d4913a" },
                      "&.Mui-focused fieldset": { borderColor: "#d4913a", borderWidth: 2 },
                      "&.Mui-focused": { bgcolor: darkMode ? "rgba(255,200,100,0.05)" : "#fef9f0" },
                    },
                    "& .MuiOutlinedInput-input": {
                      color: darkMode ? "#fff" : "#333",
                      py: 1.4,
                      fontSize: "0.95rem",
                      "&:-webkit-autofill": {
                        WebkitBoxShadow: darkMode ? "0 0 0 100px #2a2a3e inset" : "0 0 0 100px #f8f9fb inset",
                        WebkitTextFillColor: darkMode ? "#fff" : "#333",
                        caretColor: darkMode ? "#fff" : "#333",
                      },
                    },
                    "& .MuiOutlinedInput-input::placeholder": {
                      color: darkMode ? "rgba(255,255,255,0.3)" : "#aaa",
                      opacity: 1,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: darkMode ? "rgba(255,255,255,0.3)" : "#bbb", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password */}
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkMode ? "#bbb" : "#555", mb: 0.8, transition: "color 0.3s ease" }}>
                  Contraseña
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyEvent}
                  onKeyUp={handleKeyEvent}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: darkMode ? "rgba(255,255,255,0.06)" : "#f8f9fb",
                      transition: "all 0.3s ease",
                      "& fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.12)" : "#e0e0e0", transition: "all 0.3s ease" },
                      "&:hover fieldset": { borderColor: darkMode ? "rgba(255,200,100,0.3)" : "#d4913a" },
                      "&.Mui-focused fieldset": { borderColor: "#d4913a", borderWidth: 2 },
                      "&.Mui-focused": { bgcolor: darkMode ? "rgba(255,200,100,0.05)" : "#fef9f0" },
                    },
                    "& .MuiOutlinedInput-input": {
                      color: darkMode ? "#fff" : "#333",
                      py: 1.4,
                      fontSize: "0.95rem",
                      bgcolor: "transparent",
                      "&:-webkit-autofill": {
                        WebkitBoxShadow: darkMode ? "0 0 0 100px #2a2a3e inset" : "0 0 0 100px #f8f9fb inset",
                        WebkitTextFillColor: darkMode ? "#fff" : "#333",
                        caretColor: darkMode ? "#fff" : "#333",
                      },
                    },
                    "& .MuiOutlinedInput-input::placeholder": {
                      color: darkMode ? "rgba(255,255,255,0.3)" : "#aaa",
                      opacity: 1,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: darkMode ? "rgba(255,255,255,0.3)" : "#bbb", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword(showPassword, setShowPassword)}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="small"
                          sx={{ color: darkMode ? "rgba(255,200,100,0.5)" : "#bbb", mr: 0.5 }}
                        >
                          {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Caps Lock warning */}
                <Slide direction="down" in={capsLock} mountOnEnter unmountOnExit>
                  <Box sx={{
                    display: "flex", alignItems: "center", gap: 1, mb: 1, mt: 0.5,
                    bgcolor: "#fff3e0", borderRadius: 1, px: 1.5, py: 0.6,
                    border: "1px solid #ffe0b2",
                  }}>
                    <WarningAmberIcon sx={{ fontSize: 16, color: "#f57c00" }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "#e65100", fontWeight: 500 }}>
                      Bloq Mayús está activado
                    </Typography>
                  </Box>
                </Slide>

                {/* Forgot password link */}
                <Box sx={{ textAlign: "left", mb: 3 }}>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => {
                      setOpenReset(true);
                      setResetMessage({ type: "", text: "" });
                    }}
                    sx={{
                      fontSize: "0.9rem",
                      color: "#c07b30",
                      fontWeight: 500,
                      textDecoration: "none",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline", color: "#a06520" },
                    }}
                  >
                    ¿Olvidó su usuario o contraseña?
                  </Link>
                </Box>

                {/* Remember me */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: "#ccc",
                        "&.Mui-checked": { color: "#d4913a" },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.85rem", color: darkMode ? "#999" : "#888", transition: "color 0.3s ease" }}>
                      Recordar mi usuario
                    </Typography>
                  }
                  sx={{ mb: 2, ml: -0.5 }}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.6,
                    fontSize: "1.08rem",
                    fontWeight: 700,
                    borderRadius: "8px",
                    textTransform: "none",
                    background: "linear-gradient(135deg, #f5a623 0%, #e8852d 50%, #d4713a 100%)",
                    color: "#fff",
                    border: "none",
                    letterSpacing: "0.5px",
                    boxShadow: "0 4px 18px rgba(228, 130, 40, 0.45)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #e8971a 0%, #d67225 50%, #c06030 100%)",
                      boxShadow: "0 6px 24px rgba(228, 130, 40, 0.6)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(0px)",
                      boxShadow: "0 2px 10px rgba(228, 130, 40, 0.4)",
                    },
                    "&:disabled": {
                      background: "linear-gradient(135deg, #e0c99a 0%, #d4b88a 100%)",
                      color: "rgba(255,255,255,0.7)",
                      boxShadow: "none",
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={22} sx={{ color: "#fff" }} />
                      Ingresando...
                    </Box>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>

                {/* Enter hint */}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5, mt: 2, opacity: 0.5 }}>
                  <KeyboardReturnIcon sx={{ fontSize: 14, color: darkMode ? "#888" : "#bbb" }} />
                  <Typography sx={{ fontSize: "0.72rem", color: darkMode ? "#888" : "#bbb", letterSpacing: "0.3px" }}>
                    Presione Enter para ingresar
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* ==================== MODAL RECUPERACIÓN ==================== */}
      <Dialog open={openReset} onClose={() => !resetLoading && setOpenReset(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box sx={{ height: 4, bgcolor: "#d4913a" }} />
        <DialogTitle sx={{ fontWeight: 700, color: "#1a1a2e", pt: 3 }}>
          Recuperar Contraseña
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Ingrese su DPI o Nombre de Usuario. Enviaremos una contraseña temporal a su correo institucional.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="DPI o Usuario"
            fullWidth
            variant="outlined"
            value={resetIdentifier}
            onChange={(e) => setResetIdentifier(e.target.value)}
            disabled={resetLoading}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {resetMessage.text && (
            <Typography
              variant="caption"
              sx={{
                mt: 1, display: "block",
                color: resetMessage.type === "error" ? "error.main" : "success.main",
                fontWeight: "bold",
              }}
            >
              {resetMessage.text}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenReset(false)} disabled={resetLoading}
            sx={{ textTransform: "none", color: "#777" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={resetLoading}
            startIcon={resetLoading && <CircularProgress size={20} />}
            sx={{
              textTransform: "none", borderRadius: 2,
              bgcolor: "#d4913a", "&:hover": { bgcolor: "#b87a2e" },
            }}
          >
            {resetLoading ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
