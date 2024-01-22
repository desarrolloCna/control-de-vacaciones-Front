//DOM
let idFamiliarInput = document.getElementById('idFamiliar');
let nombreFamiliarInput = document.getElementById('nombreFamiliar');
let parentescoSelectInput = document.getElementById('parentescoSelect');
let fechaNacimientoInput = document.getElementById('fechaNacimiento');

//Dom Tabla
const contenedorTabla = document.getElementById("contenedor-tabla");
const tabla = document.createElement("table");
tabla.id = "myTable";
tabla.className = "display";

//Datos de localstorage
const usuarioJSON = localStorage.getItem("usuario");
const usuarioObjeto = JSON.parse(usuarioJSON);
const lsCuiEmpleado =  usuarioObjeto.cui;


//Enpoints
const obtenerFamiliaresEndpoint = 'http://localhost:3000/api/ObtenerFamiliares/';
const actualizarFamiliaresEndpoint = 'http://localhost:3000/api/ActualizarFamiliares';
const ingresarFamiliaresEndpoint = 'http://localhost:3000/api/IngresarFamiliares';
const eliminarFamiliaresEndpoint = 'http://localhost:3000/api/EliminarFamiliares/';
const catalogoParentesco = "http://localhost:3000/api/tipoFamiliaresC";


//Catalogo parentesco
const ObtenerParentesco = async () => {
    try{
        const data = await axios.get(catalogoParentesco);
        return data.data;    
    }catch(error){
        throw JSON.parse(error.request.response);
    }
}

/* Metodo para obtener todos Familiares */
const ObtenerFarmiliares = async () => {
    try {
      const url = `${obtenerFamiliaresEndpoint}${lsCuiEmpleado}`
      const data = await axios.get(url);
      return data.data;
    } catch (error) {
      throw error;
    }
  };

const SaveFamiliares = async (nombre, fechaNacimiento, idParentesco, cuiEmpleado) => {
    try{
        const data = {
            nombre,
            fechaNacimiento, 
            idParentesco,
            cuiEmpleado
        }
        const response = await axios.post(ingresarFamiliaresEndpoint, data);
        return response.data;
    }catch(error){
        throw JSON.parse(error.request.response);
    }
}

/*Metodo DELETE para eliminacion de datos*/
const DeleteFamiliar = async (idFamiliar) => {
  try {
    // Realizar la eliminación del dato utilizando axios
    await axios.delete(eliminarFamiliaresEndpoint + idFamiliar);
  }  catch (error) {
    console.error('Error al eliminar la categoría:', error.message);
  }
};


const EliminarFamiliar = async (idFamiliar) => {
  try {
    await DeleteFamiliar(idFamiliar);
    location.reload();
  } catch (error) {
    console.error('Error al eliminar la categoría:', error.message);
  }
};

const GuardarFamiliares = async () => {
    if(validarinputFormFamiliares()){
        return;
    }
    const nombreFamiliar = nombreFamiliarInput.value;
    const parentesco = parseInt(parentescoSelectInput.value);
    const fechaNacimiento = fechaNacimientoInput.value;
    try{
        const res = await SaveFamiliares(
                nombreFamiliar,
                fechaNacimiento,
                parentesco,
                lsCuiEmpleado
            );
-
        // Mostrar el modal de confirmación de datos guardados
        $('#confirmacionGuardadoModal').modal('show');
        await LimpiarInput();
        location.reload();

    }catch(error){
        console.log(error);
    }
}


const MostrarParentesco = async () => {
    try {
        const data = await ObtenerParentesco();
        // Limpia las opciones existentes en el select
        parentescoSelectInput.innerHTML = '';

        // Recorre los departamentos y crea una opción para cada uno
        data.parentescoList.forEach((parentesco) => {
            const option = document.createElement("option");
            option.value = parentesco.idParentesco;
            option.textContent = parentesco.parentesco;
            parentescoSelectInput.appendChild(option);
        });

    } catch (error) {
        // Maneja el error si es necesario
    }
}





const CrearHeader = (data) => {
    try{
        const arrayKeys = Object.keys(data.data[0]);
        arrayKeys.push("Acciones"); // Agregar "Acciones" al final del array
        const header = document.createElement("thead");
        const rowHead = document.createElement("tr");
      
        arrayKeys.forEach((dato) => {
          const headCell = document.createElement("th");
          headCell.textContent = dato;
          rowHead.appendChild(headCell);
        });
      
        header.appendChild(rowHead);
        tabla.appendChild(header);
        contenedorTabla.appendChild(tabla);

    }catch(error){

    }
}

const CrearFilas = (data) => {

    try{
        const cuerpoTabla = document.createElement("tbody");
  
        data.data.forEach((fila) => {
        
          const filasDatos = document.createElement("tr");
          filasDatos.innerHTML = `
            <td>${fila.idFamiliar}</td>
            <td>${fila.nombre}</td>
            <td>${FormatearFechaLatina(fila.fechaNacimiento)}</td>
            <td> ${fila.parentesco}</td>
            <td>${fila.cuiEmpleado}</td>
            <td>${fila.estado}</td>
            <td>

            <button class="btn-editar btn btn-warning" onclick="SetValueUpdate('${fila.idFamiliar}', '${fila.nombre}')" >
              <i class="fas fa-edit"></i>
            </button>
          
            <button class="btn-eliminar btn btn-danger" onclick="EliminarFamiliar(${fila.idFamiliar})">
            <i class="fas fa-trash-alt"></i>
            </button>
        </td>
            </td>
          `;
          cuerpoTabla.appendChild(filasDatos);
        });
      
        tabla.appendChild(cuerpoTabla);
    }catch(error){

    }


  };


const SetValueUpdate = (idFamiliar, nombre) => {
  idFamiliarInput.value = idFamiliar;
  nombreFamiliarInput.value = nombre;
  
}


const validarinputFormFamiliares = () => {
    if (!nombreFamiliarInput.value || !fechaNacimientoInput.value) {
        let campoVacio = !nombreFamiliarInput.value ? '<strong>Nombre Familiar</strong>' : '<strong>Fecha de Nacimiento</strong>';
        $('#errorModal .modal-body').html(`Por favor, completa el campo obligatorio: ${campoVacio}`);
        $('#errorModal').modal('show');
        return true; // Indica que hay un error
    }
    return false; // Indica que todo está bien
}


const LimpiarInput = async () => {
    nombreFamiliarInput.value = "";
    fechaNacimientoInput.value = "";
    await MostrarParentesco();  
} 

const FormatearFecha = (fecha) => {
    const date = new Date(fecha);
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  
  const FormatearFechaLatina = (fecha) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
};
  
  //Mostrar datos en la tabla creada dinamicamente
  const DataTableInit = () => {    
    // Inicializar DataTables en la tabla
    let table = new DataTable('#myTable', {
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "No se encontraron registros",
        info: "Página _PAGE_ de _PAGES_",
        infoEmpty: "No hay registros disponibles",
        infoFiltered: "(filtrados de un total de _MAX_ registros)",
        paginate: {
          first: "Primero",
          previous: "Anterior",
          next: "Siguiente",
          last: "Último"
        }
      }
    });
 
  }


  ObtenerFarmiliares()
  .then(data => {
    // Hacer algo con los datos retornados
    CrearHeader(data);
    CrearFilas(data);
    DataTableInit();
  })
  .catch(error => {
    console.log(error);
  })

  MostrarParentesco();