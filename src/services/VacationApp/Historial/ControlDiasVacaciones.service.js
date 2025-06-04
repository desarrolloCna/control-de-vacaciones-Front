import { endpoints,  endpointsPost } from "../../../config/endpoints.js";
import api from "../../../config/api.js";

export const acreditarDiasService = async (dataAcreditarDias) => {
  try {
    const response = await api.post(
      `${endpointsPost.POST_ACREDITARDIAS}`,
      dataAcreditarDias
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const obtenerHistorialService = async (idEmpleado) => {
  try {
    const response = await api.get(
      `${endpoints.GET_HISTORIAL}?idEmpleado=${idEmpleado}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const debitarDiasService = async (dataDebitarDias) => {
  try {
    const response = await api.post(`${endpointsPost.POST_DEBITARDIAS}`,dataDebitarDias);
    return response.data;
  } catch (error) {
    throw error;
  }
};
