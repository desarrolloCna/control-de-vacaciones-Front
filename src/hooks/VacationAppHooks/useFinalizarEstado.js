import { useEffect, useState } from "react";
import { validarFechaFin } from "../../services/utils/dates/vacationUtils";
import { debitarDiasService } from "../../services/VacationApp/Historial/ControlDiasVacaciones.service";

export const useFinalizarEstado = (solicitud, setSolicitud) => {
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const actualizarEstadoSolicitud = async (solicitud) => {
      try {
        setLoadingEstado(true);
        setHasProcessed(true); // Marcar como procesado

        const response = await debitarDiasService(solicitud);

        if (response.responseData.status === 200) {
          setSolicitud(prev => ({
            ...prev,
            estadoSolicitud: "finalizadas"
          }));
        }

      } catch (error) {
        console.error("Error:", error);
        setHasProcessed(false); // Permitir reintento en caso de error
      } finally {
        setLoadingEstado(false);
      }
    };

    // Verificar si la solicitud es autorizada, si la fecha es válida y si no ha sido procesada
    if (solicitud && 
        solicitud.estadoSolicitud?.toLowerCase() === "autorizadas" &&
        !hasProcessed) {
      
      const fechaFinVacaciones = solicitud.fechaFinVacaciones;

      if (validarFechaFin(fechaFinVacaciones)) {
        actualizarEstadoSolicitud(solicitud);
      }
    }
  }, [solicitud, setSolicitud, hasProcessed]);

  return { loadingEstado };
};