import api from "../../config/api.js";
import endpoints from "../../config/endpoints.js";

export const getSolicitudes = async (idCoordinador, idRol) => {
  try {
      const response = await api.get(`${endpoints.GET_SOLICITUDES_VACACIONES}?idCoordinador=${idCoordinador}&idRol=${idRol}`);
      return response.data.solicitudes;
  } catch (error) {
      // Manejar el error, pero no registrar en la consola
      if (error.response) {
          // Puedes optar por lanzar un error personalizado o un mensaje más amigable
          throw new Error("Hubo un problema al obtener las solicitudes.");
      } else {
          throw error; // Lanza otros errores que no tengan respuesta
      }
  }
};
