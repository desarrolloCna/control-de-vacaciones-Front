import { useEffect, useState } from "react";
import { getLocalStorageData } from "../../services/session/getLocalStorageData.js";
import { consultarDiasDebitadosServices, consultarDiasDisponiblesServices, consultarDiasSolicitadosPorAnioServices } from "../../services/VacationApp/GetSolicidudById.js";
import dayjs from "dayjs";


export function useGetDiasSolicitados() {
  const [diasSolicitados, setDiasSolicitados] = useState([]); // Corregido el nombre
  const [errorD, setErrorD] = useState(null);
  const [loadingD, setLoadingD] = useState(true);
  const [diasDebitados, setDiasDebitados] = useState(0);
  const [diasDisponiblesT, setDiasDisponiblesT] = useState(0);

  useEffect(() => {
    const fetchDiasSolicitados = async () => {
      try {
        const userData = getLocalStorageData();
        if (!userData || !userData.idEmpleado) {
          throw new Error("Sin datos en localStorage.");
        }

        const anioEnCurso = dayjs().year();


        const { idEmpleado } = userData;
        const data = await consultarDiasSolicitadosPorAnioServices(idEmpleado, anioEnCurso);
        setDiasSolicitados(data); // Establecer la cantidad de solicitudes enviadas
        
        const diasDebitados = await consultarDiasDebitadosServices(idEmpleado, anioEnCurso);
        setDiasDebitados( parseInt(diasDebitados.diasDebitados));

        const diasDisponibles = await consultarDiasDisponiblesServices(idEmpleado);
        setDiasDisponiblesT( parseInt(diasDisponibles.diasDisponibles));

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
  }, []); // Corregido: dependencias vacías para evitar llamadas innecesarias

  return { diasSolicitados, errorD, loadingD, diasDebitados, diasDisponiblesT };
}
