import { useState, useEffect } from "react";
import { consultarSolicitudesReprogramadasServices } from "../../services/CacelacionVacaciones/CancelacionVacaciones.service";

export const useGetSolicitudesReprogramadas = () => {
    const [solicitudesReprogramadas, setSolicitudesReprogramadas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSolicitudes = async () => {
        try {
            const data = await consultarSolicitudesReprogramadasServices();
            setSolicitudesReprogramadas(data);
            setLoading(false);
        } catch (err) {
            setError(err.message || "Error al obtener las solicitudes reprogramadas");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    return { 
        solicitudesReprogramadas, 
        error, 
        loading, 
        setSolicitudesReprogramadas,
        refreshReprogramadas: fetchSolicitudes
    };
};
