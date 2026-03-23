import { login } from "../auth/auth.js";
import { createContext, useState } from "react";
import { GuardarDiasAcreditados } from "../VacationApp/Historial/SetearDias.service.js";


const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authenticate = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(username, password);
      const userData = response.userLogin.userData;
      const token = response.userLogin.token; // Obtener JWT
      setUserData(userData);
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("authToken", token); // Guardar JWT

      //Aqui colocamos todo lo que queremos que se ejecute en segundo plano al iniciar sesion.
      //---------------------------------------------------------------------------------------


      // Ejecuta `GuardarDiasAcreditados` en segundo plano
      GuardarDiasAcreditados(userData); // Llamada sin `await`



      //---------------------------------------------------------------------------------------
      
    } catch (err) {
      if (err && err.message && err.response.status === 500) {
        setError("Servicio no disponible, intente más tarde");
      } else if (err && err.response.data.userLogin.codErr) {
        setError("Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.");
      } else {
        setError("Ha ocurrido un error");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserData(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("authToken"); // Eliminar JWT al cerrar sesión
  };

  const data = { logout, userData, authenticate, loading, error };
  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
export default AuthContext;
