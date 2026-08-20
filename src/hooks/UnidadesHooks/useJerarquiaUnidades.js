import { useState, useEffect } from "react";
import { getJerarquiaUnidadesService } from "../../services/Unidades/getJerarquiaUnidades.service";
import { getLocalStorageData } from "../../services/session/getLocalStorageData";

export const useJerarquiaUnidades = () => {
    const [jerarquia, setJerarquia] = useState([]);
    const [loadingJerarquia, setLoadingJerarquia] = useState(true);
    const [errorJerarquia, setErrorJerarquia] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchJerarquia = async () => {
            try {
                setLoadingJerarquia(true);
                const userData = getLocalStorageData();
                const token = userData?.token;
                if (!token) throw new Error("No hay token disponible");

                const data = await getJerarquiaUnidadesService(token);
                if (isMounted) {
                    setJerarquia(data);
                    setErrorJerarquia(null);
                }
            } catch (err) {
                if (isMounted) {
                    setErrorJerarquia("Error al cargar la jerarquía de unidades: " + err.message);
                }
            } finally {
                if (isMounted) setLoadingJerarquia(false);
            }
        };

        fetchJerarquia();
        return () => { isMounted = false; };
    }, []);

    return { jerarquia, loadingJerarquia, errorJerarquia };
};
