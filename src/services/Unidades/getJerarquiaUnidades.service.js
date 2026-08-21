import axios from "axios";
import { API_URL } from "../../config/enviroment";

export const getJerarquiaUnidadesService = async (token) => {
    try {
        const url = `${API_URL}/unidades/jerarquia`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
