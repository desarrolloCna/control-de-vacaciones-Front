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

    const response = await api.get(`${endpoints.GET_DIAS_DISPONIBLES}?idEmpleado=${idEmpleado}&anio=${anio}`);
    return  response.data.diasSolicitados;
  }catch(error){  
    throw error;
  }
}

export const consultarDiasDebitadosServices = async (idEmpleado, anioEnCurso) => {
  try{
    const response = await api.get(`${endpoints.GET_DIAS_DEBITADOS}?idEmpleado=${idEmpleado}&anio=${anioEnCurso}`);
    return  response.data.diasDisponibles;
  }catch(error){  
    throw error;
  }
}

export const consultarDiasDisponiblesServices = async (idEmpleado) => {
  try{
    const response = await api.get(`${endpoints.GET_DIAS_DISPONIBLES}?idEmpleado=${idEmpleado}`);
    return  response.data.diasDisponibles;
  }catch(error){  
    throw error;
  }
}

export const consultarSolicitudesPorEmpleadoServices = async (idEmpleado) => {
  try{
    const response = await api.get(`${endpoints.GET_SOLICITUDES_POR_EMPLEADO}?idEmpleado=${idEmpleado}`);
    return  response.data.solicitudes;
  }catch(error){  
    throw error;
  }
}
