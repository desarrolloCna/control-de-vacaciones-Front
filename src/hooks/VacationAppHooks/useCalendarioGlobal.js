import { useState, useEffect } from "react";
import api from "../../config/api"; // Usamos el interceptor de peticiones oficial con Auth
import endpoints from "../../config/endpoints";
import { getLocalStorageData } from "../../services/session/getLocalStorageData";

export const useCalendarioGlobal = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalendario = async (filtroUnidad = null) => {
    setLoading(true);
    try {
      // Intentamos recuperar datos del empleado logueado desde la memoria caché
      const userData = getLocalStorageData();
      const unidadUsuario = filtroUnidad || userData?.unidad || "Todas";
      const idRol = userData?.idRol || "";
      const puesto = userData?.puesto || "";

      // Añadimos el query string de `unidad`, `idRol` y `puesto`
      const url = `${endpoints.GET_CALENDARIO_VACACIONES}?unidad=${encodeURIComponent(unidadUsuario)}&idRol=${encodeURIComponent(idRol)}&puesto=${encodeURIComponent(puesto)}`;
      const response = await api.get(url);
      
      if (response.data && response.data.data) {
        setEventos(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar el calendario global.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendario();
  }, []);

  return { eventos, loading, error, fetchCalendario };
};
