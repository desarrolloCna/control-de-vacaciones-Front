// validacionSesion.js
const token = localStorage.getItem('usuario');

if (!token) {
  // Si no hay token en localStorage, redirige al usuario al inicio de sesión
  window.location.href = '../../Login/login.html';
}


const cerrarSesion = () => {
    // Eliminar el token de localStorage
    localStorage.removeItem('usuario');
    // Redirigir al usuario al inicio de sesión
    window.location.href = '../../Login/login.html';
}
