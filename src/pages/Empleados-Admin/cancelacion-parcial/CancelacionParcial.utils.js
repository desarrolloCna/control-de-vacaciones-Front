import dayjs from "dayjs";
import { cancelarSolicitudParcialServices } from "../../../services/CancelacionParcial/CancelacionParcial.service";

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

export const handleCancelarSolicitudParcial = async (selectedSolicitud, diasGozados, motivo, setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage, setIsCancelling, setSolicitudesAutorizadas, refreshCanceladas) => {
        if (!selectedSolicitud) return;

        setIsCancelling(true);
        setCancelError(null);
        setSuccessMessage(null);

        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        const payload = {
            idSolicitud: selectedSolicitud.idSolicitud,
            diasGozados: parseInt(diasGozados),
            motivo: motivo,
            idUsuarioSession: userData?.idUsuario || userData?.idEmpleado,
            usuarioSession: userData?.usuario || "Admin"
        };

        try {
            await cancelarSolicitudParcialServices(payload);

            setSuccessMessage("Solicitud cancelada parcialmente. Días devueltos correctamente.");
            
            // Actualizar la lista de solicitudes autorizadas
            setSolicitudesAutorizadas(prev => prev.filter(s => s.idSolicitud !== selectedSolicitud.idSolicitud));
            if(refreshCanceladas) {
                refreshCanceladas();
            }
            
        } catch (err) {
            setCancelError(err.message || "Error al cancelar la solicitud parcialmente");
        } finally {
            setIsCancelling(false);
            // We don't close the modal immediately so they can read the success message.
            setTimeout(() => {
                handleCloseModal(setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage);
            }, 3000);
        }
};

export const getSolicitudes = (solicitudes) => {
        if (!solicitudes) return [];
        if (Array.isArray(solicitudes)) {
            return solicitudes;
        }
        if (solicitudes.solicitudes && Array.isArray(solicitudes.solicitudes)) {
            return solicitudes.solicitudes;
        }
        return [];
};
