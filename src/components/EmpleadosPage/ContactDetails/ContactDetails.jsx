import React from "react";
import { Box, Typography, Link, IconButton, Paper, Avatar } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";

const ContactDetails = ({ infoPersonal }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        padding: "24px",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: "#1A237E", borderBottom: '2px solid #f0f4f8', pb: 1 }}>
        Datos de Contacto
      </Typography>

      {/* Correo Electrónico */}
      <Box display="flex" alignItems="flex-start" mb={2.5}>
        <Avatar sx={{ bgcolor: "primary.light", width: 40, height: 40, mr: 2 }}>
          <EmailOutlinedIcon sx={{ color: "#fff" }} />
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
            Correo Personal
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b", wordBreak: 'break-all' }}>
            {infoPersonal?.correoPersonal || "No registrado"}
          </Typography>
        </Box>
      </Box>

      {/* Número de teléfono */}
      <Box display="flex" alignItems="flex-start" mb={2.5}>
        <Avatar sx={{ bgcolor: "success.light", width: 40, height: 40, mr: 2 }}>
          <PhoneOutlinedIcon sx={{ color: "#fff" }} />
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
            Teléfono Móvil
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2E7D32" }}>
            {infoPersonal?.numeroCelular || "No registrado"}
          </Typography>
        </Box>
      </Box>

      {/* Fecha de nacimiento */}
      <Box display="flex" alignItems="flex-start">
        <Avatar sx={{ bgcolor: "secondary.light", width: 40, height: 40, mr: 2 }}>
          <CakeOutlinedIcon sx={{ color: "#fff" }} />
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
            Fecha de Nacimiento
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#475569" }}>
            {infoPersonal?.fechaNacimiento 
              ? new Date(infoPersonal.fechaNacimiento + "T00:00:00").toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' }) 
              : "No registrada"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ContactDetails;
