const endpoints = {
    login: '/login',
    getInfoPeresonal: '/obtenerInfoPersonal',
    getInfoDpi: '/infoDpi',
    GET_FAMILIARES: '/obtenerFamiliares',
    GET_NIVEL_ACADEMICO: 'getNivelEducativo',
    GET_DATOS_MEDIOS: '/obtenerDatosMedicos',
    GET_DATOS_SOLI: '/obtenerInfoSoli',
    GET_DATOS_LABORALES: '/ObtenerdatosLaborales',
    GET_DIAS_FESTIVOS_C: '/getDiasFestivos',
    GET_SOLICITUDBYID_VACACIONES: '/solicitudesById',
    GET_SOLICITUDES_VACACIONES: '/solicitudes',
    GET_HISTORIAL: '/getHistorial',
    GET_SUSPENSIONES: '/getSuspensiones',
    GET_DIAS_SOLICITADOS: "/consultarDiasSolicitadosPorAnio",
    GET_COORDINADORES_LIST: '/consultarCoordinadoresList',
    GET_DIAS_DEBITADOS: '/consultarDiasDebitadosPorAnio',
    GET_DIAS_DISPONIBLES: '/consultarDiasDisponibles',
};

const endpointsPost = {
    login: '/login',
    POST_INGRESA_SOLICITUD: '/ingresarSolicitudVacaciones',
    POST_ACREDITARDIAS: '/acreditarDias',
    POST_INGRESARSUSPENSIONES: '/ingresarSuspension',
    POST_DEBITARDIAS: '/debitarDias',
};

export { endpoints, endpointsPost };
export default endpoints; // Exportación por defecto
