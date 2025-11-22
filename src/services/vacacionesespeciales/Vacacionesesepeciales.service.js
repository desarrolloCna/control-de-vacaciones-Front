import api from "../../config/api";
import { endpoints, endpointsPost } from "../../config/endpoints";


export const registrarVacacionesEspeciales = async (data) => {
  try {
    const response = await api.post(
      `${endpointsPost.POST_REGISTRA_VACACIONES_ESPECIALES}`,
      data
    );
    return response.data.responseData;
  } catch (error) {
    console.log(error)
    throw error;
  }
};

export const consultarGestionVacacionesEspecialesService = async (idEmpleado, fechaEnCurso) => {
    try {
        const response = await api.get(`${endpoints.GET_GESTION_VAC_ESPECIALES}?idEmpleado=${idEmpleado}&fechaEnCurso=${fechaEnCurso}`);
      return response.data.vacacionesEspeciales;
    } catch (error) {
      throw error;
    }
};
