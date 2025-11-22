import api from '../../../config/api.js'
import endpoints from '../../../config/endpoints.js'

export const consultarEmpleadosUltimoAnioService = async (idEmpleado) => {
    try {
        const url = idEmpleado 
            ? `${endpoints.GET_EMPLEADOS_ULTIMO_ANIO}?idEmpleado=${idEmpleado}`
            : endpoints.GET_EMPLEADOS_ULTIMO_ANIO;
            
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};