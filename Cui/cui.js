//Elementos del DOM


//input
const idCui = document.getElementById("idDpi");
const cuiNumber = document.getElementById("cuiNumber");
const departamento = document.getElementById("departamento");
const departamentoSelect = document.getElementById("departamentoSelect");
const municipio = document.getElementById("municipio");
const municipioSelect = document.getElementById("municipioSelect");
const fechaNacimiento = document.getElementById("fechaNacimiento");
const nacionalidad = document.getElementById("nacionalidad");
const estadoCivil = document.getElementById("estadoCivil");
const estadoCivilSelect = document.getElementById("estadoCivilSelect");

const cuiAEliminar = document.getElementById("cuiAEliminar");

const moduloNoData = document.getElementById("moduloNoData");
const cuiContainer = document.getElementById("cuiContainer");

//Endpoint
const URLObtenerCui = "http://localhost:3000/api/ConsultarCui/";
const URLEliminarCUI = "http://localhost:3000/api/EliminarCui/";
const URLDepartamentos = "http://localhost:3000/api/departamentos";
const URLMunicipios = "http://localhost:3000/api/municipios";
const URLEstadoCivil = "http://localhost:3000/api/estadoCivil";
const URLUpdateCui = "http://localhost:3000/api/ActualizarCui";
const URLIngresarCui = "http://localhost:3000/api/IngrsarCui";


const ObtenerEstadoCivil = async () => {
    try{
        const data = await axios.get(URLEstadoCivil);
        return data.data;    
    }catch(error){
        throw JSON.parse(error.request.response);
    }
}

const ObtenerDepartamentos = async () => {
    try{
        const data = await axios.get(URLDepartamentos);
        return data.data;    
    }catch(error){
        throw JSON.parse(error.request.response);
    }
}

const ObtenerMunicipios = async () => {
    try{
        const data = await axios.get(URLMunicipios);
        return data.data;    
    }catch(error){
        throw JSON.parse(error.request.response);
    }
}

const ObtenerCui = async (cui) => {
    try{
        const url = `${URLObtenerCui}${cui}`
        const data = await axios.get(url);
        return data.data;    
    }catch(error){
        throw JSON.parse(error.request.response);
    }
}

const EliminarCui = async (id) => {
    try{
        const url = `${URLEliminarCUI}${id}`
        const data = await axios.delete(url);
    }catch(error){
        throw JSON.parse(error.request.response);
    }

}


const UpdateCui = async (IdDpi, CUI, fecha_nacimiento, IdMunicipio, IdDepartamento, nacionalidad, IdEstadoCivil) => {
  try {
    const data = {
        IdDpi,
        CUI, 
        fecha_nacimiento,
        IdMunicipio,
        IdDepartamento,
        nacionalidad,
        IdEstadoCivil
    };

    const response = await axios.put(URLUpdateCui, data);
    return response.data;
  } catch (error) {
    throw JSON.parse(error.request.response);
  }
};

const SaveCui = async (CUI, fecha_nacimiento, IdMunicipio, IdDepartamento, nacionalidad, IdEstadoCivil) => {
    try{
        const data = {
            CUI,
            fecha_nacimiento, 
            IdMunicipio,
            IdDepartamento,
            nacionalidad, 
            IdEstadoCivil
        }
        const response = await axios.post(URLIngresarCui, data);
        return response.data;
    }catch(error){
        throw JSON.parse(error.request.response);
    }

}


const EjecutarGuardado = async () => {

    const prmCui = cuiNumber.value;
    const prmDepartamento = parseInt(departamentoSelect.value);
    const prmMunicipio = parseInt(municipioSelect.value);
    const prmFechaNacimiento = fechaNacimiento.value;
    const prmNacionalidad = nacionalidad.value;
    const prmEstadoCivil = parseInt(estadoCivilSelect.value);
    try {
        const res = await SaveCui(
        prmCui,
        prmFechaNacimiento,
        prmMunicipio,
        prmDepartamento,
        prmNacionalidad,
        prmEstadoCivil
        );
        
        
        // Mostrar el modal de confirmación de datos guardados
        $('#confirmacionGuardadoModal').modal('show');    
        await MostrarDatosCUi(prmCui);
        await DesactivarInput();
    } catch (error) {
        console.log(error);
    }
};




const EjcutarActualizacion = async () => {

    const prmIdcui = parseInt(idCui.value);
    const prmCui = cuiNumber.value;
    const prmDepartamento = parseInt(departamentoSelect.value);
    const prmMunicipio = parseInt(municipioSelect.value);
    const prmFechaNacimiento = fechaNacimiento.value;
    const prmNacionalidad = nacionalidad.value;
    const prmEstadoCivil = parseInt(estadoCivilSelect.value);

    try {
        const res = await UpdateCui(
        prmIdcui,
        prmCui,
        prmFechaNacimiento,
        prmMunicipio,
        prmDepartamento,
        prmNacionalidad,
        prmEstadoCivil
        );

        await MostrarDatosCUi(prmCui);
        await DesactivarInput();
    } catch (error) {
        console.log(error);
    }
};



const EjecutarEliminacion = async () => {
    try{
        const data = await EliminarCui(idCui.value);
        await MostrarDatosCUi(2386749320313);
    }catch(error){
        alert(error);
    }
}

const MostrarMunicipiosPorDepartamento = async (idDepto) => {
    try {
        idDepto = parseInt(idDepto);
        
        const data = await ObtenerMunicipios();
        const municipioSelect = document.getElementById("municipioSelect");
        // Limpia las opciones existentes en el select
        municipioSelect.innerHTML = '';
        municipioSelect.disabled = false;

        // Recorre los departamentos y crea una opción para cada uno
        data.municipios.forEach((municipio) => {
            if(municipio.idMunicipio > (idDepto*100) && municipio.idMunicipio < ((idDepto + 1) * 100)){
                const option = document.createElement("option");
                option.value = municipio.idMunicipio;
                option.textContent = municipio.municipio;
                municipioSelect.appendChild(option);
            }
        });

    } catch (error) {
        // Maneja el error si es necesario
    }
}

const MostrarMuncipios = async () => {
    try {
        const data = await ObtenerMunicipios();
        const municipioSelect = document.getElementById("municipioSelect");
        // Limpia las opciones existentes en el select
        municipioSelect.innerHTML = '';

        // Recorre los departamentos y crea una opción para cada uno
        data.municipios.forEach((municipio) => {
            const option = document.createElement("option");
            option.value = municipio.idMunicipio;
            option.textContent = municipio.municipio;
            municipioSelect.appendChild(option);
        });

    } catch (error) {
        // Maneja el error si es necesario
    }
} 


const MostrarEstadoCivil = async () => {
    try {
        const data = await ObtenerEstadoCivil();
        const estadoCivilSelect = document.getElementById("estadoCivilSelect");
    
        // Limpia las opciones existentes en el select
        estadoCivilSelect.innerHTML = '';

        // Recorre los departamentos y crea una opción para cada uno
        data.estadoCivil.forEach((estado) => {
            const option = document.createElement("option");
            option.value = estado.IdEstadoCivil;
            option.textContent = estado.estado_civil;
            estadoCivilSelect.appendChild(option);
        });

    } catch (error) {
        // Maneja el error si es necesario
    }
}

const MostrarDepartamentos = async () => {
    try {
        const data = await ObtenerDepartamentos();
        const departamentoSelect = document.getElementById("departamentoSelect");

    
        // Limpia las opciones existentes en el select
        departamentoSelect.innerHTML = '';

        // Recorre los departamentos y crea una opción para cada uno
        data.departamentos.forEach((departamento) => {
            const option = document.createElement("option");
            option.value = departamento.IdDepartamento;
            option.textContent = departamento.departamento;
            departamentoSelect.appendChild(option);
        });

    } catch (error) {
        // Maneja el error si es necesario
    }
}


const MostrarDatosCUi = async (cui) => {
    try{
        data = await ObtenerCui(cui);

        cuiContainer.style.display = "block"; // Muestra el módulo CUI
        moduloNoData.style.display = "none"; // Oculta el módulo No Data

        idCui.value = data.data.IdDpi;
        cuiNumber.value = data.data.CUI;
        departamento.value = data.data.departamento;
        municipio.value = data.data.municipio;
        fechaNacimiento.value = FormatearFecha(data.data.fecha_nacimiento);
        nacionalidad.value = data.data.nacionalidad;
        estadoCivil.value = data.data.estado_civil;
        
    }catch(error){
        cuiContainer.style.display = "none"; // Oculta el módulo CUI
        moduloNoData.style.display = "block"; // Muestra el módulo No Data
    }

}


const MostrarFormulario = () => {
    cuiNumber.value = "";
    nacionalidad.value = "";
    -
    nacionalidad
    cuiContainer.style.display = "block"; // Muestra el módulo CUI
    moduloNoData.style.display = "none"; // Oculta el módulo No Data
    ActivarInput();
    document.getElementById("btnActualizar").setAttribute("hidden", "true");
    document.getElementById("btnGuardar").removeAttribute("hidden");

}

const ActivarInput = async () => {
    
    // Ocultar campos <select>
    document.getElementById("departamentoSelect").removeAttribute("hidden");
    document.getElementById("municipioSelect").removeAttribute("hidden");
    document.getElementById("estadoCivilSelect").removeAttribute("hidden");;

    // Mostrar campos de entrada de texto
    document.getElementById("departamento").setAttribute("hidden", "true");
    document.getElementById("municipio").setAttribute("hidden", "true");
    document.getElementById("estadoCivil").setAttribute("hidden", "true");

    // Otros cambios necesarios
    cuiNumber.classList.remove("font-weight-bold");
    cuiNumber.removeAttribute("readonly");
    document.getElementById("fechaNacimiento").removeAttribute("readonly");
    document.getElementById("nacionalidad").removeAttribute("readonly");

    // botones
    document.getElementById("btnCancelar").removeAttribute("hidden");
    document.getElementById("btnActualizar").removeAttribute("hidden");
    document.getElementById("btnModificar").setAttribute("hidden", "true");
    document.getElementById("btnEliminar").setAttribute("hidden", "true");
};

const DesactivarInput = async () => {

    await MostrarDatosCUi(cuiNumber.value);

    // Ocultar campos de entrada de texto
    document.getElementById("departamento").removeAttribute("hidden");
    document.getElementById("municipio").removeAttribute("hidden");
    document.getElementById("estadoCivil").removeAttribute("hidden");-

    // Mostrar campos <select>
    document.getElementById("departamentoSelect").setAttribute("hidden", "true");;
    document.getElementById("municipioSelect").setAttribute("hidden", "true");;
    document.getElementById("estadoCivilSelect").setAttribute("hidden", "true");;

    cuiNumber.classList.add("font-weight-bold");
    cuiNumber.setAttribute("readonly", "readonly");
    document.getElementById("fechaNacimiento").setAttribute("readonly", "readonly");
    document.getElementById("nacionalidad").setAttribute("readonly", "readonly");

    // botones
    document.getElementById("btnCancelar").setAttribute("hidden", "true");
    document.getElementById("btnActualizar").setAttribute("hidden", "true");
    document.getElementById("btnModificar").removeAttribute("hidden");
    document.getElementById("btnEliminar").removeAttribute("hidden");
    document.getElementById("btnGuardar").setAttribute("hidden", "true");
};



const FormatearFecha = (fecha) => {
    const date = new Date(fecha);
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }


const usuarioJSON = localStorage.getItem("usuario");

if (usuarioJSON) {
  const usuarioObjeto = JSON.parse(usuarioJSON);
  MostrarDatosCUi(usuarioObjeto.cui);
}

 MostrarDepartamentos();
 MostrarEstadoCivil();
 