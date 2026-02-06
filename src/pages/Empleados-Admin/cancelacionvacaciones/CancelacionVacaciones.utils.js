import dayjs from "dayjs";
import { cancelarAutorizacionServices } from "../../../services/CacelacionVacaciones/CancelacionVacaciones.service";


export const formatDate = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY");
};

export const formatDateTime = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
};

export const handleViewDetails = (solicitud, setSelectedSolicitud, setIsModalOpen, setCancelError, setSuccessMessage) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
    setCancelError(null);
    setSuccessMessage(null);
};

export const handleCloseModal = (setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage) => {
    setIsModalOpen(false);
    setSelectedSolicitud(null);
    setCancelError(null);
    setSuccessMessage(null);
};

export const handleCancelarSolicitud = async (selectedSolicitud, setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage, setIsCancelling, setSolicitudesAutorizadas) => {
        if (!selectedSolicitud) return;

        setIsCancelling(true);
        setCancelError(null);
        setSuccessMessage(null);

        // Formatear fecha usando dayjs
        const fechaFormateada = dayjs().format("YYYY-MM-DD HH:mm:ss");

        const payload = {
            idSolicitud: selectedSolicitud.idSolicitud,
            fechaResolucion: fechaFormateada
        };

        try {
            await cancelarAutorizacionServices(payload);
            setSuccessMessage("Solicitud cancelada exitosamente");
            
            // Actualizar la lista de solicitudes autorizadas
            setSolicitudesAutorizadas(prev => prev.filter(s => s.idSolicitud !== selectedSolicitud.idSolicitud));
            

        } catch (err) {
            setCancelError(err.message || "Error al cancelar la solicitud");
        } finally {
            handleCloseModal(setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage);
            setIsCancelling(false);
        }
};

    // Determinar el array de solicitudes correcto
export const getSolicitudes = (solicitudes) => {
        if (!solicitudes) return [];
        
        // Si es un array directamente
        if (Array.isArray(solicitudes)) {
            return solicitudes;
        }
        
        // Si tiene una propiedad 'solicitudes'
        if (solicitudes.solicitudes && Array.isArray(solicitudes.solicitudes)) {
            return solicitudes.solicitudes;
        }
        
        // Si tiene otra estructura, ajusta aquí
        return [];
};