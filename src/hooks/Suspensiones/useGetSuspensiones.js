import { useEffect, useState, useCallback } from "react";
import { GetSuspensiones } from "../../services/EmpleadosServices/Suspensiones/Suspensiones.service";

export function useGetSuspensiones() {
  const [suspensiones, setSuspensiones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSuspensiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await GetSuspensiones();
      setSuspensiones(data);
    } catch (error) {
      if (error && error.message && !error.response ){
        setError("Servicio no disponible, intente más tarde");
      }
      else if (
        error &&
        error.response 
      ) {
        setError(error.response.data.responseData);
      }
      else {
        setError("Ocurrió un error!!");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuspensiones();
  }, [fetchSuspensiones]);

  return { suspensiones, error, loading, refetch: fetchSuspensiones };
}
