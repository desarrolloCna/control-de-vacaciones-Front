import api from "../../config/api.js";
import endpoints from "../../config/endpoints.js";

export const getSolicitudById = async (idEmpleado, idInforPersonal) => {
    try {
        const response = await api.get(`${endpoints.GET_SOLICITUDBYID_VACACIONES}?idEmpleado=${idEmpleado}&idInfoPersonal=${idInforPersonal}`);
      return response.data.solicitud;
    } catch (error) {
      throw error;
    }
};

export const consultarDiasSolicitadosPorAnioServices = async (idEmpleado, anio) => {
  try{

    const response = await api.get(`${endpoints.GET_DIAS_SOLICITADOS}?idEmpleado=${idEmpleado}&anio=${anio}`);
    return  response.data.diasSolicitados;
  }catch(error){  
    throw error;
  }
}