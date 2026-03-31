import { useState, useEffect } from "react";
import api from "../../config/api";
import { useSolicitudes } from "../VacationAppHooks/useSolicitudes";
import { getDiasFestivos } from "../../services/EmpleadosServices/DiasFestivos/GetDiasFestivos";
import dayjs from "dayjs";

export const useNotificaciones = () => {
  const [dbNotificaciones, setDbNotificaciones] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingN, setLoadingN] = useState(false);
  const [errorN, setErrorN] = useState(null);

  const { solicitudesU } = useSolicitudes();
  const [diasFestivos, setDiasFestivos] = useState([]);

  const fetchNotificaciones = async () => {
    setLoadingN(true);
    try {
      const lastCheck = localStorage.getItem('notif_last_check') || '';
      const url = lastCheck ? `/notificaciones?desde=${lastCheck}` : '/notificaciones';
      const response = await api.get(url);
      if (response.data && response.data.notificaciones) {
        if (lastCheck) {
          // Merge: add new ones, don't replace
          setDbNotificaciones(prev => {
            const existingIds = new Set(prev.map(n => n.idNotificacion));
            const newOnes = response.data.notificaciones.filter(n => !existingIds.has(n.idNotificacion));
            return [...newOnes, ...prev];
          });
        } else {
          setDbNotificaciones(response.data.notificaciones);
        }
      }
      localStorage.setItem('notif_last_check', new Date().toISOString());
    } catch (err) {
      setErrorN(err.response?.data?.error || "Error cargando notificaciones");
    } finally {
      setLoadingN(false);
    }
  };

  const cargarFestivos = async () => {
    try {
      const data = await getDiasFestivos();
      if (data) setDiasFestivos(data.filter(f => f.estado === 'A'));
    } catch (error) {
      console.error(error);
    }
  };

  const marcarLeida = async (idNotificacion) => {
    // Si es una notificacion mock frontal
    if (typeof idNotificacion === 'string' && idNotificacion.startsWith('front_')) {
      const leidas = JSON.parse(localStorage.getItem('notificacionesLeidas') || '[]');
      leidas.push(idNotificacion);
      localStorage.setItem('notificacionesLeidas', JSON.stringify(leidas));
      
      setNotificaciones(prev => 
        prev.map(notif => notif.idNotificacion === idNotificacion ? { ...notif, leida: 1 } : notif)
      );
      return;
    }

    try {
      await api.put(`/notificaciones/${idNotificacion}/leer`);
      setDbNotificaciones((prev) =>
        prev.map((notif) =>
          notif.idNotificacion === idNotificacion
            ? { ...notif, leida: 1 }
            : notif
        )
      );
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    cargarFestivos();
    const intervalId = setInterval(fetchNotificaciones, 60000); // Reducido a 60s
    return () => clearInterval(intervalId);
  }, []);

  // Efecto para consolidar notificaciones dinamicas
  useEffect(() => {
    let frontNotifs = [];
    const leidas = JSON.parse(localStorage.getItem('notificacionesLeidas') || '[]');
    const hoyDate = dayjs().startOf('day');

    if (diasFestivos && diasFestivos.length > 0) {
      const feriadoHoy = diasFestivos.find(f => {
        const fh = dayjs(f.fechaDiaFestivo).startOf('day');
        return fh.isSame(hoyDate, 'day');
      });
      if (feriadoHoy) {
        const idHoliday = `front_holiday_${feriadoHoy.idDiasFestivos}_${hoyDate.format('YYYYMMDD')}`;
        frontNotifs.push({
          idNotificacion: idHoliday,
          titulo: `🎉 ¡Feliz ${feriadoHoy.nombreFestividad || feriadoHoy.nombreDiaFestivo}!`,
          mensaje: "CNA Sistema te desea un excelente y reparador descanso hoy.",
          fechaCreacion: new Date().toISOString(),
          leida: leidas.includes(idHoliday) ? 1 : 0,
          enlace: null
        });
      }
    }

    if (solicitudesU && solicitudesU.length > 0) {
      const autorizadas = solicitudesU.filter(s => s.estadoSolicitud === "autorizadas");
      autorizadas.forEach(sol => {
        const fechaInicio = dayjs(sol.fechaInicioVacaciones).startOf('day');
        const diffDays = fechaInicio.diff(hoyDate, 'day');
        
        if (diffDays === 1 || diffDays === 2) {
          const idVacation = `front_vacation_${sol.idSolicitud}_${hoyDate.format('YYYYMMDD')}`;
          frontNotifs.push({
            idNotificacion: idVacation,
            titulo: "🏖️ ¡Tus vacaciones se acercan!",
            mensaje: `Estás a ${diffDays} día(s) de gozar tus vacaciones (Inician el ${fechaInicio.format('DD/MM/YYYY')}). No olvides hacer las gestiones en la unidad de recursos humanos.`,
            fechaCreacion: dayjs().subtract(diffDays, 'hour').toISOString(), // fake date slightly in past to sort
            leida: leidas.includes(idVacation) ? 1 : 0,
            enlace: "/empleados/vacaciones"
          });
        }
      });
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData?.fechaIngreso) {
      const fechaIngreso = dayjs(userData.fechaIngreso);
      if (fechaIngreso.month() === hoyDate.month() && fechaIngreso.date() === hoyDate.date()) {
        const years = hoyDate.year() - fechaIngreso.year();
        if (years > 0) {
          const idAnniversary = `front_anniversary_${fechaIngreso.format('MMDD')}_${hoyDate.year()}`;
          frontNotifs.push({
            idNotificacion: idAnniversary,
            titulo: "🎉 ¡Feliz Aniversario Institucional!",
            mensaje: `El Consejo Nacional de Adopciones agradece tu esfuerzo por cumplir ${years} año${years > 1 ? 's' : ''} en la institución.`,
            fechaCreacion: hoyDate.toISOString(),
            leida: leidas.includes(idAnniversary) ? 1 : 0,
            enlace: null
          });
        }
      }
    }

    if (userData?.fechaNacimiento) {
      const fechaNacimiento = dayjs(userData.fechaNacimiento);
      if (fechaNacimiento.month() === hoyDate.month() && fechaNacimiento.date() === hoyDate.date()) {
        const idBirthday = `front_birthday_${fechaNacimiento.format('MMDD')}_${hoyDate.year()}`;
        frontNotifs.push({
          idNotificacion: idBirthday,
          titulo: "🎂 ¡Feliz Cumpleaños!",
          mensaje: "De parte de todo el equipo del Consejo Nacional de Adopciones, te deseamos un día lleno de alegría y un año lleno de éxitos.",
          fechaCreacion: hoyDate.toISOString(),
          leida: leidas.includes(idBirthday) ? 1 : 0,
          enlace: null
        });
      }
    }

    const todas = [...frontNotifs, ...dbNotificaciones].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    setNotificaciones(todas);
  }, [dbNotificaciones, solicitudesU, diasFestivos]);

  const noLeidasCount = notificaciones.filter(n => n.leida === 0).length;

  return { notificaciones, loadingN, errorN, noLeidasCount, marcarLeida, fetchNotificaciones };
};
