import React, { useState } from "react";
import { LogIn, User, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import "./Login.css";
import "../Global.css";

/**
 * Página de inicio de sesión.
 * Separa la UI del formulario de la lógica de autenticación (useAuthContext hook).
 */
const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const success = await login(email, password);

        if (success) {
            navigate("/home");
        } else {
            setError("Credenciales incorrectas. Intenta de nuevo.");
        }
    };

    return (
        <div className="pantalla-login">
            <div className="login-branding">
                <div className="branding-icon">
                    <LogIn size={48} />
                </div>
                <h1 className="branding-title">Sigret</h1>
                <p className="branding-subtitle">Sistema de Gestión de Reportes Tecnicos</p>
            </div>

            <div className="login-card">
                <div className="login-card-header">
                    <h2>Bienvenido</h2>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label htmlFor="email">
                            <User size={16} aria-hidden="true" />
                            Correo electrónico
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                id="email"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">
                            <Lock size={16} aria-hidden="true" />
                            Contraseña
                        </label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner" aria-hidden="true" />
                        ) : (
                            <>
                                <LogIn size={18} aria-hidden="true" />
                                Iniciar sesión
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;