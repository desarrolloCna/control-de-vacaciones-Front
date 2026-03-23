import { useEffect, useState } from "react";
import { consultarVacacionesAutorizadasServices } from "../../services/CacelacionVacaciones/CancelacionVacaciones.service";

export function useGetSolicitudesAutorizadas() {
  const [solicitudesAutorizadas, setSolicitudesAutorizadas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudesAutorizadas = async () => {
      try {
        const data = await consultarVacacionesAutorizadasServices();
        setSolicitudesAutorizadas(data);
      } catch (error) {
        // Verifica si error existe y tiene una propiedad message
        if (error && error.message && !error.response ){
          setError("Servicio no disponible, intente más tarde");
        }
        // Verifica si error.response existe y tiene data con responseData
        else if (
          error &&
          error.response 
        ) {
          setError(error.response.data.responseData);
        }
        // Maneja otros casos generales de error
        else {
          setError("Ocurrió un error!!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudesAutorizadas();
  }, []);

  return { solicitudesAutorizadas, error, loading, setSolicitudesAutorizadas };
}

