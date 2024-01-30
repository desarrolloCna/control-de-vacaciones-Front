//DOM
const cui                = document.getElementById("cui");
const primerNombre       = document.getElementById("primerNombre");
const segundoNombre      = document.getElementById("segundoNombre");
const tercerNombre       = document.getElementById("tercerNombre");
const primerApellido     = document.getElementById("primerApellido");
const segundoApellido    = document.getElementById("segundoApellido");
const apellidoCasada     = document.getElementById("apellidoCasada");
const correo             = document.getElementById("correo");
const celular            = document.getElementById("celular");
const nit                = document.getElementById("nit");
const tipoLicencia       = document.getElementById("tipoLicencia");
const fotografia         = document.getElementById("fotografia");
const noIgss             = document.getElementById("noIgss");
const valorBoletoOrnato  = document.getElementById("valorBoletoOrnato");
const actualizacionOGC   = document.getElementById("actualizacionOGC");
const ComunidadSelect    = document.getElementById("comunidadLinguistica");
const discapacidadSelect = document.getElementById("discapacidad");
const educacionSelect    = document.getElementById("nivelEducativo");
const pueblosSelect      = document.getElementById("puebloPerteneciente");

// Obtener valores de campos laborales
const extencionTelefono   = document.getElementById("extencionTelefono");
const codigoImpresora     = document.getElementById("codigoImpresora");
const correoInstitucional = document.getElementById("correoInstitucional");
const cuentaBancariaCHN   = document.getElementById("cuentaBancariaCHN");
const puestoSelect        = document.getElementById("puestoSelect");



//Endpoint
const crearEmpleadoEndpoint       = "http://localhost:3000/api/registrarEmpleado";

//Catalogos
const URL_ComunidadesLinguisticas = "http://localhost:3000/api/comunidadesLinguisticas";
const URL_discapacidades          = "http://localhost:3000/api/discapacidadesList";
const URL_nivelEducativo          = "http://localhost:3000/api/educacion";
const URL_pueblosP                = "http://localhost:3000/api/pueblosList";
const URL_puestosL                = "http://localhost:3000/api/puestos";


//Catalogos -- inicio
const GetComunidadLinguistica = async () => {
  try{
      const data = await axios.get(URL_ComunidadesLinguisticas);
      return data.data;    
  }catch(error){
      throw JSON.parse(error);
  }
}

const GetDiscapacidades = async () => {
  try{
      const data = await axios.get(URL_discapacidades);
      return data.data;    
  }catch(error){
      throw JSON.parse(error);
  }
}

const GetNivelEducativo = async () => {
  try{
      const data = await axios.get(URL_nivelEducativo);
      return data.data;    
  }catch(error){
      throw JSON.parse(error);
  }
}

const GetPueblosP = async () => {
  try{
      const data = await axios.get(URL_pueblosP);
      return data.data;    
  }catch(error){
      throw JSON.parse(error);
  }
}

const GetPuestos = async () => {
  try{
      const data = await axios.get(URL_puestosL);
      return data.data;    
  }catch(error){
      throw JSON.parse(error);
  }
}
//Catalogos -- Fin

const SaveEmpleado = async (
    cui,
    primerNombre,
    segundoNombre,
    tercerNombre,
    primerApellido,
    segundoApellido,
    apellidoCasada,
    correo,
    celular,
    nit,
    tipoLicencia,
    fotografia,
    noIgss,
    correoInstitucional,
    cuentaBancariaCHN,
    valorBoletoOrnato,
    actualizacionOGC,
    extencionTelefono,
    codigoImpresora,
    idNivelEducativo,
    idPubelo, 
    idComunidadLinguistica, 
    idDiscapacidad

  ) => {

    try{
        const data = {
            cui,
            primerNombre,
            segundoNombre,
            tercerNombre,
            primerApellido,
            segundoApellido,
            apellidoCasada,
            correo,
            celular,
            nit,
            tipoLicencia,
            fotografia,
            noIgss,
            correoInstitucional,
            cuentaBancariaCHN,
            valorBoletoOrnato,
            actualizacionOGC,
            extencionTelefono,
            codigoImpresora,
            idNivelEducativo,
            idPubelo, 
            idComunidadLinguistica, 
            idDiscapacidad
        };

        const response = await axios.post(crearEmpleadoEndpoint, data);
        return response.data;

    }catch(error){
       console.log(error);
    }

    
 
  };
  


//Obtener datos del DOM y mandar a llamar la ejecuion del endpoint
const EjcuatarGuardado = async () => {
    const prmCui                 = cui.value;
    const prmPrimerNombre        = primerNombre.value;
    const prmSegundoNombre       = segundoNombre.value;
    const prmTercerNombre        = tercerNombre.value;
    const prmPrimerApellido      = primerApellido.value;
    const prmSegundoApellido     = segundoApellido.value;
    const prmApellidoCasada      = apellidoCasada.value;
    const prmCorreo              = correo.value;
    const prmCelular             = parseInt(celular.value);
    const prmNit                 = nit.value;
    const prmTipoLicencia        = tipoLicencia.value;
    const prmFotografia          = fotografia.value;
    const prmNoIgss              = noIgss.value;
    const prmCorreoInstitucional = correoInstitucional.value;
    const prmCuentaBancariaCHN   = cuentaBancariaCHN.value;
    const prmValorBoletoOrnato   = parseInt(valorBoletoOrnato.value);
    const prmActualizacionOGC    = actualizacionOGC.value;
    const prmExtencionTelefono   = extencionTelefono.value;
    const prmCodigoImpresora     = codigoImpresora.value;
    const prmIdNivelEducativo    = educacionSelect.value;
    const prmIdPubelo            = pueblosSelect.value;
    const prmIdComunidadLinguistica = ComunidadSelect.value; 
    const prmIdDiscapacidad         = discapacidadSelect.value;

    try{

        const res = await SaveEmpleado(
            prmCui,
            prmPrimerNombre,
            prmSegundoNombre,
            prmTercerNombre,
            prmPrimerApellido,
            prmSegundoApellido,
            prmApellidoCasada,
            prmCorreo,
            prmCelular,
            prmNit,
            prmTipoLicencia,
            prmFotografia,
            prmNoIgss,
            prmCorreoInstitucional,
            prmCuentaBancariaCHN,
            prmValorBoletoOrnato,
            prmActualizacionOGC,
            prmExtencionTelefono,
            prmCodigoImpresora,
            prmIdNivelEducativo,
            prmIdPubelo,
            prmIdComunidadLinguistica,
            prmIdDiscapacidad,
          );
          
        // Mostrar el modal de confirmación de datos guardados
        $('#confirmacionGuardadoModal').modal('show');    
          // Uso de la función
        limpiarDatos();

    }catch(error){
        console.log(error);
    }
    
} 


const MostrarComunidadesL = async () => {
  try {
      const data = await GetComunidadLinguistica();
      // Limpia las opciones existentes en el select
      ComunidadSelect.innerHTML = '';

      // Recorre los departamentos y crea una opción para cada uno
      data.comunidadesL.forEach((cumunidades) => {
          const option = document.createElement("option");
          option.value = cumunidades.idComunididadLin;
          option.textContent = cumunidades.tipoComunidad;
          ComunidadSelect.appendChild(option);
      });

  } catch (error) {
      console.log(error)
  }
}


const MostrarDiscapacidades = async () => {
  try {
      const data = await GetDiscapacidades();
      // Limpia las opciones existentes en el select
      discapacidadSelect.innerHTML = '';

      // Recorre los departamentos y crea una opción para cada uno
      data.discapacidades.forEach((discapacidad) => {
          const option = document.createElement("option");
          option.value = discapacidad.idDiscapacidad;
          option.textContent = discapacidad.tipoDiscapacidad;
          discapacidadSelect.appendChild(option);
      });

  } catch (error) {
      console.log(error)
  }
}

const MostrarNivelEducativo = async () => {
  try {
      const data = await GetNivelEducativo();
      // Limpia las opciones existentes en el select
      educacionSelect.innerHTML = '';

      // Recorre los departamentos y crea una opción para cada uno
      data.nivelesEducacion.forEach((educacion) => {
          const option = document.createElement("option");
          option.value = educacion.codigo;
          option.textContent = educacion.nivelEducativo;
          educacionSelect.appendChild(option);
      });

  } catch (error) {
      console.log(error)
  }
}

const MostrarPueblos = async () => {
  try {
      const data = await GetPueblosP();
      // Limpia las opciones existentes en el select
      pueblosSelect.innerHTML = '';

      // Recorre los departamentos y crea una opción para cada uno
      data.pueblosList.forEach((pueblo) => {
          const option = document.createElement("option");
          option.value = pueblo.idPuebloPertenencia;
          option.textContent = pueblo.tipoPueblo;
          pueblosSelect.appendChild(option);
      });

  } catch (error) {
      console.log(error)
  }
}


const MostrarPuestos = async () => {
  try {
      const data = await GetPuestos();
      // Limpia las opciones existentes en el select
      puestoSelect.innerHTML = '';

      // Recorre los departamentos y crea una opción para cada uno
      data.puestosL.forEach((puestos) => {
          const option = document.createElement("option");
          option.value = puestos.idPuesto;
          option.textContent = puestos.descripcion;
          puestoSelect.appendChild(option);
      });

  } catch (error) {
      console.log(error)
  }
}


const limpiarDatos = () => {
    cui.value = '';
    primerNombre.value = '';
    segundoNombre.value = '';
    tercerNombre.value = '';
    primerApellido.value = '';
    segundoApellido.value = '';
    apellidoCasada.value = '';
    correo.value = '';
    celular.value = '';
    nit.value = '';
    tipoLicencia.value = '';
    fotografia.value = '';
    noIgss.value = '';
    correoInstitucional.value = '';
    cuentaBancariaCHN.value = '';
    valorBoletoOrnato.value = '';
    actualizacionOGC.value = '';
    extencionTelefono.value = '';
    codigoImpresora.value = '';
  };
  
  
  document.addEventListener('DOMContentLoaded', async () => {
    await MostrarComunidadesL();
    await MostrarDiscapacidades();
    await MostrarNivelEducativo();
    await MostrarPueblos();
    await MostrarPuestos();
  });
  