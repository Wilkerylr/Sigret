/* ======================================
   components/LeyendaRoles.tsx
   Leyenda informativa de roles y sus permisos por defecto
   Responsabilidad única: Mostrar tabla de roles con sus permisos base
   ====================================== */

import React from 'react';
import { Info } from 'lucide-react';
import { OPCIONES_ROLES, PERMISOS_SISTEMA, PERMISOS_POR_ROL } from '../hooks/useGestionUsuarios';

const PERMISOS_LABEL_MAP = Object.fromEntries(
  PERMISOS_SISTEMA.map(p => [p.value, p.label])
);

const LeyendaRoles: React.FC = () => {
  return (
    <div className="roles-leyenda">
      <div className="roles-leyenda-header">
        <Info size={16} />
        <span>Leyenda de Roles y Permisos por Defecto</span>
      </div>
      <div className="roles-leyenda-grid">
        {OPCIONES_ROLES.map(rol => (
          <div key={rol.value} className="roles-leyenda-item">
            <div className="roles-leyenda-rol">
              <span className={`rol-badge rol-badge--${rol.value}`}>
                {rol.label}
              </span>
            </div>
            <ul className="roles-leyenda-permisos">
              {(PERMISOS_POR_ROL[rol.value] || []).map(perm => (
                <li key={perm}>
                  {PERMISOS_LABEL_MAP[perm] || perm}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeyendaRoles;