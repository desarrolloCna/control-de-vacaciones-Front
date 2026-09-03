import { useEffect, useState } from "react";
import { getLocalStorageData } from "../../services/session/getLocalStorageData.js";
import { consultarDiasDebitadosServices, consultarDiasDisponiblesServices, consultarDiasSolicitadosPorAnioServices } from "../../services/VacationApp/GetSolicidudById.js";
import dayjs from "dayjs";


export function useGetDiasSolicitados() {
  const [diasSolicitados, setDiasSolicitados] = useState([]); // Corregido el nombre
  const [errorD, setErrorD] = useState(null);
  const [loadingD, setLoadingD] = useState(true);
  
  // Legacy states (kept for compatibility)
  const [diasDebitados, setDiasDebitados] = useState(0);
  const [diasDisponiblesT, setDiasDisponiblesT] = useState(0);

  // New states
  const [periodoActualData, setPeriodoActualData] = useState(null);
  const [globalData, setGlobalData] = useState(null);

  useEffect(() => {
    const fetchDiasSolicitados = async () => {
      try {
        const userData = getLocalStorageData();
        if (!userData || !userData.idEmpleado) {
          throw new Error("Sin datos en localStorage.");
        }

        const anioEnCurso = dayjs().year();


        const { idEmpleado } = userData;
        
        // This is legacy / unnecessary since the data is now in consultarDiasDisponiblesServices
        const data = await consultarDiasSolicitadosPorAnioServices(idEmpleado, anioEnCurso);
        setDiasSolicitados(data); 
        
        // Fetch everything from the central backend endpoint
        const diasDisponiblesResponse = await consultarDiasDisponiblesServices(idEmpleado);
        
        if (diasDisponiblesResponse) {
          setPeriodoActualData(diasDisponiblesResponse.periodoActual);
          setGlobalData(diasDisponiblesResponse.global);
          
          // Legacy mappings for backwards compatibility
          setDiasDisponiblesT(parseInt(diasDisponiblesResponse.diasDisponibles || 0));
        }
        
        const debitadosLegacy = await consultarDiasDebitadosServices(idEmpleado, anioEnCurso);
        setDiasDebitados(parseInt(debitadosLegacy.diasDebitadosTotales || debitadosLegacy.diasDebitados || 0));

      } catch (error) {
        if (error?.message && !error.response) {
            setErrorD("Servicio no disponible, intente más tarde");
        } else if (error?.response?.data?.responseData) {
            setErrorD(error.response.data.responseData);
        } else {
            setErrorD("Ocurrió un error!!");
        }
      } finally {
        setLoadingD(false);
      }
    };

    fetchDiasSolicitados();
  }, []); 

  return { diasSolicitados, errorD, loadingD, diasDebitados, diasDisponiblesT, periodoActualData, globalData };
}
