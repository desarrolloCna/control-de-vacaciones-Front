//DOM
const username = document.getElementById("username");
const password  = document.getElementById("password");

//div
const message = document.getElementById("message");
const datosincorrectos = document.getElementById("datosincorrectos");


const URLLOGIN = "http://localhost:3000/api/login";


const ConsultarUsuario = async (usuario, pass) => {
    try{
        const data = {
            usuario,
            pass
        }
        const response = await axios.post(URLLOGIN, data);
        return response.data;
    }catch(error){

    }
}

const EjecutarConsultaUsuario = async () => {
    const usuario = username.value;
    const pass = password.value;
    try{

        const res = await ConsultarUsuario(usuario, pass);
        

        if(res.data.codError !== 874){
            if(res.data.codError === 785){
                message.style.color = "red";
                message.removeAttribute("hidden");
            }else{
                localStorage.setItem("usuario", JSON.stringify(res.data));
                location.href = "../../Cui/Cui.html";   
            }
        }else{
            message.style.color = "red";
            message.removeAttribute("hidden");
            datosincorrectos.textContent = "El Usuario ingresado No Existe";
            message.removeAttribute("hidden");
        }


    }catch(error){

    }

}



