import { useEffect, useState } from "react";
import api from "../../config/api";

export const useGetSolicitudesCanceladas = () => {
    const [solicitudesCanceladas, setSolicitudesCanceladas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No hay token de autenticación");
            }
            const res = await api.get("/api/administracionvacaciones/consultarSolicitudesCanceladas", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSolicitudesCanceladas(res.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener solicitudes canceladas:", err);
            setError(err.response?.data?.message || err.message || "Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    return { 
        solicitudesCanceladas, 
        loading, 
        error, 
        refreshCanceladas: fetchSolicitudes 
    };
};
