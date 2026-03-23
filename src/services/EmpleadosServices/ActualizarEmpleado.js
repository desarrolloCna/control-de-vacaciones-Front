import api from "../../config/api";

export const actualizarDatosLaborales = async (idEmpleado, data) => {
    try {
        const response = await api.put(`/actualizarDatosLaborales/${idEmpleado}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar datos laborales:", error);
        throw error;
    }
};

export const actualizarInfoPersonal = async (idInfoPersonal, data) => {
    try {
        const response = await api.put(`/actualizarInfoPersonal/${idInfoPersonal}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar información personal:", error);
        throw error;
    }
};

export const actualizarDpi = async (idInfoPersonal, data) => {
    try {
        const response = await api.put(`/actualizarDpi/${idInfoPersonal}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar DPI:", error);
        throw error;
    }
};

export const actualizarOtrosDatos = async (idInfoPersonal, data) => {
    try {
        const response = await api.put(`/actualizarOtrosDatos/${idInfoPersonal}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar otros datos:", error);
        throw error;
    }
};
