import React from 'react';
import { Flame, Trophy, Volume2, VolumeX, Settings, GraduationCap } from 'lucide-react';
import { getAvatarById, TeacherAvatarSvg } from './TeacherIllustrations';

export default function Header({
  screen,
  streak = 1,
  earnedBadgesCount = 0,
  totalBadgesCount = 8,
  soundEnabled = true,
  avatarId = 'mateo',
  hasSelectedAvatar = false,
  onToggleSound,
  onOpenAvatarSelector,
  onGoHome,
}) {
  const avatar = getAvatarById(avatarId);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-slate-200/90 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        {/* Marca ProfeListo */}
        <button
          type="button"
          onClick={onGoHome}
          className="group flex shrink-0 items-center gap-2 rounded-2xl py-1 pr-1 text-left focus:outline-none sm:gap-2.5"
          title="ProfeListo"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border-b-4 border-[#46A302] bg-[#58CC02] text-white shadow-sm transition-transform group-hover:scale-105 sm:h-10 sm:w-10">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight sm:text-2xl">
            <span className="text-[#58CC02]">PROFE</span>
            <span className="text-[#1CB0F6]">LISTO</span>
          </span>
        </button>

        {/* Indicadores derecha */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Racha */}
          <div
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-2 border-[#FFE0B2] bg-[#FFF8EC] px-2 py-1 text-xs font-black text-[#FF9600] sm:gap-1.5 sm:px-3 sm:text-sm"
            title="Racha de estudio docente"
          >
            <Flame className="h-3.5 w-3.5 fill-[#FF9600] text-[#FF9600] sm:h-4 sm:w-4" />
            <span>{streak}</span>
          </div>

          {/* Contador de Insignias */}
          <div
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-2 border-[#FDE68A] bg-[#FEFCE8] px-2 py-1 text-xs font-black text-[#D97706] sm:gap-1.5 sm:px-3 sm:text-sm"
            title="Insignias docentes obtenidas"
          >
            <Trophy className="h-3.5 w-3.5 fill-[#FFC800] text-[#D97706] sm:h-4 sm:w-4" />
            <span>
              {earnedBadgesCount}/{totalBadgesCount}
            </span>
          </div>

          {/* Sonido */}
          <button
            type="button"
            onClick={onToggleSound}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 sm:h-9 sm:w-9"
            title={soundEnabled ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido'}
            aria-label="Alternar sonido"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#1CB0F6]" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>

          {/* Elegir Profe / Avatar Activo */}
          {screen === 'upload' && !hasSelectedAvatar ? (
            <button
              type="button"
              onClick={onOpenAvatarSelector}
              className="btn-3d btn-3d-outline-blue shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] uppercase sm:px-3.5 sm:text-xs"
            >
              Elegir Profe
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAvatarSelector}
              className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-[#BCE6FB] bg-[#F0F9FF] py-0.5 pl-1 pr-2 text-xs font-extrabold text-slate-700 transition hover:bg-[#E0F2FE] sm:gap-2 sm:py-1 sm:pl-1.5 sm:pr-3"
              title="Cambiar avatar de profesor"
            >
              <TeacherAvatarSvg avatarId={avatar.id} mode="head" size={24} />
              <span className="hidden md:inline">{avatar.name}</span>
              <Settings className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
