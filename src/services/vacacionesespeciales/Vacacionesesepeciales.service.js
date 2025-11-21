import api from "../../config/api";
import { endpointsPost } from "../../config/endpoints";


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
