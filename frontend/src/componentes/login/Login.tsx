import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import "../Global.css";

// Componente de formulario de inicio de sesión

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (username === "admin" && password === "password") {
            alert("Login exitoso");
            navigate("/home");
        } else {
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div className="pantalla-login">
            <div className="Loginform">
                <h2>Iniciar sesion</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div>
                        <label htmlFor="username">Nombre de usuario:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
        </div>
    );
};

export default LoginForm;