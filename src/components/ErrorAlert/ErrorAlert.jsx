import React from "react";
import { Alert } from "@mui/material";

export default function ErrorAlert({ message, visible }) {
  // Función para extraer el mensaje de error
  const getErrorMessage = (error) => {

    if (error.codRes === 500 && error.message === "") {
      return "Error interno del servidor";
    }

    if (!error) return "Error desconocido";
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
      // Si es un objeto con propiedad message
      if (error.message) return error.message;
      // Si es un objeto con propiedad codRes y message (como en tu error original)
      if (error.codRes && error.message) return error.message;
      // Para otros objetos, convertimos a string
      return JSON.stringify(error);
    }
    return String(error); // Para otros tipos (números, etc.)
  };

  if (!visible) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {getErrorMessage(message)}
    </Alert>
  );
}