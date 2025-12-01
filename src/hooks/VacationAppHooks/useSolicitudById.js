import { useEffect, useState } from "react";
import { getLocalStorageData } from "../../services/session/getLocalStorageData.js";
import { consultarDiasDebitadosServices, consultarDiasDisponiblesServices, getSolicitudById } from "../../services/VacationApp/GetSolicidudById.js";
import { validarCantidadDiasIngreso } from "../../services/utils/dates/vacationUtils.js";
import { consultarEmpleadosUltimoAnioService } from "../../services/EmpleadosServices/Empleados/Empleados.service.js";
import { consultarGestionVacacionesEspecialesService } from "../../services/vacacionesespeciales/Vacacionesesepeciales.service.js";
import dayjs from "dayjs";


export function useSolicitudById() {
  const [solicitud, setSolicitud] = useState(null); // Corregido el nombre
  const [diasValidos, setDiasValidos] = useState(null);
  const [errorS, setErrorS] = useState(null);
  const [loadingS, setLoadingS] = useState(true);
  const [sinDias, setSinDias] = useState(false);
  const [hasGestion, setHasGestion] = useState(false);
  const [diasDebitados, setDiasDebitados] = useState(0);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const userData = getLocalStorageData();
        if (!userData || !userData.idEmpleado || !userData.idInfoPersonal) {
          throw new Error("Sin datos en localStorage.");
        }

        const fechaEnCurso = dayjs().format('YYYY-MM-DD');
        const anioEnCurso = dayjs().year();

        //validar hace cuantos dias ingreso
         const isValidDay =  validarCantidadDiasIngreso(userData.fechaIngreso);
         setDiasValidos(isValidDay);

         const empleado = await consultarEmpleadosUltimoAnioService(userData.idEmpleado);
         const hasDays = empleado.empleadosUltimoAnio[0].idEmpleado == 0 ? true : false;
         setSinDias(hasDays);

         const gestion = await consultarGestionVacacionesEspecialesService(userData.idEmpleado, fechaEnCurso);
         const hasGestion = gestion.isExist == 0 ? false : true;
         setHasGestion(hasGestion);
        const { idEmpleado, idInfoPersonal } = userData;
        const data = await getSolicitudById(idEmpleado, idInfoPersonal);
        setSolicitud(data);

        const diasDebitados = await consultarDiasDebitadosServices(idEmpleado, anioEnCurso);
        setDiasDebitados( parseInt(diasDebitados.diasDebitados));

      } catch (error) {
        console.log(error)
        if (error?.message && !error.response) {
          setErrorS("Servicio no disponible, intente más tarde");
        } else if (error?.response?.data?.responseData) {
          setErrorS(error.response.data.responseData);
        } else {
          setErrorS("Ocurrió un error!!");
        }
      } finally {
        setLoadingS(false);
      }
    };

    fetchSolicitud();
  }, []); // Corregido: dependencias vacías para evitar llamadas innecesarias

  return { solicitud, diasValidos,  errorS, loadingS, setSolicitud, sinDias, hasGestion, diasDebitados };
}
