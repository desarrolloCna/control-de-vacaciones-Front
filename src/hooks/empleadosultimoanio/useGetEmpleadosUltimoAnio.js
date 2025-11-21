import { useEffect, useState } from "react";
import { consultarEmpleadosUltimoAnioService } from "../../services/EmpleadosServices/Empleados/Empleados.service";
import dayjs from "dayjs";


/* Consulta a BD los permisoso */
export const useGetEmpleadosUltimoAnio = () => {
    const [empleadosU, setEmpleadosU] = useState([]);
    const [loadingEmpleados, setLoadingEmpleados] = useState(true);
    const [showErrorEmpleados, setShowErrorEmpleados] = useState(false);
    const [showInfoEmpleados, setShowEmpleados] = useState(false);
  
    useEffect(() => {
      const fetchEmpleadosUltimoAnio = async () => {
        try {

            const fechaHoy = dayjs().format('YYYY-MM-DD');

          const response = await consultarEmpleadosUltimoAnioService(fechaHoy);
          const data = response;
          if (data.status === 200) {
            setEmpleadosU(data.empleadosUltimoAnio);

          } else {
            setShowEmpleados(true);
          }
        } catch (error) {
          setShowErrorEmpleados(true);
        } finally {
          setLoadingEmpleados(false);
        }
      };

      fetchEmpleadosUltimoAnio();
    }, []);
  
    return { empleadosU, loadingEmpleados, showErrorEmpleados, showInfoEmpleados, setEmpleadosU };
  };
  
