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
            
            // Generar Boleta Automáticamente
            setTimeout(() => {
                generarBoletaCancelacionPDF(selectedSolicitud, diasGozados, motivo);
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

export const generarBoletaCancelacionPDF = (solicitud, diasGozados, motivo) => {
    import("jspdf").then(({ default: jsPDF }) => {
        const doc = new jsPDF("portrait", "pt", "letter");
        
        // Título del documento
        doc.setFontSize(16);
        doc.setTextColor(26, 35, 126); // Azul institucional
        doc.text("Consejo Nacional de Adopciones", 40, 40);
        doc.setFontSize(14);
        doc.text("Boleta de Cancelación Parcial de Vacaciones", 40, 60);
        
        doc.setFontSize(11);
        doc.setTextColor(0);
        
        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 40, 90);
        
        // Datos del Empleado
        doc.setFont(undefined, 'bold');
        doc.text("Datos del Empleado:", 40, 120);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${solicitud.nombres}`, 40, 140);
        doc.text(`Puesto: ${solicitud.puesto}`, 40, 155);
        doc.text(`Unidad: ${solicitud.unidad}`, 40, 170);
        
        // Datos de la Cancelación
        doc.setFont(undefined, 'bold');
        doc.text("Detalle de Cancelación:", 40, 200);
        doc.setFont(undefined, 'normal');
        
        const diasSolicitados = parseInt(solicitud.cantidadDiasSolicitados) || 0;
        const gozados = parseInt(diasGozados) || 0;
        const devueltos = diasSolicitados - gozados;
        
        doc.text(`Período Original: ${formatDate(solicitud.fechaInicioVacaciones)} al ${formatDate(solicitud.fechaFinVacaciones)}`, 40, 220);
        doc.text(`Días Originalmente Solicitados: ${diasSolicitados}`, 40, 235);
        
        doc.setFont(undefined, 'bold');
        doc.text(`Días Gozados: ${gozados}`, 40, 255);
        doc.text(`Días Devueltos al Balance: ${devueltos}`, 40, 270);
        doc.setFont(undefined, 'normal');
        
        doc.text(`Motivo de Cancelación:`, 40, 300);
        
        // Wrap text for reason
        const splitMotivo = doc.splitTextToSize(motivo || "Cancelación parcial", 500);
        doc.text(splitMotivo, 40, 315);
        
        // Firmas
        doc.line(80, 500, 250, 500);
        doc.text("Firma del Empleado", 110, 515);
        
        doc.line(350, 500, 520, 500);
        doc.text("Firma RRHH", 400, 515);
        
        doc.save(`Boleta_Cancelacion_${solicitud.nombres.replace(/\s+/g, "_")}.pdf`);
    }).catch(err => console.error("Error cargando jsPDF", err));
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
