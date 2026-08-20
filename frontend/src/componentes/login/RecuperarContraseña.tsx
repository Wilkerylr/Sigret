import React, { useState } from "react";
import { KeyRound, Mail, Shield, Eye, EyeOff, ArrowLeft, Check, Lock } from "lucide-react";
import { ENDPOINTS } from "@/api/endpoints";
import apiClient from "@/api/client";
import "./Login.css";

interface PreguntaSeguridad {
  id: number;
  texto_pregunta: string;
}

interface RecuperarContraseñaProps {
  onVolver: () => void;
}

type Paso = "email" | "preguntas" | "nueva_contraseña" | "exito";

const RecuperarContraseña: React.FC<RecuperarContraseñaProps> = ({ onVolver }) => {
  const [paso, setPaso] = useState<Paso>("email");
  const [email, setEmail] = useState("");
  const [preguntas, setPreguntas] = useState<PreguntaSeguridad[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tokenTemporal, setTokenTemporal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFICAR_PREGUNTAS, {
        email: email.trim().toLowerCase(),
        respuestas: [],
      });

      if (response.data.tiene_preguntas) {
        setPreguntas(response.data.preguntas);
        setPaso("preguntas");
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.status === 400) {
        setError("No tienes preguntas de seguridad registradas. Contacta al administrador.");
      } else if (error.response?.status === 404) {
        setError("No se encontró una cuenta con ese correo electrónico.");
      } else {
        setError(error.response?.data?.error || "Error al verificar el email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespuestasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const respuestasArray = Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
        preguntaId: Number(preguntaId),
        respuesta,
      }));

      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFICAR_PREGUNTAS, {
        email: email.trim().toLowerCase(),
        respuestas: respuestasArray,
      });

      setTokenTemporal(response.data.token_temporal);
      setPaso("nueva_contraseña");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Las respuestas son incorrectas. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevaContraseñaSubmit = async (e: React.FormEvent) => {
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
      await apiClient.post(
        ENDPOINTS.AUTH.RECUPERAR_CONTRASEÑA,
        { nueva_contraseña: nuevaContraseña },
        { headers: { Authorization: `Bearer ${tokenTemporal}` } }
      );

      setPaso("exito");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Error al actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar según el paso actual
  if (paso === "exito") {
    return (
      <div className="login-card">
        <div className="login-card-header">
          <div className="recuperacion-icono-exito">
            <Check size={48} />
          </div>
          <h2>Contraseña Actualizada</h2>
          <p>Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
        <button type="button" className="login-button" onClick={onVolver}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="login-card">
      <div className="login-card-header">
        <div className="recuperacion-icono">
          <KeyRound size={32} />
        </div>
        <h2>Recuperar Contraseña</h2>
        <p>
          {paso === "email" && "Ingresa tu correo electrónico para comenzar el proceso de recuperación."}
          {paso === "preguntas" && "Responde tus preguntas de seguridad para verificar tu identidad."}
          {paso === "nueva_contraseña" && "Establece tu nueva contraseña."}
        </p>
      </div>

      {paso === "email" && (
        <form onSubmit={handleEmailSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="recuperar-email">
              <Mail size={16} aria-hidden="true" />
              Correo electrónico
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="recuperar-email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
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
                <Mail size={18} aria-hidden="true" />
                Continuar
              </>
            )}
          </button>
        </form>
      )}

      {paso === "preguntas" && (
        <form onSubmit={handleRespuestasSubmit} noValidate>
          {preguntas.map((pregunta) => (
            <div key={pregunta.id} className="input-group">
              <label htmlFor={`pregunta-${pregunta.id}`}>
                <Shield size={16} aria-hidden="true" />
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
                  required
                />
              </div>
            </div>
          ))}

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
                <Shield size={18} aria-hidden="true" />
                Verificar respuestas
              </>
            )}
          </button>
        </form>
      )}

      {paso === "nueva_contraseña" && (
        <form onSubmit={handleNuevaContraseñaSubmit} noValidate>
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
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              <>
                <KeyRound size={18} aria-hidden="true" />
                Actualizar contraseña
              </>
            )}
          </button>
        </form>
      )}

      <button
        type="button"
        className="login-back-button"
        onClick={onVolver}
        disabled={isLoading}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al inicio de sesión
      </button>
    </div>
  );
};

export default RecuperarContraseña;
