import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './pages/login/login.jsx';
import Panel from './pages/Empleados-Admin/panel/panel.jsx';

import ProtectedRoute from './components/ProtectRoute/ProtectedRoute.jsx';
// Rutas modulo administrativo
import DocumentForm from './pages/Empleados-Admin/empleado/dpiForm';
import InforPersonalForm from './pages/Empleados-Admin/empleado/infoPersonalForm';
import FamiliaresForm from './pages/Empleados-Admin/empleado/FamiliaresForm';
import NivelEducativoForm from './pages/Empleados-Admin/empleado/nivelEducativoFomr';
import DatosGeneralesForm from './pages/Empleados-Admin/empleado/DatosGeneralesForm';
import EmpleadoNuevoForm from './pages/Empleados-Admin/empleado/EmpleadoNuevoForm';
import WizardNuevoEmpleado from './pages/Empleados-Admin/empleado/WizardNuevoEmpleado';
import { ReporteEmpleado } from './pages/Empleados-Admin/empleadosReporte/reporteEmpleados';

import SuspensionesPage from './pages/Empleados-Admin/Suspensiones.Page';
import DiasFestivosPage from './pages/Empleados-Admin/DiasFestivos/DiasFestivos.Page';

// Rutas módulo de empleados
import ContactsPage from './pages/empleadosProfile/Profile/ContactPage';
import HomePage from './pages/empleadosProfile/home/home';
import FamilyPage from './pages/empleadosProfile/family/FamilyPage';
import ProfetionalPage from './pages/empleadosProfile/inforamacionProfesional/ProfetionalPage';
import GeneralInfoPage from './pages/empleadosProfile/InformacionGeneral/GeneralInfo';
import EmployeePage from './pages/empleadosProfile/employeePage/employeePage';
const VacationApp = lazy(() => import('./pages/empleadosProfile/Vacations/VacationPage'));
const ProgramarVacacionesPage = lazy(() => import('./pages/empleadosProfile/Vacations/ProgramarVacacionesPage'));
const SolicitudesPage = lazy(() => import('./pages/empleadosProfile/Vacations/SolcitudesPage'));
const CalendarioGlobalPage = lazy(() => import('./pages/empleadosProfile/Vacations/CalendarioGlobalPage'));
const ActualizarDatosPage = lazy(() => import('./pages/empleadosProfile/ActualizarDatos/ActualizarDatosPage'));
const FiniquitoRRHH = lazy(() => import('./pages/Empleados-Admin/panel/FiniquitoRRHH'));
const DashboardRRHH = lazy(() => import('./pages/Empleados-Admin/panel/DashboardRRHH'));
const DashboardEjecutivo = lazy(() => import('./pages/Director/DashboardEjecutivo'));
const ReporteVacacionesEmpleados = lazy(() => import('./pages/Empleados-Admin/Vacaciones-Reports/Reporte-Vacaciones-Empleados').then(m => ({ default: m.ReporteVacacionesEmpleados })));

import NotFoundPage from './pages/NotFound/NotFoundPage.jsx';

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
import KioscoPage from './pages/Kiosco/KioscoPage.jsx';


function App() {
  return (
    <>
      <MandatoryPasswordChange />
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><span>Cargando...</span></div>}>
        <Routes>
          {/* Rutas públicas */}
          <Route path='/' element={<SignIn />} />
          <Route path='/kiosco' element={<KioscoPage />} />

          {/* Rutas Administrativas (ADMIN y RRHH) */}
          <Route element={<ProtectedRoute allowedRoles={[1, 3]} />}>
            <Route path='/panel' element={ <Panel />} />
            <Route path='/dashboard-rrhh' element={<DashboardRRHH />} />
            <Route path='/finiquito-rrhh' element={<FiniquitoRRHH />} />
            <Route path='/ingresar-nuevo-empleado' element={ <WizardNuevoEmpleado/> }/>
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
          </Route>

          {/* Rutas exclusivas del Super Admin */}
          <Route element={<ProtectedRoute allowedRoles={[1]} />}>
            <Route path='/bitacora' element={ <BitacoraPage/> }/>
            <Route path='/crear-usuarios-rrhh' element={ <GestionUsuariosRRHH/> }/>
            <Route path='/ajustar-saldos' element={ <AjusteSaldosPage/> }/>
          </Route>

          {/* Dashboard Ejecutivo */}
          <Route element={<ProtectedRoute allowedRoles={[1, 3, 5]} />}>
            <Route path='/dashboard-ejecutivo' element={ <DashboardEjecutivo/> }/>
          </Route>

          {/* Rutas del módulo de empleados */}
          <Route element={<ProtectedRoute allowedRoles={[1, 2, 3, 4, 5]} />}>
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
          </Route>

          {/* Fallback a 404 personalizada */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
