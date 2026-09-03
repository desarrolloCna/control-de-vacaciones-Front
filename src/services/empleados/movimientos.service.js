import api from "../../config/api";

export const cambiarPuestoEmpleado = async (payload) => {
    try {
        const response = await api.post("/movimientos/cambio-puesto", payload);
        return response.data;
    } catch (error) {
        console.error("Error al cambiar puesto de empleado:", error);
        throw error;
    }
};

export const darBajaEmpleado = async (payload) => {
    try {
        const response = await api.post("/movimientos/baja-empleado", payload);
        return response.data;
    } catch (error) {
        console.error("Error al dar de baja al empleado:", error);
        throw error;
    }
};
