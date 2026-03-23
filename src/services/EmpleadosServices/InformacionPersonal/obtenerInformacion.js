import api from '../../../config/api.js'
import endpoints from '../../../config/endpoints.js'

export const obtenerInformacionPeresonal = async (idInfoPersonal) => {
    try {
        const response = await api.get(`${endpoints.getInfoPeresonal}/${idInfoPersonal}`)
      return response.data.infoPersonal;
    } catch (error) {
      throw error;
    }
  };
  

  export const obtenerInformacionDpi = async (idInfoPersonal) => {
    try {
      const response = await api.get(`${endpoints.getInfoDpi}/${idInfoPersonal}`)
      return response.data.dpiData || response.data.infoDpi || response.data;
    } catch (error) {
      throw error;
    }
  };
  