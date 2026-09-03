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

export const handleCancelarSolicitudParcial = async (selectedSolicitud, diasGozados, motivo, tipoCancelacion, fechaReintegro, setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage, setIsCancelling, setSolicitudesAutorizadas, refreshCanceladas) => {
        if (!selectedSolicitud) return;

        setIsCancelling(true);
        setCancelError(null);
        setSuccessMessage(null);

        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        const payload = {
            idSolicitud: selectedSolicitud.idSolicitud,
            diasGozados: parseInt(diasGozados),
            motivo: motivo,
            tipoCancelacion: tipoCancelacion,
            fechaReintegro: tipoCancelacion === "Reintegro" ? fechaReintegro : null,
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
            
            // Generar Boleta Automáticamente
            setTimeout(() => {
                generarBoletaCancelacionPDF(selectedSolicitud, diasGozados, motivo, tipoCancelacion, fechaReintegro);
            }, 1000);

        } catch (err) {
            setCancelError(err.message || "Error al cancelar la solicitud parcialmente");
        } finally {
            setIsCancelling(false);
            setTimeout(() => {
                handleCloseModal(setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage);
            }, 3000);
        }
};

export const generarBoletaCancelacionPDF = async (solicitud, tipo = "") => {
    // Ya no generamos el PDF básico en el frontend, sino que llamamos al endpoint del backend
    // que tiene toda la estructura oficial y firmas.
    try {
        const { default: api } = await import("../../../config/api");
        const urlReq = tipo ? `/descargarInformePDF/${solicitud.idSolicitud}/${solicitud.idEmpleado}?tipo=${tipo}` : `/descargarInformePDF/${solicitud.idSolicitud}/${solicitud.idEmpleado}`;
        const response = await api.get(urlReq, {
            responseType: 'blob'
        });
        
        const fileName = `Boleta_${tipo || 'Cancelacion'}_${solicitud.nombres?.replace(/\s+/g, "_") || solicitud.idSolicitud}.pdf`;
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        
        const pdfWindow = window.open("", "_blank");
        if (pdfWindow) {
            pdfWindow.document.write(
                `<html><head><title>${fileName}</title><style>body { margin: 0; overflow: hidden; } iframe { width: 100vw; height: 100vh; border: none; }</style></head>
                 <body><iframe src="${url}"></iframe></body></html>`
            );
            pdfWindow.document.close();
        } else {
            console.error("No se pudo abrir la ventana del PDF. Bloqueador de popups activo.");
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (err) {
        console.error("Error al intentar descargar el informe de cancelación", err);
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
