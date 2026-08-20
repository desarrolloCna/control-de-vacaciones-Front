import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getLocalStorageData } from "../../services/session/getLocalStorageData";

const ProtectedRoute = ({ allowedRoles, allowedPuestos }) => {
  const userData = getLocalStorageData();

  if (!userData) {
    // Si no hay sesión activa, redirigir al login
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(userData.idRol)) {
    // Si el usuario no tiene el rol permitido
    return <Navigate to="/access-denied" />;
  }

  if (allowedPuestos) {
    const userPuesto = (userData.puesto || "").toUpperCase();
    const hasAllowedPuesto = allowedPuestos.some(puesto => userPuesto.includes(puesto.toUpperCase()));
    if (!hasAllowedPuesto) {
      return <Navigate to="/access-denied" />;
    }
  }

  // Renderizar los componentes hijos si pasa las validaciones
  return <Outlet />;
};

export default ProtectedRoute;