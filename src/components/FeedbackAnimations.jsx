import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, Sparkles, ShieldAlert } from 'lucide-react';
import { BadgeIconSvg, TeacherAvatarSvg } from './TeacherIllustrations';

/**
 * Animación compacta de colegas profesores con delantal celebrando al acertar una pregunta.
 */
export function CelebratingTeachersBanner({ praiseText }) {
  return (
    <div className="animate-pop-in flex items-center gap-3 rounded-2xl bg-white/90 px-3.5 py-2 shadow-sm ring-2 ring-[#89E219]">
      <div className="flex -space-x-3">
        <div className="animate-bounce-gentle" style={{ animationDelay: '0ms' }}>
          <TeacherAvatarSvg avatarId="lucia" mode="head" size={44} />
        </div>
        <div className="animate-bounce-gentle" style={{ animationDelay: '160ms' }}>
          <TeacherAvatarSvg avatarId="mateo" mode="head" size={44} />
        </div>
        <div className="animate-bounce-gentle" style={{ animationDelay: '320ms' }}>
          <TeacherAvatarSvg avatarId="elena" mode="head" size={44} />
        </div>
      </div>
      <div className="text-left">
        <p className="text-xs font-black uppercase tracking-wider text-[#46A302]">
          ¡Sala de profes celebrando en delantal! 🎉
        </p>
        <p className="text-xs font-bold text-slate-700">{praiseText}</p>
      </div>
    </div>
  );
}

/**
 * Modal de Victoria al superar un nivel completo: profesores con delantal celebrando + insignia docente.
 */
export function LevelVictoryModal({ level, avatarId, isLastLevel, onContinue }) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 85,
        spread: 72,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignorar en entornos sin canvas
    }
  }, []);

  if (!level) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="card-duo animate-pop-in relative w-full max-w-lg overflow-hidden p-6 text-center sm:p-8">
        <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#D7FFB8] px-4 py-1 text-xs font-black uppercase tracking-wider text-[#3A8700]">
          <Sparkles className="h-4 w-4" />
          {isLastLevel ? '¡Aventura Curricular Completada!' : `¡Nivel ${level.levelNumber} Superado!`}
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-800 sm:text-3xl">
          ¡Tus colegas te aplauden de pie!
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Dominaste <span className="font-extrabold text-slate-700">{level.title}</span> ({level.domainCode})
        </p>

        {/* Escena de profesores con delantal celebrando */}
        <div className="my-5 flex items-end justify-center gap-2 rounded-3xl bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] px-4 py-4 ring-2 ring-[#BBF7D0]">
          <div className="animate-bounce-gentle hidden sm:block" style={{ animationDelay: '120ms' }}>
            <TeacherAvatarSvg avatarId="carlos" mode="full" size={88} celebrating />
          </div>
          <div className="animate-bounce-gentle">
            <TeacherAvatarSvg avatarId={avatarId} mode="full" size={112} celebrating />
          </div>
          <div className="animate-bounce-gentle" style={{ animationDelay: '240ms' }}>
            <TeacherAvatarSvg avatarId={avatarId === 'lucia' ? 'elena' : 'lucia'} mode="full" size={88} celebrating />
          </div>
        </div>

        {/* Insignia ganada */}
        <div className="mx-auto mb-5 flex items-center gap-4 rounded-2xl border-2 border-[#FDE047] bg-[#FEFCE8] p-4 text-left">
          <BadgeIconSvg icon={level.badge?.icon} unlocked size={58} />
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-700">
              <Award className="h-3.5 w-3.5" /> Nueva Insignia Docente Desbloqueada
            </span>
            <h3 className="text-lg font-black text-slate-800">{level.badge?.name}</h3>
            <p className="text-xs font-semibold text-slate-600">{level.badge?.description}</p>
          </div>
        </div>

        {/* Estado de pistas y punto de control */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-[#E0F2FE] px-3 py-1.5 text-[#0369A1]">
            💡 Pistas recargadas al 100 % (5/5)
          </span>
          <span className="rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[#B45309]">
            🚩 Punto de control actualizado
          </span>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="btn-3d btn-3d-green w-full py-3.5 text-base uppercase"
        >
          {isLastLevel ? 'Ver mi Mapa de Maestría 🏆' : 'Continuar por el Camino 🚀'}
        </button>
      </div>
    </div>
  );
}

/**
 * Ilustración animada del Jefe / Director amonestando al agotar el margen de errores
 * y devolviendo al jugador al último Punto de Control guardado.
 */
export function BossScoldingModal({ checkpointLevelNumber, hintsLeftWhenFailed, onReturnToCheckpoint }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-sm">
      <div className="card-duo animate-pop-in w-full max-w-lg border-red-200 p-6 text-center sm:p-8">
        <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFDFE0] px-4 py-1 text-xs font-black uppercase tracking-wider text-[#EA2B2B]">
          <ShieldAlert className="h-4 w-4" />
          ¡Llamado a Dirección Académica!
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-800 sm:text-3xl">
          ¡El Director te ha amonestado!
        </h2>
        <p className="mt-1.5 text-sm font-semibold text-slate-600">
          {hintsLeftWhenFailed === 0
            ? 'Agotaste tus pistas y superaste el límite de errores permitidos en este nivel.'
            : 'Superaste el límite de errores del nivel sin aprovechar a tiempo tus pistas pedagógicas.'}
        </p>

        {/* Ilustración cartoon del Jefe / Director amonestando */}
        <div className="my-5 flex flex-col items-center justify-center rounded-3xl border-2 border-red-200 bg-gradient-to-b from-[#FFF5F5] to-[#FFE4E6] p-5">
          <div className="animate-shake-boss">
            <svg width="146" height="132" viewBox="0 0 150 135" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Nubecillas de enojo cartoon */}
              <path d="M24 26L32 32M22 35L31 35" stroke="#EA2B2B" strokeWidth="3" strokeLinecap="round" />
              <path d="M126 26L118 32M128 35L119 35" stroke="#EA2B2B" strokeWidth="3" strokeLinecap="round" />

              {/* Traje formal del jefe/director */}
              <rect x="40" y="68" width="70" height="56" rx="18" fill="#1E293B" />
              <polygon points="75,68 62,96 88,96" fill="#FFFFFF" />
              <polygon points="75,73 70,96 75,108 80,96" fill="#EA2B2B" />

              {/* Brazo señalando carpeta de amonestación */}
              <path d="M38 78L19 60" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
              <circle cx="17" cy="57" r="7" fill="#F6C29F" />
              {/* Carpeta roja */}
              <rect x="96" y="75" width="32" height="40" rx="4" fill="#FCA5A5" stroke="#DC2626" strokeWidth="2.5" />
              <line x1="103" y1="86" x2="121" y2="86" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="103" y1="94" x2="118" y2="94" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />

              {/* Cabeza del jefe */}
              <circle cx="75" cy="43" r="25" fill="#F6C29F" />
              {/* Cabello canoso lateral */}
              <path d="M50 38C50 28 55 23 60 23C56 29 55 34 54 41H50V38Z" fill="#64748B" />
              <path d="M100 38C100 28 95 23 90 23C94 29 95 34 96 41H100V38Z" fill="#64748B" />

              {/* Cejas fruncidas expresivas */}
              <line x1="57" y1="33" x2="70" y2="38" stroke="#1E293B" strokeWidth="3.8" strokeLinecap="round" />
              <line x1="93" y1="33" x2="80" y2="38" stroke="#1E293B" strokeWidth="3.8" strokeLinecap="round" />

              {/* Ojos y gafas cuadradas */}
              <rect x="56" y="38" width="15" height="10" rx="2.5" stroke="#334155" strokeWidth="2.4" fill="#FFFFFF" fillOpacity="0.35" />
              <rect x="79" y="38" width="15" height="10" rx="2.5" stroke="#334155" strokeWidth="2.4" fill="#FFFFFF" fillOpacity="0.35" />
              <circle cx="64" cy="43" r="2.5" fill="#0F172A" />
              <circle cx="86" cy="43" r="2.5" fill="#0F172A" />

              {/* Bigote grueso y boca regañando */}
              <path d="M61 54C66 50 84 50 89 54" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
              <rect x="67" y="57" width="16" height="7" rx="3.5" fill="#991B1B" />
            </svg>
          </div>
          <p className="mt-2 rounded-xl bg-white/90 px-4 py-2 text-xs font-extrabold text-red-700 shadow-2xs">
            «¡Profe! Toca repasar el Marco para la Buena Enseñanza desde su último Punto de Control.»
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900 ring-1 ring-amber-200">
          Regresarás al <span className="font-black">Punto de Control del Nivel {checkpointLevelNumber}</span> con tus{' '}
          <span className="font-black">5 pistas recargadas al 100 %</span>.
        </div>

        <button
          type="button"
          onClick={onReturnToCheckpoint}
          className="btn-3d btn-3d-red w-full py-3.5 text-base uppercase"
        >
          <RotateCcw className="h-5 w-5" />
          Volver al Punto de Control (Nivel {checkpointLevelNumber})
        </button>
      </div>
    </div>
  );
}
