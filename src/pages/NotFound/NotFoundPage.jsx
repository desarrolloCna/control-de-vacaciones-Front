import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 4, sm: 6 },
          borderRadius: 4,
          textAlign: "center",
          maxWidth: 480,
          width: "100%",
          borderTop: "5px solid #5c6bc0",
        }}
      >
        <SearchOffIcon sx={{ fontSize: 72, color: "#5c6bc0", mb: 2 }} />

        <Typography
          variant="h1"
          sx={{ fontSize: { xs: "5rem", sm: "7rem" }, fontWeight: 800, color: "#5c6bc0", lineHeight: 1 }}
        >
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, mb: 1, color: "text.primary" }}>
          Página no encontrada
        </Typography>

        <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
          La dirección que ingresaste no existe en el sistema. Es posible que la página haya sido movida o el enlace esté incorrecto.
        </Typography>

        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 4,
            py: 1.2,
            bgcolor: "#5c6bc0",
            "&:hover": { bgcolor: "#3949ab" },
          }}
        >
          Regresar
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
