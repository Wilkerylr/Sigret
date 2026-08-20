import React, { useState, useEffect } from "react";
import { Lock, Shield, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { ENDPOINTS } from "@/api/endpoints";
import apiClient from "@/api/client";
import "./PrimerLogin.css";

interface PreguntaSeguridad {
  id: number;
  texto_pregunta: string;
}

type Paso = "contraseña" | "preguntas" | "exito";

const PrimerLogin: React.FC = () => {
  const [paso, setPaso] = useState<Paso>("contraseña");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preguntas, setPreguntas] = useState<PreguntaSeguridad[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setPrimerLogin } = useAuthContext();
  const navigate = useNavigate();

  // Cargar preguntas de seguridad disponibles
  useEffect(() => {
    const cargarPreguntas = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.AUTH.PREGUNTAS_SEGURIDAD);
        if (response.data) {
          setPreguntas(response.data);
        }
      } catch (err) {
        console.error("Error al cargar preguntas:", err);
      }
    };
    cargarPreguntas();
  }, []);

  // Paso 1: Cambiar contraseña
  const handleContraseñaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nuevaContraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.put(ENDPOINTS.AUTH.CAMBIAR_CONTRASEÑA, {
        nueva_contraseña: nuevaContraseña,
      });

      if (response.status === 200) {
        setPaso("preguntas");
      } else {
        setError("Error al actualizar la contraseña.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Error al actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Registrar preguntas de seguridad
  const handlePreguntasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar que todas las preguntas tengan respuesta
    const respuestasArray = Object.entries(respuestas)
      .filter(([, respuesta]) => respuesta.trim() !== "")
      .map(([preguntaId, respuesta]) => ({
        preguntaId: Number(preguntaId),
        respuesta,
      }));

    if (respuestasArray.length < 3) {
      setError("Debes responder al menos 3 preguntas de seguridad.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTRAR_PREGUNTAS, {
        respuestas: respuestasArray,
      });

      if (response.status === 200) {
        setPrimerLogin(false);
        setPaso("exito");
      } else {
        setError("Error al registrar las preguntas de seguridad.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Error al registrar las preguntas de seguridad.");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 3: Éxito
  if (paso === "exito") {
    return (
      <div className="primer-login-container">
        <div className="primer-login-card">
          <div className="primer-login-header">
            <div className="primer-login-icono-exito">
              <Check size={48} />
            </div>
            <h1>¡Configuración Completa!</h1>
            <p>
              Tu contraseña ha sido actualizada y tus preguntas de seguridad han sido registradas.
              Ya puedes usar el sistema normalmente.
            </p>
          </div>
          <button
            type="button"
            className="primer-login-button"
            onClick={() => navigate("/home")}
          >
            <ArrowRight size={18} aria-hidden="true" />
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="primer-login-container">
      <div className="primer-login-card">
        <div className="primer-login-header">
          <div className="primer-login-icono">
            {paso === "contraseña" ? <Lock size={32} /> : <Shield size={32} />}
          </div>
          <h1>Configuración Inicial</h1>
          <p>
            {user?.username && <strong>Bienvenido, {user.username}!</strong>}
            <br />
            {paso === "contraseña"
              ? "Para comenzar, establece tu nueva contraseña personal."
              : "Ahora, registra tus preguntas de seguridad para proteger tu cuenta."}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="primer-login-steps">
          <div className={`step ${paso === "contraseña" || paso === "preguntas" || paso === "exito" ? "active" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Contraseña</span>
          </div>
          <div className={`step ${paso === "preguntas" || paso === "exito" ? "active" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">Preguntas</span>
          </div>
        </div>

        {paso === "contraseña" && (
          <form onSubmit={handleContraseñaSubmit} noValidate>
            <div className="input-group">
              <label htmlFor="nueva-contraseña">
                <Lock size={16} aria-hidden="true" />
                Nueva contraseña
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="nueva-contraseña"
                  placeholder="Mínimo 6 caracteres"
                  value={nuevaContraseña}
                  onChange={(e) => setNuevaContraseña(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmar-contraseña">
                <Lock size={16} aria-hidden="true" />
                Confirmar contraseña
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmar-contraseña"
                  placeholder="Repite tu contraseña"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="primer-login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="primer-login-button" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <>
                  <ArrowRight size={18} aria-hidden="true" />
                  Continuar
                </>
              )}
            </button>
          </form>
        )}

        {paso === "preguntas" && (
          <form onSubmit={handlePreguntasSubmit} noValidate>
            <div className="preguntas-info">
              <Shield size={16} />
              <span>Selecciona y responde al menos 3 preguntas de seguridad</span>
            </div>

            {preguntas.slice(0, 5).map((pregunta) => (
              <div key={pregunta.id} className="input-group">
                <label htmlFor={`pregunta-${pregunta.id}`}>
                  {pregunta.texto_pregunta}
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`pregunta-${pregunta.id}`}
                    placeholder="Tu respuesta"
                    value={respuestas[pregunta.id] || ""}
                    onChange={(e) =>
                      setRespuestas((prev) => ({ ...prev, [pregunta.id]: e.target.value }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}

            {error && (
              <div className="primer-login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="primer-login-button" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <>
                  <Check size={18} aria-hidden="true" />
                  Finalizar configuración
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PrimerLogin;
