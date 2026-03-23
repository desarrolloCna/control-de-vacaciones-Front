import { useState, useEffect } from 'react';
import api from '../../config/api';
import { endpoints, endpointsPost, endpointsPut, endpointsDelete } from '../../config/endpoints';

export const useDiasFestivosAdmin = () => {
  const [diasFestivos, setDiasFestivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiasFestivos = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.GET_DIAS_FESTIVOS_C);
      setDiasFestivos(response.data.diasFestivos || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar días festivos');
    } finally {
      setLoading(false);
    }
  };

  const createDiaFestivo = async (data) => {
    try {
      await api.post(endpointsPost.POST_DIASFESTIVOS, data);
      await fetchDiasFestivos();
      return true;
    } catch (err) {
      console.error("AXIOS POST ERROR:", err);
      setError(`Error POST: ${err.message || ''} | Res: ${err.response?.data?.error || err.response?.data?.message || 'No Res'}`);
      return false;
    }
  };

  const updateDiaFestivo = async (id, data) => {
    try {
      await api.put(`${endpointsPut.PUT_DIASFESTIVOS_BASE}/${id}`, data);
      await fetchDiasFestivos();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar día festivo');
      return false;
    }
  };

  const deleteDiaFestivo = async (id) => {
    try {
      await api.delete(`${endpointsDelete.DELETE_DIASFESTIVOS_BASE}/${id}`);
      await fetchDiasFestivos();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar día festivo');
      return false;
    }
  };

  useEffect(() => {
    fetchDiasFestivos();
  }, []);

  return {
    diasFestivos,
    loading,
    error,
    createDiaFestivo,
    updateDiaFestivo,
    deleteDiaFestivo,
    refetch: fetchDiasFestivos
  };
};
