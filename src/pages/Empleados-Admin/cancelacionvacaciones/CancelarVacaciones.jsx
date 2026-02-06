import { useState } from "react";
import { useGetSolicitudesAutorizadas } from "../../../hooks/SolicitudesAtuorizadas/useGetSolicituesAutorizadas";
import "./CancelacionVacaciones.styles.css";
import Navbar from "../../../components/navBar/NavBar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { formatDateTime, formatDate, getSolicitudes, handleCancelarSolicitud, handleCloseModal, handleViewDetails } from "./CancelacionVacaciones.utils";

// Configurar dayjs en español
dayjs.locale("es");

const CancelacionVacaciones = () => {
    const { solicitudesAutorizadas, error, loading, setSolicitudesAutorizadas } = useGetSolicitudesAutorizadas();
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const solicitudes = getSolicitudes(solicitudesAutorizadas);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="cancelacion-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Cargando solicitudes...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="cancelacion-container">
                    <div className="error-message">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>Error al cargar las solicitudes: {error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="cancelacion-container">
                <div className="cancelacion-header">
                    <h1>Cancelación de Vacaciones</h1>
                    <p className="subtitle">Gestiona las solicitudes de vacaciones autorizadas</p>
                </div>

                {solicitudes.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <h3>No hay solicitudes autorizadas</h3>
                        <p>Actualmente no existen solicitudes de vacaciones para cancelar</p>
                    </div>
                ) : (
                    <div className="solicitudes-grid">
                        {solicitudes.map((solicitud) => (
                            <div key={solicitud.idSolicitud} className="solicitud-card">
                                <div className="card-header">
                                    <div className="employee-info">
                                        <h3>{solicitud.nombres}</h3>
                                        <p className="puesto">{solicitud.puesto}</p>
                                    </div>
                                    <button
                                        className="btn-view-details"
                                        onClick={() => handleViewDetails(
                                            solicitud, 
                                            setSelectedSolicitud, 
                                            setIsModalOpen, 
                                            setCancelError, 
                                            setSuccessMessage
                                        )}
                                        aria-label="Ver detalles"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </button>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="label">Unidad:</span>
                                        <span className="value">{solicitud.unidad}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Período:</span>
                                        <span className="value">
                                            {formatDate(solicitud.fechaInicioVacaciones)} - {formatDate(solicitud.fechaFinVacaciones)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Días solicitados:</span>
                                        <span className="value days-badge">{solicitud.cantidadDiasSolicitados}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Detalles */}
                {isModalOpen && selectedSolicitud && (
                    <div className="modal-overlay" onClick={() => handleCloseModal(
                        setIsModalOpen, 
                        setSelectedSolicitud, 
                        setCancelError, 
                        setSuccessMessage
                    )}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Detalles de la Solicitud</h2>
                                <button className="btn-close" onClick={() => handleCloseModal(
                                    setIsModalOpen, 
                                    setSelectedSolicitud, 
                                    setCancelError, 
                                    setSuccessMessage
                                )}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body">
                                {successMessage && (
                                    <div className="success-alert">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        {successMessage}
                                    </div>
                                )}

                                {cancelError && (
                                    <div className="error-alert">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="15" y1="9" x2="9" y2="15"></line>
                                            <line x1="9" y1="9" x2="15" y2="15"></line>
                                        </svg>
                                        {cancelError}
                                    </div>
                                )}

                                <div className="detail-section">
                                    <h3>Información del Empleado</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Nombre completo:</span>
                                            <span className="detail-value">{selectedSolicitud.nombres}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Puesto:</span>
                                            <span className="detail-value">{selectedSolicitud.puesto}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Unidad:</span>
                                            <span className="detail-value">{selectedSolicitud.unidad}</span>
                                        </div>
                                        {selectedSolicitud.coordinacion && (
                                            <div className="detail-item">
                                                <span className="detail-label">Coordinación:</span>
                                                <span className="detail-value">{selectedSolicitud.coordinacion}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Detalles de Vacaciones</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Fecha de inicio:</span>
                                            <span className="detail-value">{formatDate(selectedSolicitud.fechaInicioVacaciones)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Fecha de fin:</span>
                                            <span className="detail-value">{formatDate(selectedSolicitud.fechaFinVacaciones)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Retorno a labores:</span>
                                            <span className="detail-value">{formatDate(selectedSolicitud.fechaRetornoLabores)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Días solicitados:</span>
                                            <span className="detail-value highlight">{selectedSolicitud.cantidadDiasSolicitados} días</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Información de Autorización</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Coordinador:</span>
                                            <span className="detail-value">{selectedSolicitud.nombreCoordinador}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Fecha de solicitud:</span>
                                            <span className="detail-value">{formatDateTime(selectedSolicitud.fechaSolicitud)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Estado:</span>
                                            <span className="status-badge">{selectedSolicitud.estadoSolicitud}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => handleCloseModal(
                                        setIsModalOpen, 
                                        setSelectedSolicitud, 
                                        setCancelError, 
                                        setSuccessMessage
                                    )}
                                    disabled={isCancelling}
                                >
                                    Cerrar
                                </button>
                                <button 
                                    className="btn-danger" 
                                    onClick={() => handleCancelarSolicitud(
                                        selectedSolicitud, 
                                        setIsModalOpen, 
                                        setSelectedSolicitud, 
                                        setCancelError, 
                                        setSuccessMessage, 
                                        setIsCancelling, 
                                        setSolicitudesAutorizadas
                                    )}
                                    disabled={isCancelling || successMessage}
                                >
                                    {isCancelling ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            Cancelando...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                                <line x1="9" y1="9" x2="15" y2="15"></line>
                                            </svg>
                                            Cancelar Solicitud
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CancelacionVacaciones;