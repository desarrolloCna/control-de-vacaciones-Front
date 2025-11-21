import api from '../../../config/api.js'
import endpoints from '../../../config/endpoints.js'

export const consultarEmpleadosUltimoAnioService = async (anioEnCurso) => {
    try {
      const response = await api.get(`${endpoints.GET_EMPLEADOS_ULTIMO_ANIO}?anioEnCurso=${anioEnCurso}`)
      return response.data;
    } catch (error) {
      throw error;
    }
};