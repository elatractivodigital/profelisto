import React from 'react';

export const TEACHER_AVATARS = [
  {
    id: 'mateo',
    name: 'Profe Mateo',
    shortName: 'Mateo',
    specialty: 'Didáctica y Planificación',
    quote: '¡Con buena estructura y pistas a tiempo no hay caso imposible!',
    bgColor: '#DDF4FF',
    ringColor: '#1CB0F6',
    apronColor: '#23B24B',
    apronDark: '#1A8C3A',
    hairColor: '#6B3F26',
    skinColor: '#FFCFAA',
    glasses: true,
    feminine: false,
    variant: 1,
  },
  {
    id: 'carlos',
    name: 'Profe Carlos',
    shortName: 'Carlos',
    specialty: 'Evaluación y Pensamiento Crítico',
    quote: '¡Cada error en el aula es una pista valiosa para enseñar mejor!',
    bgColor: '#E8F5E9',
    ringColor: '#58CC02',
    apronColor: '#1E88E5',
    apronDark: '#1565C0',
    hairColor: '#2D3142',
    skinColor: '#F1B892',
    glasses: false,
    beard: true,
    feminine: false,
    variant: 2,
  },
  {
    id: 'lucia',
    name: 'Profe Lucía',
    shortName: 'Lucía',
    specialty: 'Inclusión y Marco DUA',
    quote: '¡Diversificar caminos abre las puertas a todo el curso!',
    bgColor: '#FFF5D1',
    ringColor: '#FFC800',
    apronColor: '#00A896',
    apronDark: '#028090',
    hairColor: '#4A2511',
    skinColor: '#FFD5B8',
    glasses: false,
    feminine: true,
    variant: 1,
  },
  {
    id: 'elena',
    name: 'Profe Elena',
    shortName: 'Elena',
    specialty: 'Convivencia y Neuroeducación',
    quote: '¡Un aula segura y motivada aprende el doble y con alegría!',
    bgColor: '#F5E8FF',
    ringColor: '#CE82FF',
    apronColor: '#8E44AD',
    apronDark: '#6C3483',
    hairColor: '#8D3B24',
    skinColor: '#FFE0C8',
    glasses: true,
    feminine: true,
    variant: 2,
  },
];

export function getAvatarById(id) {
  return TEACHER_AVATARS.find((a) => a.id === id) || TEACHER_AVATARS[0];
}

/**
 * Avatar cartoon redondeado de profesor/a con delantal docente.
 * mode = 'head' (compacto circular) | 'full' (cuerpo completo estilo cartoon)
 */
export function TeacherAvatarSvg({ avatarId = 'mateo', mode = 'full', size = 96, celebrating = false }) {
  const av = getAvatarById(avatarId);

  if (mode === 'head') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="40" cy="40" r="37" fill={av.bgColor} stroke={av.ringColor} strokeWidth="4" />
        {/* Hombros con delantal */}
        <path d="M16 70C18 56 28 52 40 52C52 52 62 56 64 70" fill={av.apronColor} />
        <path d="M31 52L40 61L49 52" fill="#FFFFFF" />
        {/* Moño alto si es Lucía */}
        {av.feminine && av.variant === 1 && (
          <>
            <circle cx="40" cy="13" r="9" fill={av.hairColor} />
            <rect x="44" y="8" width="14" height="3" rx="1.5" transform="rotate(-22 44 8)" fill="#FFC800" />
          </>
        )}
        {/* Melena si es Elena */}
        {av.feminine && av.variant === 2 && (
          <path d="M19 36C19 20 28 14 40 14C52 14 61 20 61 36V47C61 50 57 52 54 50V36H26V50C23 52 19 50 19 47V36Z" fill={av.hairColor} />
        )}
        {/* Cabeza redondeada */}
        <circle cx="40" cy="36" r="18" fill={av.skinColor} />
        {/* Pelo superior */}
        {!av.feminine && av.variant === 1 && (
          <path d="M22 33C22 21 30 16 41 16C51 16 58 22 58 33C54 27 47 25 39 25C31 25 25 28 22 33Z" fill={av.hairColor} />
        )}
        {!av.feminine && av.variant === 2 && (
          <path d="M21 32C21 19 30 15 40 15C50 15 59 19 59 32C56 26 49 24 40 24C31 24 24 26 21 32Z" fill={av.hairColor} />
        )}
        {av.feminine && (
          <path d="M22 34C23 21 31 17 40 17C49 17 57 21 58 34C53 27 47 25 40 25C33 25 27 27 22 34Z" fill={av.hairColor} />
        )}
        {/* Ojos */}
        <circle cx="33.5" cy="36" r="2.5" fill="#2B2B2B" />
        <circle cx="46.5" cy="36" r="2.5" fill="#2B2B2B" />
        <circle cx="34.3" cy="35.2" r="0.9" fill="#FFFFFF" />
        <circle cx="47.3" cy="35.2" r="0.9" fill="#FFFFFF" />
        {/* Mejillas */}
        <circle cx="28" cy="40.5" r="3" fill="#FF8FA3" fillOpacity="0.45" />
        <circle cx="52" cy="40.5" r="3" fill="#FF8FA3" fillOpacity="0.45" />
        {/* Gafas */}
        {av.glasses && (
          <g stroke="#3A3A3A" strokeWidth="2.1">
            <circle cx="33.5" cy="36" r="6" fill="#FFFFFF" fillOpacity="0.2" />
            <circle cx="46.5" cy="36" r="6" fill="#FFFFFF" fillOpacity="0.2" />
            <line x1="39.5" y1="36" x2="40.5" y2="36" />
          </g>
        )}
        {/* Barba amigable si es Carlos */}
        {av.beard && (
          <path
            d="M27 41C28 49 34 53 40 53C46 53 52 49 53 41C49 44 45 45 40 45C35 45 31 44 27 41Z"
            fill={av.hairColor}
            fillOpacity="0.88"
          />
        )}
        {/* Sonrisa */}
        <path
          d="M34.5 43.5C36.2 46.5 43.8 46.5 45.5 43.5"
          stroke={av.beard ? '#FFFFFF' : '#7C3AED'}
          strokeOpacity={av.beard ? '0.95' : '0'}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {!av.beard && (
          <path d="M34.5 43.5C36.2 46.8 43.8 46.8 45.5 43.5" stroke="#8C3B2B" strokeWidth="2.3" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Sombra en el suelo */}
      <ellipse cx="70" cy="140" rx="34" ry="6" fill="#CBD5E1" fillOpacity="0.7" />

      {/* Piernas y zapatos redondeados */}
      <rect x="53" y="108" width="12" height="26" rx="6" fill="#334155" />
      <rect x="75" y="108" width="12" height="26" rx="6" fill="#334155" />
      <rect x="48" y="129" width="19" height="9" rx="4.5" fill="#475569" />
      <rect x="73" y="129" width="19" height="9" rx="4.5" fill="#475569" />

      {/* Brazos (animados arriba si celebra) */}
      {celebrating ? (
        <>
          <path d="M44 74L24 48" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <circle cx="22" cy="45" r="7" fill={av.skinColor} />
          <path d="M96 74L116 48" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <circle cx="118" cy="45" r="7" fill={av.skinColor} />
        </>
      ) : (
        <>
          <path d="M44 73L28 84" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <circle cx="26" cy="86" r="6.5" fill={av.skinColor} />
          <path d="M96 73L108 90" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <circle cx="109" cy="92" r="6.5" fill={av.skinColor} />
        </>
      )}

      {/* Camisa base y Delantal Docente */}
      <rect x="42" y="63" width="56" height="50" rx="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
      <rect x="44" y="66" width="52" height="48" rx="15" fill={av.apronColor} />
      {/* Cuello en V y tiras del delantal */}
      <path d="M56 64L70 77L84 64" fill="#FFFFFF" />
      <rect x="48" y="64" width="7" height="18" rx="3" fill={av.apronDark} />
      <rect x="85" y="64" width="7" height="18" rx="3" fill={av.apronDark} />

      {/* Bolsillo frontal del delantal con lápiz y regla */}
      <rect x="54" y="88" width="32" height="19" rx="6" fill={av.apronDark} />
      <rect x="59" y="81" width="5" height="10" rx="2" fill="#FFC800" />
      <rect x="66" y="83" width="5" height="8" rx="2" fill="#FF4B4B" />
      {/* Libro docente en mano si no está celebrando */}
      {!celebrating && (
        <g>
          <rect x="75" y="80" width="20" height="24" rx="4" fill="#1CB0F6" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="80" y1="86" x2="90" y2="86" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="80" y1="91" x2="88" y2="91" stroke="#DDF4FF" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Cabello trasero femenino */}
      {av.feminine && av.variant === 1 && (
        <>
          <circle cx="70" cy="14" r="11" fill={av.hairColor} />
          <rect x="74" y="8" width="18" height="4" rx="2" transform="rotate(-20 74 8)" fill="#FFC800" />
        </>
      )}
      {av.feminine && av.variant === 2 && (
        <path
          d="M42 42C42 22 54 15 70 15C86 15 98 22 98 42V58C98 62 93 64 89 61V42H51V61C47 64 42 62 42 58V42Z"
          fill={av.hairColor}
        />
      )}

      {/* Cabeza cartoon */}
      <circle cx="70" cy="42" r="24" fill={av.skinColor} />

      {/* Flequillo / Pelo superior */}
      {!av.feminine && (
        <path
          d="M46 38C46 22 56 16 70 16C84 16 94 22 94 38C89 30 80 27 70 27C60 27 51 30 46 38Z"
          fill={av.hairColor}
        />
      )}
      {av.feminine && (
        <path
          d="M46 39C47 22 57 17 70 17C83 17 93 22 94 39C88 30 80 28 70 28C60 28 52 30 46 39Z"
          fill={av.hairColor}
        />
      )}

      {/* Ojos expresivos */}
      <circle cx="61" cy="42" r="3.2" fill="#262626" />
      <circle cx="79" cy="42" r="3.2" fill="#262626" />
      <circle cx="62" cy="41" r="1.1" fill="#FFFFFF" />
      <circle cx="80" cy="41" r="1.1" fill="#FFFFFF" />

      {/* Mejillas sonrojadas */}
      <circle cx="53" cy="48" r="4" fill="#FF8FA3" fillOpacity="0.45" />
      <circle cx="87" cy="48" r="4" fill="#FF8FA3" fillOpacity="0.45" />

      {/* Gafas docentes */}
      {av.glasses && (
        <g stroke="#334155" strokeWidth="2.5">
          <circle cx="61" cy="42" r="7.8" fill="#FFFFFF" fillOpacity="0.22" />
          <circle cx="79" cy="42" r="7.8" fill="#FFFFFF" fillOpacity="0.22" />
          <line x1="68.8" y1="42" x2="71.2" y2="42" />
        </g>
      )}

      {/* Barba si es Carlos */}
      {av.beard && (
        <path
          d="M52 49C54 59 61 64 70 64C79 64 86 59 88 49C83 53 77 54 70 54C63 54 57 53 52 49Z"
          fill={av.hairColor}
        />
      )}

      {/* Sonrisa */}
      <path
        d="M62 52C65 56.5 75 56.5 78 52"
        stroke={av.beard ? '#FFFFFF' : '#8C3B2B'}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Ilustraciones vectoriales para las 10 insignias temáticas docentes.
 */
export function BadgeIconSvg({ icon = 'pencil', unlocked = false, size = 40 }) {
  const opacityClass = unlocked ? '' : 'grayscale opacity-45';
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center rounded-2xl transition-all ${
        unlocked ? 'bg-[#FFF9DB] ring-2 ring-[#FFC800]' : 'bg-slate-100 ring-1 ring-slate-200'
      } ${opacityClass}`}
    >
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 36 36" fill="none">
        {icon === 'pencil' && (
          <>
            <path d="M7 25L24 8L28 12L11 29H7V25Z" fill="#FFC800" stroke="#D97706" strokeWidth="2" />
            <path d="M22 10L26 14" stroke="#D97706" strokeWidth="2" />
            <path d="M7 29L11 29L7 25V29Z" fill="#374151" />
          </>
        )}
        {icon === 'book' && (
          <>
            <rect x="6" y="7" width="24" height="22" rx="4" fill="#1CB0F6" />
            <path d="M18 7V29" stroke="#FFFFFF" strokeWidth="2.2" />
            <rect x="9" y="11" width="6" height="2.5" rx="1" fill="#DDF4FF" />
            <rect x="21" y="11" width="6" height="2.5" rx="1" fill="#DDF4FF" />
          </>
        )}
        {icon === 'apron' && (
          <>
            <path d="M11 8H15L18 12L21 8H25L27 29H9L11 8Z" fill="#58CC02" stroke="#46A302" strokeWidth="2" />
            <rect x="14" y="19" width="8" height="6" rx="2" fill="#D7FFB8" />
          </>
        )}
        {icon === 'bonus' && (
          <>
            <rect x="6" y="8" width="24" height="20" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
            <circle cx="24" cy="21" r="4" fill="#FFC800" />
            <line x1="10" y1="13" x2="21" y2="13" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="18" x2="17" y2="18" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {icon === 'bills' && (
          <>
            <rect x="5" y="11" width="24" height="14" rx="3" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
            <rect x="8" y="8" width="23" height="14" rx="3" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
            <circle cx="19.5" cy="15" r="3.5" fill="#DCFCE7" />
            <rect x="17.5" y="8" width="4" height="14" fill="#FFC800" fillOpacity="0.85" />
          </>
        )}
        {icon === 'coffee' && (
          <>
            <rect x="9" y="12" width="15" height="16" rx="4" fill="#FB923C" stroke="#C2410C" strokeWidth="2" />
            <path d="M24 15H27C28.5 15 29.5 16.5 29.5 18C29.5 19.5 28.5 21 27 21H24" stroke="#C2410C" strokeWidth="2" />
            <path d="M14 9C14 7 16 7 16 5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 9C19 7 21 7 21 5" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {icon === 'apple' && (
          <>
            <circle cx="18" cy="20" r="9" fill="#FF4B4B" />
            <path d="M18 11C18 8 21 6 23 7C23 9 20 11 18 11Z" fill="#58CC02" />
          </>
        )}
        {icon === 'board' && (
          <>
            <rect x="5" y="8" width="26" height="18" rx="3" fill="#0F766E" stroke="#B45309" strokeWidth="2.4" />
            <path d="M10 15H20M10 20H16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {icon === 'rubric' && (
          <>
            <rect x="8" y="6" width="20" height="24" rx="3" fill="#F3E8FF" stroke="#9333EA" strokeWidth="2" />
            <path d="M12 13L14 15L18 11" stroke="#58CC02" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M12 21L14 23L18 19" stroke="#58CC02" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}
        {icon === 'compass' && (
          <>
            <circle cx="18" cy="18" r="11" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
            <polygon points="18,10 22,18 18,26 14,18" fill="#FF4B4B" />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * Utensilios escolares decorativos animados para el fondo del Camino.
 */
export function FloatingUtensils() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      {/* Lápiz superior izquierdo */}
      <div
        className="animate-float-slow absolute left-4 top-28 opacity-85 sm:left-8"
        style={{ '--tw-rotate': '-24deg', animationDelay: '0s' }}
      >
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <rect x="8" y="17" width="24" height="8" rx="2" fill="#FFC800" stroke="#E5A400" strokeWidth="1.5" />
          <rect x="5" y="17" width="5" height="8" rx="1.5" fill="#FF8FA3" />
          <polygon points="32,17 39,21 32,25" fill="#FDE68A" />
          <polygon points="36,19.3 39,21 36,22.7" fill="#334155" />
        </svg>
      </div>

      {/* Regla derecha */}
      <div
        className="animate-float-slow absolute right-4 top-48 opacity-85 sm:right-10"
        style={{ '--tw-rotate': '28deg', animationDelay: '1.1s' }}
      >
        <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
          <rect x="2" y="5" width="44" height="14" rx="3" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
          <path d="M10 5V11M18 5V9M26 5V11M34 5V9M40 5V11" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      {/* Goma de borrar bicolor */}
      <div
        className="animate-float-slow absolute left-3 top-[46%] opacity-85 sm:left-10"
        style={{ '--tw-rotate': '-15deg', animationDelay: '0.6s' }}
      >
        <svg width="38" height="28" viewBox="0 0 38 28" fill="none">
          <rect x="4" y="6" width="18" height="16" rx="4" fill="#FDA4AF" />
          <rect x="19" y="6" width="15" height="16" rx="4" fill="#60A5FA" />
        </svg>
      </div>

      {/* Tijeras escolares */}
      <div
        className="animate-float-slow absolute right-5 top-[62%] opacity-80 sm:right-12"
        style={{ '--tw-rotate': '-12deg', animationDelay: '1.8s' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <line x1="14" y1="26" x2="31" y2="9" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="26" y1="26" x2="9" y2="9" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <circle cx="12" cy="29" r="5" stroke="#FF4B4B" strokeWidth="3" fill="#FFF1F2" />
          <circle cx="28" cy="29" r="5" stroke="#FF4B4B" strokeWidth="3" fill="#FFF1F2" />
        </svg>
      </div>

      {/* Escuadra inferior izquierda */}
      <div
        className="animate-float-slow absolute bottom-28 left-5 opacity-80 sm:left-12"
        style={{ '--tw-rotate': '12deg', animationDelay: '2.3s' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <polygon points="6,34 6,8 32,34" fill="#BAE6FD" fillOpacity="0.7" stroke="#0284C7" strokeWidth="2" />
          <polygon points="11,29 11,18 22,29" fill="#F7F9FB" />
        </svg>
      </div>
    </div>
  );
}
