import { useEffect, useState } from "react";
import { getLocalStorageData } from "../../services/session/getLocalStorageData.js";
import { obtenerCoordinadoresList } from "../../services/EmpleadosServices/Coordinadores/Coordinadores.service.js";


export function useGetCoordinadoresList() {
    const [coordinadoresList, setCoordinadoresList] = useState(null);
    const [errorCoordinadoresList, setErrorCoordinadoresList] = useState(null);
    const [loadingCoordinadoresList, setLoadingCoordinadoresList] = useState(true);
  
    useEffect(() => {
      const fetchCoordinadoresList = async () => {
        try {
          const userData = getLocalStorageData();
          if (!userData || !userData.idInfoPersonal) {
            throw new Error("ID de empleado no encontrado en el localStorage.");
          }

          const data = await obtenerCoordinadoresList();
          setCoordinadoresList(data);
        } catch (error) {
          // Verifica si error existe y tiene una propiedad message
          if (error && error.message && !error.response ){
            setErrorCoordinadoresList("Servicio no disponible, intente más tarde");
          }
          // Verifica si error.response existe y tiene data con responseData
          else if (
            error &&
            error.response 
          ) {
            setErrorCoordinadoresList(error.response.data.responseData);
          }
          // Maneja otros casos generales de error
          else {
            setErrorCoordinadoresList("Ocurrió un error!!");
          }
        } finally {
          setLoadingCoordinadoresList(false);
        }
      };
  
      fetchCoordinadoresList();
    }, []);
  
    return { coordinadoresList, errorCoordinadoresList, loadingCoordinadoresList };
  }