import React, { useState, useEffect } from "react";
import { Box, Grid, IconButton, Typography, Avatar, Button, Modal, TextField, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel, Paper, Container, Fade, Divider } from "@mui/material";
import Sidebar from "../../../components/EmpleadosPage/SideBar/SideBar";
import MenuIcon from "@mui/icons-material/Menu";
import PhoneIcon from "@mui/icons-material/Phone";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import Spinner from "../../../components/spinners/spinner";
import { useCheckSession } from "../../../services/session/checkSession";
import { useInfoFamiliares } from "../../../hooks/EmpleadosHooks/useInfoFamiliares";
import { useErrorAlert } from "../../../hooks/LoginHooks/useErrorAlert";
import api from "../../../config/api";
import { PageHeader } from "../../../components/UI/UIComponents";

const FamilyPage = () => {
  const isSessionVerified = useCheckSession();
  const { familiares: familiaresData, error, loading } = useInfoFamiliares();
  const { alertVisible } = useErrorAlert(error);

  const [familiaresState, setFamiliaresState] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [parentescos, setParentescos] = useState([]);
  const [nuevoFamiliar, setNuevoFamiliar] = useState({
    nombreFamiliar: "",
    telefono: "",
    parentesco: "",
    fechaNacimiento: ""
  });

  useEffect(() => {
    if (familiaresData && familiaresData.length > 0) setFamiliaresState(familiaresData);
  }, [familiaresData]);

  useEffect(() => {
    const fetchParentescos = async () => {
      try {
        const res = await api.get("/parentesco");
        const data = res.data.parentescos || res.data.departamentos || res.data || [];
        setParentescos(Array.isArray(data) ? data : (Array.isArray(data[0]) ? data[0] : []));
      } catch (e) { console.warn("No se cargaron parentescos", e); }
    };
    fetchParentescos();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setErrorMsg("");
  };

  const handleChange = (e) => {
    setNuevoFamiliar({ ...nuevoFamiliar, [e.target.name]: e.target.value });
  };

  const handleAddFamiliar = async () => {
    if (!nuevoFamiliar.nombreFamiliar || !nuevoFamiliar.parentesco) {
      setErrorMsg("Nombre y parentesco son obligatorios.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const idInfo = userData?.idInfoPersonal;
      if (!idInfo) throw new Error("No se encontró idInfoPersonal");
      await api.post("/ingresarFamiliar", { idInfoPersonal: idInfo, ...nuevoFamiliar });
      setFamiliaresState([...familiaresState, { ...nuevoFamiliar, idFamiliar: Date.now() }]);
      setNuevoFamiliar({ nombreFamiliar: "", telefono: "", parentesco: "", fechaNacimiento: "" });
      handleCloseModal();
      setSuccessMsg("Familiar agregado correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Error al guardar el familiar.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isSessionVerified || loading) return <Spinner />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f7f9" }}>
      <IconButton
        color="inherit"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { md: "none" }, position: "absolute", top: 16, left: 16, zIndex: 1300 }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{ width: { xs: mobileOpen ? "260px" : 0, md: "260px" }, flexShrink: { md: 0 }, transition: "width 0.3s ease" }}
      >
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          <PageHeader 
            title="Mi Círculo Familiar" 
            subtitle="Gestiona la información de tus contactos de emergencia y familiares directos para tu expediente."
          />

          {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 3, 
                px: 4, 
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(26, 35, 126, 0.3)',
                background: 'linear-gradient(135deg, #1A237E 0%, #3f51b5 100%)',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(26, 35, 126, 0.4)' }
              }}
              onClick={handleOpenModal}
            >
              Nuevo Familiar
            </Button>
          </Box>

          <Grid container spacing={3}>
            {familiaresState.length > 0 ? (
              familiaresState.map((familiar, index) => (
                <Grid item xs={12} sm={6} md={4} key={familiar.idFamiliar || index}>
                  <Fade in={true} timeout={400 + index * 100}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: 4,
                        borderRadius: 5,
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        backgroundColor: "#fff",
                        border: "1px solid #edf2f7",
                        position: 'relative',
                        overflow: 'hidden',
                        "&:hover": {
                          transform: "translateY(-10px)",
                          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                          borderColor: "primary.main"
                        },
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          mx: "auto", 
                          mb: 2, 
                          bgcolor: "primary.light", 
                          fontSize: '2rem',
                          fontWeight: 800,
                          boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)' 
                        }}
                      >
                        {familiar.nombreFamiliar.charAt(0).toUpperCase()}
                      </Avatar>
                      
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5, lineHeight: 1.2 }}>
                        {familiar.nombreFamiliar}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {familiar.parentesco}
                      </Typography>

                      <Divider sx={{ my: 2.5, opacity: 0.6 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'success.light' }}>
                            <PhoneIcon sx={{ fontSize: 20, color: 'white' }} />
                          </Avatar>
                          <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>TELÉFONO</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
                              {familiar.telefono || "N/A"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'warning.light' }}>
                            <CalendarTodayIcon sx={{ fontSize: 20, color: 'white' }} />
                          </Avatar>
                          <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>FECHA NACIMIENTO</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
                              {familiar.fechaNacimiento ? new Date(familiar.fechaNacimiento + "T00:00:00").toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }) : "No registrada"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 6, bgcolor: 'white', border: '2px dashed #e2e8f0' }}>
                  <GroupIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#64748b" }}>No hay registros de familiares</Typography>
                  <Typography variant="body1" sx={{ color: "#94a3b8", mt: 1 }}>Agrega personas de confianza o familiares a tu perfil.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Modal Premium */}
        <Modal open={modalOpen} onClose={handleCloseModal} closeAfterTransition>
          <Fade in={modalOpen}>
            <Box sx={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: { xs: '90%', sm: 500 }, bgcolor: "white", borderRadius: 6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", p: 5,
              border: '1px solid #f1f5f9'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2.5 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48, boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)' }}>
                  <AddIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>Registrar Familiar</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Ingresa los datos para actualizar tu expediente.</Typography>
                </Box>
              </Box>
              
              {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}
              
              <TextField label="Nombre Completo" fullWidth margin="normal" name="nombreFamiliar" value={nuevoFamiliar.nombreFamiliar} onChange={handleChange} variant="filled" sx={{ bgcolor: '#f8fafc', borderRadius: 2 }} />
              <TextField label="Teléfono de Contacto" fullWidth margin="normal" name="telefono" value={nuevoFamiliar.telefono} onChange={handleChange} variant="filled" sx={{ bgcolor: '#f8fafc', borderRadius: 2 }} />
              
              <FormControl fullWidth margin="normal" variant="filled" sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}>
                <InputLabel>Parentesco / Relación</InputLabel>
                <Select name="parentesco" value={nuevoFamiliar.parentesco} onChange={handleChange} label="Parentesco">
                  {parentescos.map((p) => (
                    <MenuItem key={p.idParentesco || p.parentesco} value={p.parentesco}>{p.parentesco}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField label="Fecha de Nacimiento" fullWidth margin="normal" type="date" InputLabelProps={{ shrink: true }} name="fechaNacimiento" value={nuevoFamiliar.fechaNacimiento} onChange={handleChange} variant="filled" sx={{ bgcolor: '#f8fafc', borderRadius: 2 }} />
              
              <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
                <Button fullWidth variant="text" onClick={handleCloseModal} sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}>Cancelar</Button>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={handleAddFamiliar} 
                  disabled={saving} 
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5, 
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)'
                  }}
                >
                  {saving ? <CircularProgress size={24} color="inherit" /> : "Guardar Familiar"}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default FamilyPage;
