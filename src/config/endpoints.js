const endpoints = {
    login: '/login',
    getInfoPeresonal: '/obtenerInfoPersonal',
    GET_DATOS_LABORALES: '/obtenerDatosLaborales',
    GET_FAMILIARES: '/obtenerFamiliares',
    GET_NIVEL_ACADEMICO: '/getNivelEducativo',
    GET_DATOS_SOLI: '/obtenerInfoSoli',
    GET_DATOS_MEDIOS: '/obtenerDatosMedicos',
    getInfoDpi: '/infoDpi',
    GET_DIAS_FESTIVOS_C: '/getDiasFestivos',
    GET_SOLICITUDBYID_VACACIONES: '/solicitudesById',
    GET_SOLICITUDES_VACACIONES: '/solicitudes',
    GET_HISTORIAL: '/getHistorial',
    GET_SUSPENSIONES: '/getSuspensiones',
    GET_DIAS_SOLICITADOS: "/consultarDiasSolicitadosPorAnio",
    GET_COORDINADORES_LIST: '/consultarCoordinadoresList',
    GET_DIAS_DEBITADOS: '/consultarDiasDebitadosPorAnio',
    GET_DIAS_DISPONIBLES: '/consultarDiasDisponibles',
    GET_EMPLEADOS_ULTIMO_ANIO: '/consultarEmpleadosUltimoAnio',
    GET_GESTION_VAC_ESPECIALES: '/consultarVacacionesEspeciales',
    GET_SOLICITUDES_POR_EMPLEADO: '/consultarSolicitudesPorEmpleado',
    GET_SOLICITUDES_AUTORIZADAS: '/consultarSolicitudesVacacionesAutorizadas',
    GET_EMPLEADOS_SIN_VACACIONES: '/consultarEmpleadosSinVacaciones',
    GET_CALENDARIO_VACACIONES: '/calendario/vacaciones',
    GET_CONSULTAR_EXCEPCION_LIMITE: '/consultarExcepcionLimite',
};

const endpointsPost = {
    login: '/login',
    POST_INGRESA_SOLICITUD: '/ingresarSolicitudVacaciones',
    POST_ACREDITARDIAS: '/acreditarDias',
    POST_INGRESARSUSPENSIONES: '/ingresarSuspension',
    POST_DEBITARDIAS: '/debitarDias',
    POST_REGISTRA_VACACIONES_ESPECIALES: '/registrarVacacionesEspeciales',
    POST_REGISTRA_EXCEPCION_LIMITE: '/registrarExcepcionLimite',
    POST_DIASFESTIVOS: '/diasFestivos',
    requestPasswordReset: '/request-password-reset'
};

const endpointsPut = {
    PUT_CANCELAR_SOLICITUD: '/cancelarSolicitudAutorizada',
    PUT_DIASFESTIVOS_BASE: '/diasFestivos',
    cambiarPassword: '/empleado/cambiar-password'
};

const endpointsDelete = {
    DELETE_DIASFESTIVOS_BASE: '/diasFestivos'
};

export { endpoints, endpointsPost, endpointsPut, endpointsDelete };
export default endpoints; // Exportación por defecto
