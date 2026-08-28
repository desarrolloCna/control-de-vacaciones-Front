import { useState } from "react";
import { useGetSolicitudesAutorizadas } from "../../../hooks/SolicitudesAtuorizadas/useGetSolicituesAutorizadas";
import { useGetSolicitudesCanceladas } from "../../../hooks/SolicitudesAtuorizadas/useGetSolicitudesCanceladas";
import "./CancelacionParcial.styles.css";
import Navbar from "../../../components/navBar/NavBar";
import { PageHeader } from "../../../components/UI/UIComponents";
import Swal from 'sweetalert2';
import dayjs from "dayjs";
import "dayjs/locale/es";
import { formatDateTime, formatDate, getSolicitudes, handleCancelarSolicitudParcial, handleCloseModal, handleViewDetails, generarBoletaCancelacionPDF } from "./CancelacionParcial.utils";

// Configurar dayjs en español
dayjs.locale("es");

const CancelacionParcial = () => {
    const { solicitudesAutorizadas, error: errorAutorizadas, loading: loadingAutorizadas, setSolicitudesAutorizadas } = useGetSolicitudesAutorizadas();
    const { solicitudesCanceladas, error: errorCanceladas, loading: loadingCanceladas, refreshCanceladas } = useGetSolicitudesCanceladas();
    
    const [activeTab, setActiveTab] = useState("autorizadas");
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Inputs del modal
    const [diasGozados, setDiasGozados] = useState("");
    const [motivo, setMotivo] = useState("");
    
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    const loading = activeTab === "autorizadas" ? loadingAutorizadas : loadingCanceladas;
    const error = activeTab === "autorizadas" ? errorAutorizadas : errorCanceladas;
    
    const solicitudesCurrent = getSolicitudes(activeTab === "autorizadas" ? solicitudesAutorizadas : solicitudesCanceladas);

    // Filtrar solicitudes por nombre
    const filteredSolicitudes = solicitudesCurrent.filter((solicitud) => {
        if (!searchTerm) return true;
        return solicitud.nombres.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

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
                <PageHeader 
                    title="Cancelación de Vacaciones"
                    subtitle="Cancela vacaciones por suspensión u otros motivos y devuelve los días no gozados al balance"
                />

                {/* Tabs */}
                <div className="tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
                    <button 
                        className={`tab-btn ${activeTab === "autorizadas" ? "active" : ""}`}
                        style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === "autorizadas" ? '2px solid #0056b3' : 'none', fontWeight: activeTab === "autorizadas" ? 'bold' : 'normal', cursor: 'pointer', color: activeTab === "autorizadas" ? '#0056b3' : '#666' }}
                        onClick={() => { setActiveTab("autorizadas"); setSearchTerm(""); }}
                    >
                        Autorizadas
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "historial" ? "active" : ""}`}
                        style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === "historial" ? '2px solid #0056b3' : 'none', fontWeight: activeTab === "historial" ? 'bold' : 'normal', cursor: 'pointer', color: activeTab === "historial" ? '#0056b3' : '#666' }}
                        onClick={() => { setActiveTab("historial"); setSearchTerm(""); }}
                    >
                        Historial de Cancelaciones
                    </button>
                </div>

                {/* Barra de búsqueda */}
                {solicitudesCurrent.length > 0 && (
                    <div className="search-container">
                        <div className="search-wrapper">
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Buscar por nombre del empleado..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {searchTerm && (
                                <button className="clear-search" onClick={clearSearch} aria-label="Limpiar búsqueda">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {filteredSolicitudes.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <h3>No hay solicitudes</h3>
                    </div>
                ) : (
                    <div className="solicitudes-grid">
                        {filteredSolicitudes.map((solicitud) => (
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
                    <div className="modal-overlay" onClick={() => handleCloseModal(setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Detalles de la Solicitud</h2>
                                <button className="btn-close" onClick={() => {
                                    handleCloseModal(setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage);
                                    setMotivo("");
                                    setDiasGozados("");
                                }}>
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
                                    <h3>Detalles de Vacaciones</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Fecha de inicio:</span>
                                            <span className="detail-value">{formatDate(selectedSolicitud.fechaInicioVacaciones)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Días solicitados:</span>
                                            <span className="detail-value highlight">{selectedSolicitud.cantidadDiasSolicitados} días</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Motivo de Cancelación</h3>
                                    {activeTab === "historial" ? (
                                        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '10px', fontStyle: 'italic', color: '#555' }}>
                                            "{selectedSolicitud.motivoReprogramacion || 'Sin motivo registrado'}"
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                                <div>
                                                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Días Gozados</label>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        max={selectedSolicitud.cantidadDiasSolicitados}
                                                        value={diasGozados}
                                                        onChange={(e) => setDiasGozados(e.target.value)}
                                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                                                        placeholder={`Máximo ${selectedSolicitud.cantidadDiasSolicitados} días`}
                                                        disabled={isCancelling || successMessage}
                                                    />
                                                    {diasGozados !== "" && parseInt(diasGozados) >= 0 && parseInt(diasGozados) <= selectedSolicitud.cantidadDiasSolicitados && (
                                                        <p style={{ color: 'green', marginTop: '5px', fontSize: '0.9em' }}>
                                                            Se devolverán {selectedSolicitud.cantidadDiasSolicitados - parseInt(diasGozados)} días.
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Motivo / Observación</label>
                                                    <textarea 
                                                        placeholder="Ej: Cancelación por URRHH, empleado suspendido por IGSS..."
                                                        style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                                                        value={motivo}
                                                        onChange={(e) => setMotivo(e.target.value)}
                                                        disabled={isCancelling || successMessage}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => {
                                        handleCloseModal(setIsModalOpen, setSelectedSolicitud, setCancelError, setSuccessMessage);
                                        setMotivo("");
                                        setDiasGozados("");
                                    }}
                                    disabled={isCancelling}
                                >
                                    Cerrar
                                </button>
                                {activeTab === "historial" && (
                                    <button 
                                        className="btn-primary" 
                                        style={{ backgroundColor: '#1E3A8A', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        onClick={() => generarBoletaCancelacionPDF(selectedSolicitud, selectedSolicitud.cantidadDiasSolicitados - (selectedSolicitud.diasDevueltos || 0), selectedSolicitud.motivoReprogramacion)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        Generar PDF
                                    </button>
                                )}
                                {activeTab === "autorizadas" && (
                                    <button 
                                        className="btn-danger" 
                                        onClick={() => handleCancelarSolicitudParcial(
                                            selectedSolicitud, 
                                            diasGozados,
                                            motivo,
                                            setIsModalOpen, 
                                            setSelectedSolicitud, 
                                            setCancelError, 
                                            setSuccessMessage, 
                                            setIsCancelling, 
                                            setSolicitudesAutorizadas,
                                            refreshCanceladas
                                        )}
                                        disabled={
                                            isCancelling || 
                                            successMessage || 
                                            !motivo.trim() || 
                                            diasGozados === "" || 
                                            parseInt(diasGozados) < 0 || 
                                            parseInt(diasGozados) > selectedSolicitud.cantidadDiasSolicitados
                                        }
                                    >
                                        {isCancelling ? "Procesando..." : "Procesar Cancelación"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CancelacionParcial;
