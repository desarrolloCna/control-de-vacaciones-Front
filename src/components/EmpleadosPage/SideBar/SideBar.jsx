import React, { useContext } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, styled, Avatar, Button, Popover, Typography, Box, Badge, IconButton, useTheme, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import VacationIcon from '@mui/icons-material/BeachAccess';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
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

const CustomDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 260,
    background: 'linear-gradient(180deg, #0f172a 0%, #1e1e2f 100%)',
    color: '#fff',
    borderRight: 'none',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
}));

const SidebarListItem = styled(ListItem)(({ theme, active }) => ({
  margin: '6px 16px',
  borderRadius: '10px',
  width: 'calc(100% - 32px)',
  backgroundColor: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
  borderLeft: active ? `4px solid #6366f1` : '4px solid transparent',
  transition: 'all 0.2s ease',
  padding: '10px 16px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateX(4px)',
  },
}));

const AvatarContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '28px 16px',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  position: 'relative'
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  width: 70,
  height: 70,
  border: '3px solid #6366f1',
  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
  transition: 'all 0.3s ease',
  backgroundColor: '#4f46e5',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  '&:hover': {
    transform: 'scale(1.08) translateY(-2px)',
    boxShadow: '0 12px 20px rgba(99, 102, 241, 0.4)',
  }
}));

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElNotif, setAnchorElNotif] = React.useState(null);
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

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/empleados/home' },
    { text: 'Actualización de Datos', icon: <AppRegistrationIcon />, path: '/empleados/actualizar-datos' },
    { text: 'Información Personal', icon: <ContactsIcon />, path: '/empleados/infoPersonal' },
    { text: 'Familiares', icon: <PeopleIcon />, path: '/empleados/family' },
    { text: 'Datos Laborales', icon: <WorkIcon />, path: '/empleados/informacion-laboral' },
    { text: 'Información Profesional', icon: <SchoolIcon />, path: '/empleados/informacion-profesional' },
    { text: 'Datos Generales', icon: <InfoIcon />, path: '/empleados/informacion-General' },
    { text: 'Programar Vacaciones', icon: <VacationIcon />, path: '/empleados/programar-vacaciones' },
    // Ocultar calendario a Jefes (3) y Empleados (4), pero habilitar para Directores/Subdirectores y Coordinadores
    ...(Number(idRol) === 1 || Number(idRol) === 2 || Number(idRol) === 5 || (userData?.puesto && (userData.puesto.includes("Director General") || userData.puesto.includes("Subdirector General"))) ? [{ text: 'Calendario Institucional', icon: <CalendarMonthIcon />, path: '/empleados/calendario' }] : []),
  ];

  const drawerContent = (
    <>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #1f2937' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#7986cb', lineHeight: 1.2 }}>
          CNA Sistema
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Vacaciones
        </Typography>
      </Box>
      <AvatarContainer>
        <StyledAvatar 
          sx={{ bgcolor: '#3f51b5', color: '#fff', mb: 1.5 }} 
          onClick={handleAvatarClick}
        >
          {userInitial}
        </StyledAvatar>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {userData?.primerNombre || 'Usuario'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          {userData?.puesto || 'Colaborador'}
        </Typography>
      </AvatarContainer>
      <List sx={{ 
        pt: 2, 
        pb: 2,
        flexGrow: 1, 
        overflowY: 'auto', 
        minHeight: 0, // Fix critical de scroll en flexbox (evita que la vista desborde la pantalla)
        '&::-webkit-scrollbar': { width: '5px' }, 
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '5px' },
        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255,255,255,0.4)' }
      }}>
        {menuItems.map((item) => (
          <SidebarListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if(mobileOpen && handleDrawerToggle) handleDrawerToggle(); 
            }}
            active={isActive(item.path) ? 1 : 0}
          >
            <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'secondary.light' : 'rgba(255,255,255,0.7)' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontSize: '0.9rem', 
                fontWeight: isActive(item.path) ? 700 : 500,
                color: isActive(item.path) ? '#ffffff' : 'rgba(255,255,255,0.75)',
                letterSpacing: '0.3px'
              }} 
            />
          </SidebarListItem>
        ))}

        { (Number(idRol) === 5 || (userData?.puesto && (userData.puesto.includes("Director General") || userData.puesto.includes("Subdirector General")))) && (
          <SidebarListItem 
            button 
            onClick={() => {
              navigate('/empleados/solicitudes');
              if(mobileOpen && handleDrawerToggle) handleDrawerToggle();
            }}
            active={isActive('/empleados/solicitudes') ? 1 : 0}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Badge badgeContent={notificationCount} color="error">
                <CheckCircleIcon sx={{ color: isActive('/empleados/solicitudes') ? 'secondary.light' : 'rgba(255,255,255,0.7)' }} />
              </Badge>
            </ListItemIcon>
            <ListItemText 
              primary="Solicitudes" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem', 
                fontWeight: isActive('/empleados/solicitudes') ? 700 : 500,
                color: isActive('/empleados/solicitudes') ? '#ffffff' : 'rgba(255,255,255,0.75)',
                letterSpacing: '0.3px'
              }} 
            />
          </SidebarListItem>
        )}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(0,0,0,0.1)' }}>
        <Tooltip title="Notificaciones">
          <IconButton 
            onClick={handleNotifClick} 
            color="inherit"
            sx={{ 
              bgcolor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)', transform: 'translateY(-1px)' },
              transition: 'all 0.2s'
            }}
          >
            <Badge badgeContent={noLeidasCount} color="error">
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
                bgcolor: "rgba(255, 255, 255, 0.1)",
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)', transform: 'translateY(-1px)' },
                transition: 'all 0.2s'
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
