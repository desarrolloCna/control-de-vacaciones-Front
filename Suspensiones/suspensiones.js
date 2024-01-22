//DOM
// Obtener referencias a los elementos del formulario 
const codigoColaboradorIn = document.getElementById("codigoColaborador");
const fechaSuspensionIn = document.getElementById("fechaSuspension");
const motivoIn = document.getElementById("motivo");
const numeroAcuerdoIn = document.getElementById("numeroAcuerdo");
const numeroActaIn = document.getElementById("numeroActa");

//Endpoinst
const URL_GuardarSuspesnsiones = "http://localhost:3000/api/ingresarSuspensiones";



const SaveSuspension = async (codigoColaborador, fechaSuspension, motivo, numeroAcuerdo, numeroActa) => {
    try{
        const data = {
            codigoColaborador,
            fechaSuspension, 
            motivo,
            numeroAcuerdo,
            numeroActa
        }
        const response = await axios.post(URL_GuardarSuspesnsiones, data);
        return response.data;
    }catch(error){
        throw JSON.parse(error.request.response);
    }

}



const EjecutarGuardado = async () => {
    const codigoColaborador = codigoColaboradorIn.value;
    const fechaSuspension = fechaSuspensionIn.value;
    const motivo = motivoIn.value;
    const numeroAcuerdo = numeroActaIn.value;
    const numeroActa = numeroActaIn.value;

    try{

        const res = await SaveSuspension(
            codigoColaborador,
            fechaSuspension,
            motivo,
            numeroAcuerdo,
            numeroActa
            );

        // Mostrar el modal de confirmación de datos guardados
        $('#confirmacionGuardadoModal').modal('show');    

    }catch(error){
        if(error.data.sqlState == '23000'){
            alert("CODIGO DE COLABORADOR NO EXISTE EN BD!!!");
        }else{
            console.log(error);
        }

    }


};