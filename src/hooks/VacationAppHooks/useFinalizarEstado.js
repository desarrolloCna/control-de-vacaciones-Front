import { useEffect, useState } from "react";
import { validarFechaFin } from "../../services/utils/dates/vacationUtils"; // Ajusta la ruta según tu proyecto
import { debitarDiasService } from "../../services/VacationApp/Historial/ControlDiasVacaciones.service";

export const useFinalizarEstado = (solicitud, setSolicitud) => {
  const [loadingEstado, setLoadingEstado] = useState(false);

  useEffect(() => {

    const actualizarEstadoSolicitud = async (solicitud) => {

      try {
        setLoadingEstado(true);

        const response = await debitarDiasService(solicitud);

        if(response.responseData.status === 200){
          setSolicitud(prev => ({
            ...prev,
            estadoSolicitud: "finalizadas"
          }));
        }

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoadingEstado(false);
      }
    };

    // Verificar si la solicitud es autorizada y si la fecha es válida
    if (solicitud && solicitud.estadoSolicitud.toLowerCase() === "autorizadas") {
      const fechaFinVacaciones = solicitud.fechaFinVacaciones;

      if (validarFechaFin(fechaFinVacaciones)) {
        actualizarEstadoSolicitud(solicitud);
      }
    }
  }, [solicitud]); // Dependencia: vuelve a ejecutar si cambia `solicitud`

  return {loadingEstado}
};
