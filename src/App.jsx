import React from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import SignIn from './pages/login/login.jsx';
import Panel from './pages/Empleados-Admin/panel/panel.jsx';

// Rutas modulo administrativo
import DocumentForm from './pages/Empleados-Admin/empleado/dpiForm';
import InforPersonalForm from './pages/Empleados-Admin/empleado/infoPersonalForm';
import FamiliaresForm from './pages/Empleados-Admin/empleado/FamiliaresForm';
import NivelEducativoForm from './pages/Empleados-Admin/empleado/nivelEducativoFomr';
import DatosGeneralesForm from './pages/Empleados-Admin/empleado/DatosGeneralesForm';
import EmpleadoNuevoForm from './pages/Empleados-Admin/empleado/EmpleadoNuevoForm';
import { ReporteEmpleado } from './pages/Empleados-Admin/empleadosReporte/reporteEmpleados';
import { ReporteVacacionesEmpleados } from './pages/Empleados-Admin/Vacaciones-Reports/Reporte-Vacaciones-Empleados';
import SuspensionesPage from './pages/Empleados-Admin/Suspensiones.Page';
import DiasFestivosPage from './pages/Empleados-Admin/DiasFestivos/DiasFestivos.Page';

// Rutas módulo de empleados
import ContactsPage from './pages/empleadosProfile/Profile/ContactPage';
import HomePage from './pages/empleadosProfile/home/home';
import FamilyPage from './pages/empleadosProfile/family/FamilyPage';
import ProfetionalPage from './pages/empleadosProfile/inforamacionProfesional/ProfetionalPage';
import GeneralInfoPage from './pages/empleadosProfile/InformacionGeneral/GeneralInfo';
import EmployeePage from './pages/empleadosProfile/employeePage/employeePage';
import VacationApp from './pages/empleadosProfile/Vacations/VacationPage';
import ProgramarVacacionesPage from './pages/empleadosProfile/Vacations/ProgramarVacacionesPage';
import SolicitudesPage from './pages/empleadosProfile/Vacations/SolcitudesPage';
import CalendarioGlobalPage from './pages/empleadosProfile/Vacations/CalendarioGlobalPage';
import ActualizarDatosPage from './pages/empleadosProfile/ActualizarDatos/ActualizarDatosPage';

// Rutas Generales
import './styles/App.css'; 
import { getLocalStorageData } from './services/session/getLocalStorageData';
import ActivarVacacioenesPage from './pages/Empleados-Admin/ActivarVacaciones/ActivarVacaconesPage.jsx';
import CancelacionVacaciones from './pages/Empleados-Admin/cancelacionvacaciones/CancelarVacaciones.jsx';
import MandatoryPasswordChange from './components/MandatoryPasswordChange/MandatoryPasswordChange.jsx';
import BitacoraPage from './pages/Empleados-Admin/Bitacora/BitacoraPage.jsx';
import GestionUsuariosRRHH from './pages/Empleados-Admin/usuarios/GestionUsuariosRRHH.jsx';
import AjusteSaldosPage from './pages/Empleados-Admin/AjusteSaldos/AjusteSaldosPage.jsx';
import ExcepcionLimitePage from './pages/Empleados-Admin/ActivarVacaciones/ExcepcionLimitePage.jsx';

function App() {
  return (
    <>
      <MandatoryPasswordChange />
      <Routes>
        {/* Rutas públicas */}
        <Route path='/' element={<SignIn />} />

        {/* Rutas Administrativas (ADMIN y RRHH) */}
        <Route path='/panel' element={ <Panel />} />
        <Route path='/ingresar-nuevo-empleado' element={ <DocumentForm/> }/>
        <Route path='/ingresar-infoPersonal' element={ <InforPersonalForm/> }/>
        <Route path='/familiares' element={ <FamiliaresForm/> }/>
        <Route path='/nivel-educativo' element={ <NivelEducativoForm/> }/>
        <Route path='/datos-generales' element={ <DatosGeneralesForm/> }/>
        <Route path='/nuevo-empleado' element={ <EmpleadoNuevoForm/> }/>
        <Route path='/lista-de-empleados' element={ <ReporteEmpleado/> }/>
        <Route path='/vacaciones-empleados' element={ <ReporteVacacionesEmpleados/> }/>
        <Route path='/suspensiones' element={ <SuspensionesPage/> }/>
        <Route path='/activar-vacaciones' element={ <ActivarVacacioenesPage/> }/>
        <Route path='/excepcion-limite' element={ <ExcepcionLimitePage/> }/>
        <Route path='/cancelar-vacaciones' element={ <CancelacionVacaciones/> }/>
        <Route path='/dias-festivos' element={ <DiasFestivosPage/> }/>

        {/* Rutas exclusivas del Super Admin */}
        <Route path='/bitacora' element={ <BitacoraPage/> }/>
        <Route path='/crear-usuarios-rrhh' element={ <GestionUsuariosRRHH/> }/>
        <Route path='/ajustar-saldos' element={ <AjusteSaldosPage/> }/>

        {/* Rutas del módulo de empleados */}
        <Route path='/empleados/home' element={ <HomePage/> }/>
        <Route path='/empleados/infoPersonal' element={ <ContactsPage/> }/>
        <Route path='/empleados/family' element={ <FamilyPage/> }/>
        <Route path='/empleados/informacion-profesional' element={ <ProfetionalPage/> }/>
        <Route path='/empleados/informacion-General' element={ <GeneralInfoPage/> }/>
        <Route path='/empleados/informacion-laboral' element={ <EmployeePage/> }/>
        <Route path='/empleados/programar-vacaciones' element={ <VacationApp/> }/>
        <Route path='/empleados/programar-fecha' element={ <ProgramarVacacionesPage/> }/>
        <Route path='/empleados/calendario' element={ <CalendarioGlobalPage/> }/>
        <Route path='/empleados/actualizar-datos' element={ <ActualizarDatosPage/> }/>
        <Route path='/empleados/solicitudes' element={ <SolicitudesPage/> }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
