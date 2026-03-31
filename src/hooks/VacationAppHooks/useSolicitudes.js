import { useEffect, useState, useCallback } from "react";
import { getLocalStorageData } from "../../services/session/getLocalStorageData.js";
import { getSolicitudes } from "../../services/VacationApp/GetSolicitudes.service.js";


export function useSolicitudes() {
  const [solicitudesU, setSolicitudesU] = useState([]);
  const [errorU, setErrorU] = useState(null);
  const [loadingU, setLoadingU] = useState(true);
  const [cantadSolicitudes, setCanidadSolicitudes] = useState(null);

  const fetchSolicitudes = useCallback(async () => {
    setLoadingU(true);
    setErrorU(null);
    try {
      const userData = getLocalStorageData();
      if (!userData || !userData.unidad) {
        throw new Error("Sin datos en localStorage.");
      }

      const { idCoordinador } = userData;
      const data = await getSolicitudes(idCoordinador);
        
      const cantidadEnviadas = data.filter(solicitud => solicitud.estadoSolicitud === 'enviada').length;
      setCanidadSolicitudes(cantidadEnviadas);

      setSolicitudesU(data);
    } catch (error) {
      if (error?.message && !error.response) {
          setErrorU("Servicio no disponible, intente más tarde");
      } else if (error?.response?.data?.responseData) {
          setErrorU(error.response.data.responseData);
      } else {
          setErrorU("Ocurrió un error!!");
      }
    } finally {
      setLoadingU(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  return { solicitudesU, cantadSolicitudes, errorU, loadingU, refetch: fetchSolicitudes };
}
