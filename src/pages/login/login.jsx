import React, { useState, useContext } from "react";
import {
  Avatar, Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container, IconButton, InputAdornment, Paper, Fade
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ErrorAlert from "../../components/ErrorAlert/ErrorAlert.jsx";
import AuthContext from "../../services/context/AuthContext.jsx";
import { handleClickShowPassword, handleMouseDownPassword, handleSubmit } from "../../services/utils/EventeHandlers/eventHandlersLogin.js";
import { Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import api from "../../config/api.js";
import { endpointsPost } from "../../config/endpoints.js";
import { useRedirectLogin } from "../../hooks/LoginHooks/RedirectLoginHook.js";
import { useErrorAlertTemp } from "../../hooks/LoginHooks/useErrorAlert.js";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { authenticate, loading, error } = useContext(AuthContext);
  useRedirectLogin();
  const { alertVisible } = useErrorAlertTemp(error);

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1A237E 0%, #1565C0 100%)",
        padding: 3,
      }}
    >
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56, boxShadow: 3 }}>
                <BusinessCenterIcon fontSize="large" />
              </Avatar>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, color: "primary.dark", mt: 1, textAlign: "center" }}>
                CNA Sistema
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                Sistema de Control de Vacaciones
              </Typography>
            </Box>

            <ErrorAlert message={error} visible={alertVisible} />

            <Box
              component="form"
              onSubmit={(e) => handleSubmit(e, authenticate, username, password)}
              noValidate
              sx={{ mt: 1, width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nombre de usuario"
                name="username"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword(showPassword, setShowPassword)}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  mb: 3,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 2
                }}
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link 
                    component="button"
                    type="button"
                    variant="body2" 
                    onClick={() => {
                        setOpenReset(true);
                        setResetMessage({ type: "", text: "" });
                    }}
                    sx={{ fontWeight: 500, color: "text.secondary", "&:hover": { color: "primary.main" }, border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    ¿Olvidó su contraseña? Solicite una temporal
                  </Link>
                </Grid>
              </Grid>
            </Box>

            {/* Modal de Recuperación */}
            <Dialog open={openReset} onClose={() => !resetLoading && setOpenReset(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>Recuperar Contraseña</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Ingrese su DPI o Nombre de Usuario. Enviaremos una contraseña temporal a su **correo institucional**.
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
                    />
                    {resetMessage.text && (
                        <Typography 
                            variant="caption" 
                            sx={{ mt: 1, display: 'block', color: resetMessage.type === 'error' ? 'error.main' : 'success.main', fontWeight: 'bold' }}
                        >
                            {resetMessage.text}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenReset(false)} disabled={resetLoading}>Cancelar</Button>
                    <Button 
                        onClick={handleResetPassword} 
                        variant="contained" 
                        disabled={resetLoading}
                        startIcon={resetLoading && <CircularProgress size={20} />}
                    >
                        {resetLoading ? "Enviando..." : "Enviar Solicitud"}
                    </Button>
                </DialogActions>
            </Dialog>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
