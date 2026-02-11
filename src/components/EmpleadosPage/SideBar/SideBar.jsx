import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, styled, Avatar, Button, Popover, Typography, Box, Badge, useMediaQuery, useTheme, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Importa el ícono
import ContactsIcon from '@mui/icons-material/Contacts';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import VacationIcon from '@mui/icons-material/BeachAccess';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { getLocalStorageData } from '../../../services/session/getLocalStorageData.js';
import useLogout from '../../../services/session/logout.js';
import { useNavigate } from 'react-router-dom';
import { useSolicitudes } from '../../../hooks/VacationAppHooks/useSolicitudes.js';

const drawerWidth = 240;

const CustomDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: '#333',
    color: '#fff',
    borderRight: '1px solid #444',
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const SidebarListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#555',
  },
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(3),
  },
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(2.5),
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AvatarContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  borderBottom: '1px solid #444',
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  width: 50,
  height: 50,
}));

const LogoutButton = styled(Button)({
  marginTop: 'auto',
  backgroundColor: '#f44336',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
});

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth = 240 }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggleLocal = () => {
    if (isMobile) {
      handleDrawerToggle();
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const userData = getLocalStorageData();
  const userInitial = userData?.primerNombre.charAt(0).toUpperCase();
  const { handleLogout } = useLogout();
  const { cantadSolicitudes } = useSolicitudes();

  // Obtener idRol desde localStorage
  const idRol = userData?.idRol; // Asegúrate de que getLocalStorageData devuelva idRol
  const notificationCount = cantadSolicitudes; // Aquí puedes cambiar el número de notificaciones

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? 'simple-popover' : undefined;

  return (
    <>
      <CustomDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : sidebarOpen}
        onClose={handleDrawerToggleLocal}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: drawerWidth,
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggleLocal} sx={{ color: '#fff' }}>
            {isMobile ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <AvatarContainer>
          <StyledAvatar 
            sx={{ bgcolor: '#4053ac', color: '#fff' }} 
            onClick={handleAvatarClick}
          >
            {userInitial}
          </StyledAvatar>
        </AvatarContainer>
        <List>
          <SidebarListItem button onClick={() => navigate('/empleados/home')}>
            <ListItemIcon><HomeIcon sx={{ color: '#fff' }} /></ListItemIcon>
            <ListItemText primary="Home" sx={{ color: '#fff' }} />
          </SidebarListItem>
          <SidebarListItem button onClick={() => navigate('/empleados/infoPersonal')}>
            <ListItemIcon><ContactsIcon sx={{ color: '#fff' }} /></ListItemIcon>
            <ListItemText primary="Información Personal" sx={{ color: '#fff' }} />
          </SidebarListItem>
          <SidebarListItem button onClick={() => navigate('/empleados/family')}>
            <ListItemIcon><PeopleIcon sx={{ color: '#fff' }} /></ListItemIcon>
            <ListItemText primary="Familiares" sx={{ color: '#fff' }} />
          </SidebarListItem>
          <SidebarListItem button onClick={() => navigate('/empleados/informacion-laboral')}>
            <ListItemIcon><WorkIcon sx={{ color: '#fff' }} /></ListItemIcon>
            <ListItemText primary="Datos Laborales" sx={{ color: '#fff' }} />
          </SidebarListItem>
          <SidebarListItem button onClick={() => navigate('/empleados/informacion-profesional')}>
            <ListItemIcon><SchoolIcon sx={{ color: '#fff' }} /></ListItemIcon>
            <ListItemText primary="Informacion Profesional" sx={{ color: '#fff' }} />
          </SidebarListItem>
          <SidebarListItem button onClick={() => navigate('/empleados/informacion-General')}>
            <ListItemIcon><InfoIcon sx={{ color: '#fff' }} /></ListItemIcon>
            <ListItemText primary="Datos Generales" sx={{ color: '#fff' }} />
          </SidebarListItem>
          <SidebarListItem button onClick={() => navigate('/empleados/programar-vacaciones')}>
            <ListItemIcon><VacationIcon sx={{ color: '#fff' }} /></ListItemIcon>
            <ListItemText primary="Programar Vacaciones" sx={{ color: '#fff' }} />
          </SidebarListItem>

          {/* Opción "Solicitudes" solo si idRol es 5 */}
          {idRol === 5 && (
            <SidebarListItem button onClick={() => navigate('/empleados/solicitudes')}>
              <ListItemIcon>
                <Badge badgeContent={notificationCount} color="error">
                  <CheckCircleIcon  sx={{ color: '#fff' }} />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Solicitudes" sx={{ color: '#fff' }} />
            </SidebarListItem>
          )}
          <Divider sx={{ backgroundColor: '#444' }} />
        </List>
      </CustomDrawer>

      {/* Código del Drawer temporal para móviles */}

      <Popover
        id={popoverId}
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          "& .MuiPopover-paper": {
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">
            ¡Hola, {userData?.primerNombre || "Usuario"}!
          </Typography>
          <Typography variant="body2">
            @{userData?.usuario || "Invitado"}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Button
            fullWidth
            sx={{ justifyContent: "flex-start" }}
            onClick={() => {
              alert("Gestionar cuenta");
            }}
          >
            Gestionar cuenta
          </Button>
          <Button
            fullWidth
            startIcon={<ExitToAppIcon />}
            sx={{
              justifyContent: "flex-start",
              color: "#ffffff",
              backgroundColor: "#df4752",
              "&:hover": {
                backgroundColor: "#eb383e",
              },
            }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default Sidebar;
