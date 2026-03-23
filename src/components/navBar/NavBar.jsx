import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Divider,
  Avatar,
  styled,
  Badge,
  IconButton,
  Popover,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import useLogout from "../../services/session/logout.js";
import { getLocalStorageData } from "../../services/session/getLocalStorageData.js";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../config/ThemeContext.jsx";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: "8px",
  padding: "8px 12px",
  transition: "all 0.2s ease",
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    transform: "translateY(-1px)",
  },
  color: "#ffffff",
}));

function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const { handleLogout } = useLogout();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const userData = getLocalStorageData();

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const menuOpen = Boolean(menuAnchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <AppBar 
      position="sticky" 
      elevation={2}
      sx={{ 
        background: "#1A237E",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            color: "#ffffff", 
            fontWeight: 700,
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          CNA Sistema
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <NavButton
            color="inherit"
            aria-label="home"
            onClick={() => navigate("/panel")}
          >
            <HomeIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
              Inicio
            </Typography>
          </NavButton>

          <NavButton
            color="inherit"
            aria-label="ingresar empleado"
            onClick={() => navigate("/ingresar-nuevo-empleado")}
          >
            <PersonAddIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
              Nuevo Empleado
            </Typography>
          </NavButton>

          <NavButton
            color="inherit"
            aria-label="suspensiones"
            onClick={() => navigate("/suspensiones")}
          >
            <PeopleIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
              Suspensiones
            </Typography>
          </NavButton>

          <NavButton
            color="inherit"
            aria-label="reportes"
            onClick={handleMenuClick}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Reportes
            </Typography>
            <ArrowDropDownIcon fontSize="small" />
          </NavButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 8,
              sx: {
                borderRadius: 2,
                minWidth: 150,
                mt: 1.5,
              }
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/lista-de-empleados");
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              Empleados
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                navigate("/vacaciones-empleados");
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              Vacaciones
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", ml: 2, gap: 2 }}>
          
          <Tooltip title={theme.palette.mode === 'dark' ? "Modo Claro" : "Modo Oscuro"}>
            <IconButton 
              color="inherit" 
              onClick={colorMode.toggleColorMode}
              sx={{ 
                bgcolor: "rgba(255,255,255,0.1)", 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
              }}
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton 
              color="inherit" 
              aria-label="notificaciones" 
              sx={{ 
                bgcolor: "rgba(255, 255, 255, 0.15)", // Fondo resaltado
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                border: "1px solid rgba(255,255,255,0.2)"
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            sx={{ ml: 1 }}
          >
            <Avatar 
              onClick={handleAvatarClick} 
              sx={{ 
                cursor: "pointer", 
                bgcolor: "secondary.main",
                border: "2px solid #fff",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.1)" }
              }}
            >
              {userData?.primerNombre?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </StyledBadge>
        </Box>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          sx={{
            "& .MuiPopover-paper": {
              mt: 1.5,
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
              {userData?.primerNombre?.[0]?.toUpperCase() || "U"}
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
              startIcon={<LogoutIcon />}
              sx={{ borderRadius: 2 }}
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
