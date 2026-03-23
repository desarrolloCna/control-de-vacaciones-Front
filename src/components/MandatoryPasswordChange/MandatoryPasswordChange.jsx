import React, { useState, useContext } from "react";
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
    Typography, Box, Alert, CircularProgress, IconButton, InputAdornment 
} from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle, ErrorOutline } from "@mui/icons-material";
import AuthContext from "../../services/context/AuthContext.jsx";
import api from "../../config/api.js";
import { endpointsPut } from "../../config/endpoints.js";

const MandatoryPasswordChange = () => {
    const { userData, logout } = useContext(AuthContext);
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Solo se muestra si el flag está activo y hay un usuario logueado
    const open = userData?.requiereCambioPass === 1;

    const passwordsMatch = newPass && confirmPass && newPass === confirmPass;
    const passwordsModified = newPass || confirmPass;

    const handleUpdatePassword = async () => {
        if (!newPass) {
            setMessage({ type: "error", text: "La nueva contraseña es obligatoria." });
            return;
        }
        if (newPass !== confirmPass) {
            setMessage({ type: "error", text: "Las contraseñas no coinciden." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await api.put(endpointsPut.cambiarPassword, {
                idEmpleado: userData.idEmpleado,
                newPassword: newPass
            });
            
            setMessage({ type: "success", text: "¡Contraseña actualizada con éxito!" });
            
            setTimeout(() => {
                window.location.reload(); 
            }, 1500);

        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Error al actualizar la contraseña." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={!!open} 
            disableEscapeKeyDown 
            onClose={(e, reason) => {
                if (reason !== 'backdropClick') {
                    // No permitir cerrar
                }
            }}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, p: 1 }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main', pt: 3 }}>
                🔒 Seguridad de la Cuenta
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                    Has ingresado con una clave temporal. Por su seguridad, es **obligatorio** definir una nueva contraseña personal para continuar.
                </Typography>

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 2, borderRadius: 2 }}>
                        {message.text}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Nueva Contraseña"
                        type={showPass ? "text" : "password"}
                        fullWidth
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        disabled={loading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                                        {showPass ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Confirmar Nueva Contraseña"
                        type={showPass ? "text" : "password"}
                        fullWidth
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        disabled={loading}
                        error={!!(passwordsModified && !passwordsMatch && confirmPass.length > 0)}
                        helperText={
                            passwordsModified && confirmPass.length > 0 ? (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: passwordsMatch ? 'success.main' : 'error.main' }}>
                                    {passwordsMatch ? <CheckCircle fontSize="inherit" /> : <ErrorOutline fontSize="inherit" />}
                                    {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                                </Box>
                            ) : ""
                        }
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                <Button color="inherit" onClick={logout} disabled={loading} sx={{ fontWeight: 'bold' }}>
                    Cerrar Sesión
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleUpdatePassword} 
                    disabled={loading || !passwordsMatch}
                    sx={{ boxShadow: 3, fontWeight: 'bold', px: 3 }}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                    {loading ? "Procesando..." : "Actualizar Clave"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MandatoryPasswordChange;
