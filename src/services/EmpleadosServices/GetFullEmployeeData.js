import api from "../../config/api";
import endpoints from "../../config/endpoints";

export const getFullEmployeeData = async (idInfoPersonal) => {
    const fetchData = async (url) => {
        try {
            const res = await api.get(url);
            return res.data;
        } catch (error) {
            console.warn(`Error fetching ${url}:`, error?.response?.status || error.message);
            return null;
        }
    };

    const [personalRes, laboralRes, nivelRes, pertenenciaRes, medicosRes, familiaresRes, dpiRes] = await Promise.all([
        fetchData(`${endpoints.getInfoPeresonal}/${idInfoPersonal}`),
        fetchData(`${endpoints.GET_DATOS_LABORALES}/${idInfoPersonal}`),
        fetchData(`${endpoints.GET_NIVEL_ACADEMICO}/${idInfoPersonal}`),
        fetchData(`${endpoints.GET_DATOS_SOLI}/${idInfoPersonal}`),
        fetchData(`${endpoints.GET_DATOS_MEDIOS}/${idInfoPersonal}`),
        fetchData(`${endpoints.GET_FAMILIARES}/${idInfoPersonal}`),
        fetchData(`${endpoints.getInfoDpi}/${idInfoPersonal}`)
    ]);

    const extract = (res, ...keys) => {
        if (!res) return null;
        for (const k of keys) {
            if (res[k]) return res[k];
            if (res.responseData?.[k]) return res.responseData[k];
        }
        return res;
    };

    return {
        personal: extract(personalRes, 'infoPersonal') || {},
        laboral: extract(laboralRes, 'datosLaborales', 'laboral') || {},
        educativo: extract(nivelRes, 'nivelEducativoInf', 'nivelEducativo') || {},
        sociolinguistico: extract(pertenenciaRes, 'infoSoli', 'pertenenciaSociolinguistica') || {},
        medicos: extract(medicosRes, 'datosMedicos', 'medicos') || {},
        familiares: extract(familiaresRes, 'familiares') || [],
        dpi: extract(dpiRes, 'dpiData', 'infoDpi', 'dpi') || {},
        idInfoPersonal
    };
};
