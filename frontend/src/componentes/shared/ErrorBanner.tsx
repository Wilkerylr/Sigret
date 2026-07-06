/**
 * Componente para mostrar errores de API con opción de reintentar
 */
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  mensaje: string;
  detalle?: Record<string, string>;
  onReintentar?: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ mensaje, detalle, onReintentar }) => {
  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-contenido">
        <AlertTriangle size={24} className="error-banner-icono" />
        <div className="error-banner-texto">
          <p className="error-banner-mensaje">{mensaje}</p>
          {detalle && Object.keys(detalle).length > 0 && (
            <ul className="error-banner-detalle">
              {Object.entries(detalle).map(([campo, error]) => (
                <li key={campo}>
                  <strong>{campo}:</strong> {error}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onReintentar && (
          <button
            type="button"
            className="error-banner-btn"
            onClick={onReintentar}
            aria-label="Reintentar"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;