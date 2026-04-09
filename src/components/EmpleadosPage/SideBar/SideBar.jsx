import React, { useContext, useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, styled, Avatar, Button, Popover, Typography, Box, Badge, IconButton, useTheme, Tooltip, Collapse } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import VacationIcon from '@mui/icons-material/BeachAccess';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import TvIcon from '@mui/icons-material/Tv';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import { getLocalStorageData } from '../../../services/session/getLocalStorageData.js';
import useLogout from '../../../services/session/logout.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSolicitudes } from '../../../hooks/VacationAppHooks/useSolicitudes.js';
import { ColorModeContext } from '../../../config/ThemeContext.jsx';
import { useNotificaciones } from '../../../hooks/Notificaciones/useNotificaciones.js';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const CustomDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 270,
    background: 'linear-gradient(180deg, #3d1e08 0%, #6b3a1f 100%)',
    color: '#fff',
    borderRight: 'none',
    boxShadow: '10px 0 30px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
}));

const SidebarListItem = styled(ListItem)(({ theme, active }) => ({
  margin: '2px 10px',
  borderRadius: '10px',
  width: 'calc(100% - 20px)',
  backgroundColor: active ? 'rgba(255, 213, 128, 0.15)' : 'transparent',
  borderLeft: active ? `3px solid #f5a623` : '3px solid transparent',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  padding: '8px 14px',
  '&:hover': {
    backgroundColor: active ? 'rgba(255, 213, 128, 0.2)' : 'rgba(255, 255, 255, 0.08)',
    transform: 'translateX(4px)',
  },
  '& .MuiListItemIcon-root': {
    transition: 'all 0.25s',
    transform: active ? 'scale(1.1)' : 'scale(1)',
  }
}));

const AvatarContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '14px 18px',
  gap: '12px',
  background: 'linear-gradient(180deg, rgba(245, 166, 35, 0.1) 0%, transparent 100%)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  position: 'relative'
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  width: 48,
  height: 48,
  border: '2px solid rgba(129, 140, 248, 0.8)',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  backgroundColor: '#4f46e5',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  flexShrink: 0,
  '&:hover': {
    transform: 'scale(1.08)',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
    borderColor: '#818cf8',
  }
}));

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElNotif, setAnchorElNotif] = React.useState(null);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const userData = getLocalStorageData();
  const userInitial = userData?.primerNombre?.charAt(0)?.toUpperCase() || 'U';
  const { handleLogout } = useLogout();
  const { cantadSolicitudes } = useSolicitudes();
  const { notificaciones, noLeidasCount, marcarLeida } = useNotificaciones();

  const idRol = userData?.idRol;
  const notificationCount = cantadSolicitudes;

  const themeContext = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClick = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorElNotif(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const openNotif = Boolean(anchorElNotif);
  const idNotif = openNotif ? 'notif-popover' : undefined;

  const isActive = (path) => location.pathname === path;

  // Ítems principales — siempre visibles
  const mainItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/empleados/home' },
    { text: 'Programar Vacaciones', icon: <VacationIcon />, path: '/empleados/programar-vacaciones' },
    // Calendario Institucional: SOLO Director General y Subdirector General
    ...(userData?.puesto && (userData.puesto.toUpperCase().includes("DIRECTOR GENERAL") || userData.puesto.toUpperCase().includes("SUBDIRECTOR GENERAL")) ? [{ text: 'Calendario Institucional', icon: <CalendarMonthIcon />, path: '/empleados/calendario' }] : []),
    // Dashboard Estratégico Ejecutivo: RRHH (1, 3) y Ejecutivos (5)
    ...([1, 3, 5].includes(Number(idRol)) || (userData?.puesto && (userData.puesto.toUpperCase().includes("DIRECTOR GENERAL") || userData.puesto.toUpperCase().includes("SUBDIRECTOR GENERAL"))) ? [{ text: 'Dashboard Estratégico', icon: <TrendingUpIcon />, path: '/dashboard-ejecutivo' }] : []),
    // Pantalla Kiosco: RRHH (Rol 1, 3) y Ejecutivos (Rol 5 o Director)
    ...([1, 3, 5].includes(Number(idRol)) || (userData?.puesto && (userData.puesto.toUpperCase().includes("DIRECTOR GENERAL") || userData.puesto.toUpperCase().includes("SUBDIRECTOR GENERAL"))) ? [{ text: 'Pantalla Kiosco 📺', icon: <TvIcon />, path: '/kiosco' }] : []),
  ];

  // Ítems de perfil — colapsables bajo "Mi Perfil"
  const profileItems = [
    { text: 'Actualización de Datos', icon: <AppRegistrationIcon />, path: '/empleados/actualizar-datos' },
    { text: 'Información Personal', icon: <ContactsIcon />, path: '/empleados/infoPersonal' },
    { text: 'Familiares', icon: <PeopleIcon />, path: '/empleados/family' },
    { text: 'Datos Laborales', icon: <WorkIcon />, path: '/empleados/informacion-laboral' },
    { text: 'Info. Profesional', icon: <SchoolIcon />, path: '/empleados/informacion-profesional' },
    { text: 'Datos Generales', icon: <InfoIcon />, path: '/empleados/informacion-General' },
  ];

  // Auto-expandir si usuario está en una ruta de perfil
  const isInProfileSection = profileItems.some(item => isActive(item.path));

  // Configuración de colores Institucionales (Naranja y Amarillo CNA)
  const getRolColor = (id) => {
    const defaultColor = '#f5a623'; // Naranja CNA principal
    const colors = {
      1: '#d84315', // Naranja Quemado (SuperAdmin)
      2: '#f5a623', // Naranja CNA (Empleado)
      3: '#ffb300', // Ámbar Intenso (RRHH)
      4: '#fbc02d', // Amarillo Oro (Coordinador)
      5: '#ff8f00', // Naranja Vibrante (Dirección)
    };
    return colors[Number(id)] || defaultColor;
  };

  const rolColor = getRolColor(idRol);



  const drawerContent = (
    <>
      {/* Header compacto: Avatar + Info */}
      <AvatarContainer>
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <StyledAvatar 
            sx={{ bgcolor: '#3f51b5', color: '#fff' }} 
            onClick={handleAvatarClick}
          >
            {userInitial}
          </StyledAvatar>
          {/* Indicador online */}
          <Box sx={{
            position: 'absolute', bottom: 2, right: 2,
            width: 12, height: 12, borderRadius: '50%',
            bgcolor: '#22c55e', border: '2px solid #0f172a',
            boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
          }} />
        </Box>
        <Box sx={{ overflow: 'hidden', flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.9rem' }}>
            {userData?.primerNombre || 'Usuario'} {userData?.primerApellido?.charAt(0) || ''}{userData?.primerApellido ? '.' : ''}
          </Typography>
          
          {/* Título oficial con el color del chip para evitar duplicidad */}
          <Box sx={{
            display: 'inline-block',
            bgcolor: rolColor + '22', color: rolColor,
            fontSize: '0.65rem', fontWeight: 700,
            px: 0.8, py: 0.2, borderRadius: '4px',
            border: `1px solid ${rolColor}44`,
            mt: 0.4, mb: 0.4,
            maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {userData?.puesto || 'Colaborador'}
          </Box>

          <Typography variant="caption" sx={{ color: '#818cf8', fontSize: '0.72rem', fontWeight: 500, display: 'block' }}>
            @{userData?.usuario || 'usuario'}
          </Typography>
        </Box>

      </AvatarContainer>


      <List sx={{ 
        pt: 1, 
        pb: 1,
        flexGrow: 1, 
        overflowY: 'auto', 
        minHeight: 0,
        '&::-webkit-scrollbar': { width: '4px' }, 
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' },
        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255,255,255,0.4)' }
      }}>
        {/* ===== NAVEGACIÓN PRINCIPAL ===== */}
        {mainItems.map((item) => (
          <SidebarListItem 
            button 
            key={item.text}
            onClick={() => {
              if (item.path === '/kiosco') {
                window.open(item.path, '_blank');
              } else {
                navigate(item.path);
              }
              if(mobileOpen && handleDrawerToggle) handleDrawerToggle(); 
            }}
            active={isActive(item.path) ? 1 : 0}
          >
            <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? 'secondary.light' : 'rgba(255,255,255,0.7)' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontSize: '0.85rem', 
                fontWeight: isActive(item.path) ? 700 : 500,
                color: isActive(item.path) ? '#ffffff' : 'rgba(255,255,255,0.75)',
                letterSpacing: '0.2px'
              }} 
            />
          </SidebarListItem>
        ))}

        {/* Solicitudes (Coordinador / Director) */}
        { (Number(idRol) === 5 || (userData?.puesto && (userData.puesto.includes("Director General") || userData.puesto.includes("Subdirector General")))) && (
          <SidebarListItem 
            button 
            onClick={() => {
              navigate('/empleados/solicitudes');
              if(mobileOpen && handleDrawerToggle) handleDrawerToggle();
            }}
            active={isActive('/empleados/solicitudes') ? 1 : 0}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Badge badgeContent={notificationCount} color="error">
                <CheckCircleIcon sx={{ color: isActive('/empleados/solicitudes') ? 'secondary.light' : 'rgba(255,255,255,0.7)' }} />
              </Badge>
            </ListItemIcon>
            <ListItemText 
              primary="Solicitudes" 
              primaryTypographyProps={{ 
                fontSize: '0.85rem', 
                fontWeight: isActive('/empleados/solicitudes') ? 700 : 500,
                color: isActive('/empleados/solicitudes') ? '#ffffff' : 'rgba(255,255,255,0.75)',
                letterSpacing: '0.2px'
              }} 
            />
          </SidebarListItem>
        )}

        {/* ===== DIVIDER ===== */}
        <Divider sx={{ my: 1, mx: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* ===== MI PERFIL (colapsable) ===== */}
        <SidebarListItem 
          button 
          onClick={() => setPerfilOpen(!perfilOpen)}
          sx={{ mb: 0 }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: isInProfileSection ? '#818cf8' : 'rgba(255,255,255,0.7)' }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Mi Perfil" 
            primaryTypographyProps={{ 
              fontSize: '0.85rem', 
              fontWeight: (perfilOpen || isInProfileSection) ? 700 : 500,
              color: (perfilOpen || isInProfileSection) ? '#ffffff' : 'rgba(255,255,255,0.75)',
              letterSpacing: '0.2px'
            }} 
          />
          {(perfilOpen || isInProfileSection) ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />}
        </SidebarListItem>
        <Collapse in={perfilOpen || isInProfileSection} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {profileItems.map((item) => (
              <SidebarListItem 
                button 
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  if(mobileOpen && handleDrawerToggle) handleDrawerToggle(); 
                }}
                active={isActive(item.path) ? 1 : 0}
                sx={{ pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: isActive(item.path) ? 'secondary.light' : 'rgba(255,255,255,0.5)' }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.8rem', 
                    fontWeight: isActive(item.path) ? 600 : 400,
                    color: isActive(item.path) ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  }} 
                />
              </SidebarListItem>
            ))}
          </List>
        </Collapse>
      </List>
      <Box sx={{ 
        p: 2.5, 
        borderTop: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        bgcolor: 'rgba(0,0,0,0.15)',
        backdropFilter: 'blur(5px)'
      }}>
        <Tooltip title="Notificaciones">
          <IconButton 
            onClick={handleNotifClick} 
            color="inherit"
            sx={{ 
              bgcolor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)', transform: 'translateY(-2px)' },
              transition: 'all 0.3s'
            }}
          >
            <Badge badgeContent={noLeidasCount} color="error" overlap="circular">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={themeContext.palette.mode === 'dark' ? "Modo Claro" : "Modo Oscuro"}>
            <IconButton 
              onClick={colorMode.toggleColorMode} 
              color="inherit"
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)', transform: 'translateY(-2px)' },
                transition: 'all 0.3s'
              }}
            >
              {themeContext.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );

  return (
    <>
      <CustomDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Mejora rendimiento en móvil
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </CustomDrawer>

      <CustomDrawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' } }}
        open
      >
        {drawerContent}
      </CustomDrawer>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          "& .MuiPopover-paper": {
            ml: 2,
            width: 250,
            padding: "20px 16px",
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              mx: "auto", 
              mb: 1, 
              bgcolor: "secondary.main",
              fontSize: "1.5rem"
            }}
          >
            {userInitial}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700}>
            {userData?.primerNombre || "Usuario"} {userData?.primerApellido || ""}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            @{userData?.usuario || "Invitado"}
          </Typography>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Button
            fullWidth
            variant="outlined"
            sx={{ mb: 1, borderRadius: 2 }}
            onClick={() => {
              alert("Gestionar cuenta");
              handlePopoverClose();
            }}
          >
            Gestionar cuenta
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<ExitToAppIcon />}
            sx={{ borderRadius: 2 }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Popover>

      {/* Popover de Notificaciones */}
      <Popover
        id={idNotif}
        open={openNotif}
        anchorEl={anchorElNotif}
        onClose={handleNotifClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{
          "& .MuiPopover-paper": {
            ml: 2,
            width: 350,
            maxHeight: 400,
            borderRadius: "12px",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notificaciones
          </Typography>
          <IconButton size="small" onClick={handleNotifClose} sx={{ color: 'inherit' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <List sx={{ pt: 0, pb: 0, flexGrow: 1, overflowY: 'auto' }}>
          {notificaciones.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No tienes notificaciones recientes.</Typography>
            </Box>
          ) : (
            notificaciones.map((notif) => (
              <React.Fragment key={notif.idNotificacion}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    bgcolor: notif.leida === 0 ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                  onClick={() => {
                    if (notif.leida === 0) marcarLeida(notif.idNotificacion);
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={notif.leida === 0 ? 800 : 500} color={notif.leida === 0 ? 'text.primary' : 'text.secondary'}>
                        {notif.titulo}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {notif.mensaje}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                          {new Date(notif.fechaCreacion).toLocaleString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  {notif.leida === 0 && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default Sidebar;
