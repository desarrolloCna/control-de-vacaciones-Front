import axios from "axios";
import { enviroments } from "../../../config/enviroments";

export const getJerarquiaUnidadesService = async (token) => {
    try {
        const url = `${enviroments.apiurl}/unidades/jerarquia`;
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
