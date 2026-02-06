import api from "../../config/api";
import { endpoints, endpointsPost, endpointsPut } from "../../config/endpoints";


export const consultarVacacionesAutorizadasServices = async () => {
    try {
        const response = await api.get(`${endpoints.GET_SOLICITUDES_AUTORIZADAS}`);
      return response.data.solicitudes;
    } catch (error) {
      throw error;
    }
};


export const cancelarAutorizacionServices = async (payload) => {
    try{
        const response = await api.put(endpointsPut.PUT_CANCELAR_SOLICITUD, payload);
        console.log('response', response); 
        return response.data;
    }catch(error){
        console.log('error', error); 
        throw error;
    }
}

