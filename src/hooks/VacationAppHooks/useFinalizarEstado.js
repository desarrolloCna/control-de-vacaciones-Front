import { useEffect, useState, useCallback, useRef } from "react";
import { validarFechaFin } from "../../services/utils/dates/vacationUtils";
import { debitarDiasService } from "../../services/VacationApp/Historial/ControlDiasVacaciones.service";

export const useFinalizarEstado = (solicitudesEmpleado, setSolicitudesEmpleado) => {
  const [loadingEstado, setLoadingEstado] = useState(false);
  const processedIds = useRef(new Set());

  const procesarSolicitudes = useCallback(async () => {
    if (!solicitudesEmpleado || solicitudesEmpleado.length === 0) return;

    // Filtrar solo las solicitudes que necesitan ser procesadas
    const solicitudesPendientes = solicitudesEmpleado.filter(solicitud => {
      const esAutorizada = solicitud.estadoSolicitud?.toLowerCase() === "autorizadas";
      const noEstaProcesada = !processedIds.current.has(solicitud.idSolicitud);
      const fechaValida = validarFechaFin(solicitud.fechaFinVacaciones);
      
      return esAutorizada && noEstaProcesada && fechaValida;
    });

    // Si no hay solicitudes pendientes, no hacer nada
    if (solicitudesPendientes.length === 0) return;

    setLoadingEstado(true);

    try {
      // Procesar todas las solicitudes pendientes en paralelo
      const promesas = solicitudesPendientes.map(async (solicitud) => {
        try {
          const response = await debitarDiasService(solicitud);
          
          if (response.responseData.status === 200) {
            // Marcar como procesada
            processedIds.current.add(solicitud.idSolicitud);
            return { idSolicitud: solicitud.idSolicitud, success: true };
          }
          return { idSolicitud: solicitud.idSolicitud, success: false };
        } catch (error) {
          console.error(`Error procesando solicitud ${solicitud.idSolicitud}:`, error);
          return { idSolicitud: solicitud.idSolicitud, success: false };
        }
      });

      const resultados = await Promise.allSettled(promesas);

      // Actualizar el estado solo con las solicitudes exitosas
      const idsExitosos = resultados
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value.idSolicitud);

      if (idsExitosos.length > 0) {
        setSolicitudesEmpleado(prev => 
          prev.map(solicitud => 
            idsExitosos.includes(solicitud.idSolicitud)
              ? { ...solicitud, estadoSolicitud: "finalizadas" }
              : solicitud
          )
        );
      }

    } catch (error) {
      console.error("Error general en procesamiento:", error);
    } finally {
      setLoadingEstado(false);
    }
  }, [solicitudesEmpleado, setSolicitudesEmpleado]);

  useEffect(() => {
    procesarSolicitudes();
  }, [procesarSolicitudes]);

  return { loadingEstado };
};