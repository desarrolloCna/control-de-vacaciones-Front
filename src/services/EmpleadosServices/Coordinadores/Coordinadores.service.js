import api from "../../../config/api.js";
import endpoints from "../../../config/endpoints.js";

export const obtenerCoordinadoresList = async () => {
    try {
        const response = await api.get(`${endpoints.GET_COORDINADORES_LIST}`)
      return response.data.coordinadores;
    } catch (error) {
      throw error;
    }
};