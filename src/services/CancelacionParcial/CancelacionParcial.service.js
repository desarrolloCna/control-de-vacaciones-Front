import api from "../../config/api";

export const cancelarSolicitudParcialServices = async (payload) => {
    try {
        const response = await api.put("/api/administracionvacaciones/cancelarSolicitudParcial", payload);

        return response.data;
    } catch (error) {
        console.error("Error al cancelar la solicitud parcialmente:", error);
        throw error.response?.data || { message: "Error desconocido al procesar la cancelación" };
    }
};
