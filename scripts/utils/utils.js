//Datos de localstorage
const menuDinamico = document.getElementById("menuDinamico");
const nombreUsuario =document.getElementById("nombreUsuario");

const usuarioJSONGlobal= localStorage.getItem("usuario");
const usuarioObjetoGlobal = JSON.parse(usuarioJSONGlobal);
const lsCuiEmpleadoGlobal =  usuarioObjetoGlobal.cui;
const idRolGlobal = parseInt(usuarioObjetoGlobal.idRol);
const nombreGlobal = usuarioObjetoGlobal.primerNombre;
const apellidoGlobal = usuarioObjetoGlobal.primerApellido;



const SetearDatosInicioSesion = () => {
    nombreUsuario.textContent = nombreGlobal + "" + apellidoGlobal;
    
    if(idRolGlobal === 1){
        menuDinamico.style.display = "block";
    }

}


SetearDatosInicioSesion();

