import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import Navbar from "../../../components/navBar/NavBar";
import Spinner from "../../../components/spinners/spinner";
import { useGetEmpleadosUltimoAnio } from "../../../hooks/empleadosultimoanio/useGetEmpleadosUltimoAnio";
import { useCheckSession } from "../../../services/session/checkSession";
import { getLocalStorageData } from "../../../services/session/getLocalStorageData";
import "./ActivarVacaconesPage.styles.css";
import { registrarVacacionesEspeciales } from "../../../services/vacacionesespeciales/Vacacionesesepeciales.service";

const ActivarVacacionesPage = () => {
    const isSessionVerified = useCheckSession();
    const userData = getLocalStorageData();
    const { empleadosU, loadingEmpleados, showErrorEmpleados, showInfoEmpleados, setEmpleadosU } = useGetEmpleadosUltimoAnio();
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState(new Set());
    const [descripciones, setDescripciones] = useState({});
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    // Effect para limpiar mensajes de éxito automáticamente después de 5 segundos
    useEffect(() => {
        if (mensaje.tipo === 'success' && mensaje.texto) {
            const timer = setTimeout(() => {
                setMensaje({ tipo: '', texto: '' });
            }, 5000); // 5 segundos

            // Cleanup function para limpiar el timer si el componente se desmonta
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    // Filtrar empleados basado en la búsqueda
    const empleadosFiltrados = useMemo(() => {
        if (!terminoBusqueda.trim()) {
            return empleadosU;
        }
        
        const terminoLower = terminoBusqueda.toLowerCase().trim();
        return empleadosU.filter(empleado => 
            empleado.Nombre.toLowerCase().includes(terminoLower)
        );
    }, [empleadosU, terminoBusqueda]);

    // Función para manejar la selección de empleados
    const toggleEmpleadoSeleccionado = (idEmpleado) => {
        const nuevosSeleccionados = new Set(empleadosSeleccionados);
        if (nuevosSeleccionados.has(idEmpleado)) {
            nuevosSeleccionados.delete(idEmpleado);
            // Limpiar descripción cuando se deselecciona
            const nuevasDescripciones = { ...descripciones };
            delete nuevasDescripciones[idEmpleado];
            setDescripciones(nuevasDescripciones);
        } else {
            nuevosSeleccionados.add(idEmpleado);
        }
        setEmpleadosSeleccionados(nuevosSeleccionados);
    };

    // Función para actualizar la descripción de un empleado
    const actualizarDescripcion = (idEmpleado, descripcion) => {
        setDescripciones(prev => ({
            ...prev,
            [idEmpleado]: descripcion
        }));
    };

    // Función para seleccionar/deseleccionar todos los empleados filtrados
    const toggleTodosLosEmpleados = () => {
        const empleadosVisiblesIds = empleadosFiltrados.map(emp => emp.idEmpleado);
        const todosSeleccionados = empleadosVisiblesIds.every(id => 
            empleadosSeleccionados.has(id)
        );

        if (todosSeleccionados) {
            // Deseleccionar todos los visibles
            const nuevosSeleccionados = new Set(empleadosSeleccionados);
            empleadosVisiblesIds.forEach(id => nuevosSeleccionados.delete(id));
            setEmpleadosSeleccionados(nuevosSeleccionados);
            
            // Limpiar descripciones de los empleados deseleccionados
            const nuevasDescripciones = { ...descripciones };
            empleadosVisiblesIds.forEach(id => {
                delete nuevasDescripciones[id];
            });
            setDescripciones(nuevasDescripciones);
        } else {
            // Seleccionar todos los visibles
            const nuevosSeleccionados = new Set(empleadosSeleccionados);
            empleadosVisiblesIds.forEach(id => nuevosSeleccionados.add(id));
            setEmpleadosSeleccionados(nuevosSeleccionados);
        }
    };

    // Función para generar el payload usando day.js
    const generarPayload = (empleado) => {
        const hoy = dayjs();
        const manana = hoy.add(1, 'day');

        return {
            idEmpleado: empleado.idEmpleado,
            idInfoPersonal: empleado.idInfoPersonal,
            idUsuario: userData?.idUsuario || 1,
            flagAutorizacion: 1,
            fechaInicioValidez: hoy.format('YYYY-MM-DD'),
            fechaFinValidez: manana.format('YYYY-MM-DD'),
            fechaIngresoGestion: hoy.format('YYYY-MM-DD HH:mm:ss'),
            descripcion: descripciones[empleado.idEmpleado] || '' // Agregar descripción al payload
        };
    };

    // Función para procesar la activación
    const procesarActivacion = async () => {
        if (empleadosSeleccionados.size === 0) {
            setMensaje({ tipo: 'error', texto: 'Por favor selecciona al menos un empleado' });
            return;
        }

        // Validar que todos los empleados seleccionados tengan descripción
        const empleadosSinDescripcion = Array.from(empleadosSeleccionados).filter(id => 
            !descripciones[id] || descripciones[id].trim() === ''
        );

        if (empleadosSinDescripcion.length > 0) {
            setMensaje({ 
                tipo: 'error', 
                texto: `Por favor ingresa una Motivo para todos los empleados seleccionados` 
            });
            return;
        }

        setProcesando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const empleadosProcesar = empleadosU.filter(emp => 
                empleadosSeleccionados.has(emp.idEmpleado)
            );

            const resultados = [];
            const errores = [];

            // Procesar cada empleado individualmente
            for (const empleado of empleadosProcesar) {
                try {
                    const payload = generarPayload(empleado);
                    
                    // Llamar al servicio real
                    const respuesta = await registrarVacacionesEspeciales(payload);
                    console.log('Respuesta del servidor para', empleado.Nombre, ':', respuesta);
                    
                    resultados.push({
                        empleado: empleado.Nombre,
                        success: true,
                        data: respuesta
                    });
                    
                } catch (error) {
                    console.error(`Error al procesar ${empleado.Nombre}:`, error);
                    errores.push({
                        empleado: empleado.Nombre,
                        error: error.response?.data?.message || error.message || 'Error desconocido'
                    });
                }
            }

            // Mostrar resultados
            if (errores.length === 0) {
                // Todos exitosos
                setMensaje({ 
                    tipo: 'success', 
                    texto: `✅ Se activaron las vacaciones para ${resultados.length} empleado(s) correctamente` 
                });
            } else if (resultados.length === 0) {
                // Todos fallaron
                setMensaje({ 
                    tipo: 'error', 
                    texto: `❌ Error al activar las vacaciones para todos los empleados seleccionados` 
                });
            } else {
                // Mixto
                setMensaje({ 
                    tipo: 'warning', 
                    texto: `⚠️ Se procesaron ${resultados.length} empleados exitosamente, pero ${errores.length} fallaron` 
                });
            }

            // Limpiar selecciones y descripciones solo si todos fueron exitosos
            if (errores.length === 0) {
                setEmpleadosSeleccionados(new Set());
                setDescripciones({});
            }
            
        } catch (error) {
            console.error('Error general en procesarActivacion:', error);
            setMensaje({ 
                tipo: 'error', 
                texto: '❌ Error inesperado al activar las vacaciones. Intenta nuevamente.' 
            });
        } finally {
            setProcesando(false);
        }
    };

    // Calcular contadores para empleados filtrados
    const empleadosSeleccionadosFiltrados = empleadosFiltrados.filter(emp => 
        empleadosSeleccionados.has(emp.idEmpleado)
    ).length;

    const textoSeleccionarTodos = empleadosFiltrados.length > 0 && 
        empleadosSeleccionadosFiltrados === empleadosFiltrados.length ? 
        'Deseleccionar todos' : 'Seleccionar todos';

    // Formatear fechas para mostrar en la UI
    const fechaHoy = dayjs().format('DD/MM/YYYY');
    const fechaManana = dayjs().add(1, 'day').format('DD/MM/YYYY');

    if (!isSessionVerified || loadingEmpleados) {
        return <Spinner />;
    }

    return (
        <>
            <Navbar />
            <div className="activar-vacaciones-container">
                <div className="activar-vacaciones-header">
                    <h1 className="activar-vacaciones-title">
                        Activación Especial de Vacaciones
                    </h1>
                    <p className="activar-vacaciones-subtitle">
                        Gestión para empleados con menos de un año de antigüedad
                    </p>
                </div>

                {/* Banner informativo */}
                <div className="info-banner">
                    <div className="info-icon">ℹ️</div>
                    <div className="info-content">
                        <h3>Proceso Especial de RRHH</h3>
                        <p>
                            Los empleados con menos de un año de antigüedad requieren autorización especial 
                            para solicitar vacaciones. Esta herramienta permite activar temporalmente 
                            esta funcionalidad mediante gestión autorizada del departamento de Recursos Humanos.
                        </p>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="barra-busqueda-container">
                    <div className="busqueda-input-group">
                        <span className="busqueda-icon">🔍</span>
                        <input
                            type="text"
                            className="busqueda-input"
                            placeholder="Buscar empleado por nombre..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                            disabled={procesando}
                        />
                        {terminoBusqueda && (
                            <button 
                                className="limpiar-busqueda"
                                onClick={() => setTerminoBusqueda('')}
                                disabled={procesando}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="contador-busqueda">
                        {empleadosFiltrados.length} de {empleadosU.length} empleados encontrados
                    </div>
                </div>

                {/* Controles de selección */}
                <div className="controles-superiores">
                    <div className="contador-seleccionados">
                        {empleadosSeleccionadosFiltrados} de {empleadosFiltrados.length} empleados seleccionados
                    </div>
                    {empleadosFiltrados.length > 0 && (
                        <button 
                            className="btn-seleccionar-todos"
                            onClick={toggleTodosLosEmpleados}
                            disabled={procesando}
                        >
                            {textoSeleccionarTodos}
                        </button>
                    )}
                </div>

                {/* Lista de empleados */}
                <div className="lista-empleados">
                    {empleadosFiltrados.length > 0 ? (
                        empleadosFiltrados.map((empleado, index) => (
                            <div 
                                key={empleado.idEmpleado}
                                className={`empleado-card ${empleadosSeleccionados.has(empleado.idEmpleado) ? 'seleccionado' : ''}`}
                            >
                                <div className="empleado-info">
                                    <div className="empleado-avatar">
                                        {empleado.Nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="empleado-datos">
                                        <h3 className="empleado-nombre">{empleado.Nombre}</h3>
                                        <div className="empleado-detalles">
                                            <span className="detalle">ID: {empleado.idEmpleado}</span>
                                            {/* <span className="detalle">Personal: {empleado.idInfoPersonal}</span> */}
                                        </div>
                                        
                                        {/* Campo de descripción - solo visible cuando está seleccionado */}
                                        {empleadosSeleccionados.has(empleado.idEmpleado) && (
                                            <div className="descripcion-container">
                                                <label htmlFor={`descripcion-${empleado.idEmpleado}`} className="descripcion-label">
                                                    Motivo de la activación:
                                                </label>
                                                <textarea
                                                    id={`descripcion-${empleado.idEmpleado}`}
                                                    className="descripcion-input"
                                                    placeholder="Ingresa el motivo de la activación especial de vacaciones..."
                                                    value={descripciones[empleado.idEmpleado] || ''}
                                                    onChange={(e) => actualizarDescripcion(empleado.idEmpleado, e.target.value)}
                                                    disabled={procesando}
                                                    rows={3}
                                                    maxLength={500}
                                                />
                                                <div className="descripcion-contador">
                                                    {descripciones[empleado.idEmpleado]?.length || 0}/500 caracteres
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="empleado-acciones">
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            checked={empleadosSeleccionados.has(empleado.idEmpleado)}
                                            onChange={() => toggleEmpleadoSeleccionado(empleado.idEmpleado)}
                                            disabled={procesando}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <span className="estado-texto">
                                        {empleadosSeleccionados.has(empleado.idEmpleado) ? 'Activado' : 'Pendiente'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="sin-resultados">
                            <div className="sin-resultados-icon">🔍</div>
                            <h3>No se encontraron empleados</h3>
                            <p>
                                {terminoBusqueda ? 
                                    `No hay empleados que coincidan con "${terminoBusqueda}"` : 
                                    'No hay empleados disponibles para gestión especial'
                                }
                            </p>
                            {terminoBusqueda && (
                                <button 
                                    className="btn-limpiar-busqueda-grande"
                                    onClick={() => setTerminoBusqueda('')}
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Acciones principales */}
                {empleadosFiltrados.length > 0 && (
                    <div className="acciones-principales">
                        <button 
                            className="btn-procesar"
                            onClick={procesarActivacion}
                            disabled={procesando || empleadosSeleccionados.size === 0}
                        >
                            {procesando ? (
                                <>
                                    <div className="spinner-mini"></div>
                                    Procesando solicitudes...
                                </>
                            ) : (
                                `Autorizar vacaciones (${empleadosSeleccionados.size})`
                            )}
                        </button>
                    </div>
                )}

                {/* Mensajes de estado */}
                {mensaje.texto && (
                    <div className={`mensaje ${mensaje.tipo}`}>
                        {mensaje.texto}
                    </div>
                )}
            </div>
        </>
    );
};

export default ActivarVacacionesPage;