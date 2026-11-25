import React from 'react';
import {
  BookOpen,
  Lock,
  Check,
  Flag,
  Lightbulb,
  Trophy,
  RefreshCw,
  AlertTriangle,
  FileText,
  Rocket,
  Heart,
} from 'lucide-react';
import {
  BadgeIconSvg,
  FloatingUtensils,
  getAvatarById,
  TeacherAvatarSvg,
} from './TeacherIllustrations';

const LANE_WIDTH = 330;
const ROW_HEIGHT = 224;
const TOP_OFFSET = 118;
// Curva sinusoidal estilo Duolingo: centro -> derecha -> centro -> izquierda
const X_OFFSETS = [175, 242, 175, 108];

function getNodeCoords(index) {
  return {
    x: X_OFFSETS[index % X_OFFSETS.length],
    y: TOP_OFFSET + index * ROW_HEIGHT,
  };
}

function buildSmoothDashedPath(count) {
  if (count <= 1) return '';
  const segments = [];
  const first = getNodeCoords(0);
  segments.push(`M ${first.x} ${first.y}`);

  for (let i = 0; i < count - 1; i++) {
    const curr = getNodeCoords(i);
    const next = getNodeCoords(i + 1);
    const midY = (curr.y + next.y) / 2;
    segments.push(`C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`);
  }
  return segments.join(' ');
}

export default function LearningPath({
  campaign,
  avatarId,
  currentLevelIndex,
  unlockedLevelIndex,
  lastCheckpointIndex,
  completedLevels = [],
  earnedBadges = [],
  currentHints = 5,
  onStartLevel,
  onOpenAvatarModal,
  onOpenResetModal,
}) {
  const levels = campaign?.levels || [];
  const avatar = getAvatarById(avatarId);
  const activeLevel = levels[currentLevelIndex] || levels[0];
  const checkpointLevelNumber = (levels[lastCheckpointIndex]?.levelNumber) || 1;
  const totalSvgHeight = Math.max(320, TOP_OFFSET * 2 + Math.max(0, levels.length - 1) * ROW_HEIGHT + 40);
  const pathD = buildSmoothDashedPath(levels.length);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
        {/* COLUMNA PRINCIPAL: EL CAMINO */}
        <section className="lg:col-span-7 xl:col-span-8">
          {/* Cartel superior verde estilo Duolingo */}
          <div className="relative overflow-hidden rounded-3xl border-b-[6px] border-[#158F3E] bg-gradient-to-r from-[#58CC02] via-[#34C02B] to-[#17B351] p-5 text-white shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-[#E6FFD6]">
                  {campaign?.summary?.levelCount || levels.length} Niveles por Dominio • Dificultad{' '}
                  {campaign?.summary?.difficulty || 'Intermedia-Alta'}
                </p>
                <h1 className="mt-0.5 font-display text-2xl font-bold sm:text-3xl">
                  El Camino de Aprendizaje
                </h1>
                <p className="mt-1 text-xs font-bold text-white/90 sm:text-sm">
                  Punto de control activo: <span className="underline decoration-2">Nivel {checkpointLevelNumber}</span> •
                  Avanza resolviendo casos o usa tus 5 pistas
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenResetModal}
                className="self-start rounded-2xl border-2 border-white/40 border-b-4 border-b-black/15 bg-white/15 px-3.5 py-2 text-xs font-black uppercase tracking-wide text-white backdrop-blur-xs transition hover:bg-white/25 sm:self-center"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Gestionar PDFs
                </span>
              </button>
            </div>
          </div>

          {/* Escenario del Mapa con Utensilios Escolares Flotantes */}
          <div className="relative mt-4 rounded-3xl py-6">
            <FloatingUtensils />

            {/* Bocadillo motivacional superior */}
            <div className="relative z-10 mx-auto mb-6 flex w-fit max-w-full items-center gap-2 rounded-full border-2 border-slate-200 border-b-4 bg-white px-4 py-1.5 text-xs font-black text-slate-700 shadow-sm">
              <span>💬</span>
              <span className="truncate">¡Listo para el desafío de hoy, {avatar.name}!</span>
            </div>

            {/* Contenedor centrado del Camino Curvo Punteado */}
            <div
              className="relative mx-auto overflow-visible"
              style={{ width: `${LANE_WIDTH}px`, height: `${totalSvgHeight}px`, maxWidth: '100%' }}
            >
              {/* Línea punteada curva en SVG */}
              <svg
                width={LANE_WIDTH}
                height={totalSvgHeight}
                viewBox={`0 0 ${LANE_WIDTH} ${totalSvgHeight}`}
                fill="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <path
                  d={pathD}
                  stroke="#CBD5E1"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="13 15"
                />
              </svg>

              {/* Nodos de Libro e Hitos de Punto de Control */}
              {levels.map((lvl, idx) => {
                const coords = getNodeCoords(idx);
                const isCompleted = completedLevels.includes(lvl.levelNumber);
                const isUnlocked = idx <= unlockedLevelIndex;
                const isCurrent = idx === currentLevelIndex;
                const isSavedCheckpoint = idx === lastCheckpointIndex;

                let nodeStyle =
                  'bg-[#E5E7EB] border-[#D1D5DB] border-b-[#B8C0CC] text-slate-400 cursor-not-allowed';
                if (isCurrent) {
                  nodeStyle =
                    'bg-[#58CC02] border-[#78DF26] border-b-[#46A302] text-white ring-8 ring-[#58CC02]/25 cursor-pointer hover:brightness-105';
                } else if (isCompleted) {
                  nodeStyle =
                    'bg-[#FFC800] border-[#FFE066] border-b-[#E5A400] text-[#5C4500] cursor-pointer hover:brightness-105';
                } else if (isUnlocked) {
                  nodeStyle =
                    'bg-[#1CB0F6] border-[#62CAFA] border-b-[#1899D6] text-white cursor-pointer hover:brightness-105';
                }

                return (
                  <div
                    key={lvl.id}
                    style={{
                      left: `${coords.x}px`,
                      top: `${coords.y}px`,
                      transform: 'translate(-50%, -43px)',
                    }}
                    className="absolute z-10 flex flex-col items-center"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Avatar parado encima del nodo activo sin alterar la geometría */}
                      {isCurrent && (
                        <div className="animate-bounce-gentle pointer-events-none absolute -top-14 left-1/2 z-20 -translate-x-1/2 drop-shadow-sm">
                          <TeacherAvatarSvg avatarId={avatarId} mode="head" size={48} />
                        </div>
                      )}

                      {/* Banderín intercalado de PUNTO DE CONTROL anclado al costado izquierdo del nodo */}
                      {lvl.isCheckpoint && (
                        <div
                          className={`
                            pointer-events-none absolute right-[96px] top-1/2 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border-2 px-2.5 py-0.5 text-[10px] font-black uppercase shadow-sm
                            ${
                              isSavedCheckpoint
                                ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#B45309] ring-2 ring-[#FDE68A]'
                                : 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
                            }
                          `}
                          title="Punto de control del camino"
                        >
                          <Flag className="h-3 w-3 fill-[#EF4444] text-[#EF4444]" />
                          <span>Punto Control</span>
                        </div>
                      )}

                      {/* Nodo 3D en forma de Botón de Libro */}
                      <button
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => isUnlocked && onStartLevel(idx)}
                        className={`group relative flex flex-col items-center justify-center rounded-[1.75rem] border-2 border-b-[6px] shadow-sm transition-transform active:translate-y-1 ${nodeStyle}`}
                        style={{ width: '88px', height: '86px' }}
                        aria-label={`Nivel ${lvl.levelNumber}: ${lvl.title}`}
                      >
                        {isUnlocked ? (
                          <BookOpen className="h-8 w-8 stroke-[2.4]" />
                        ) : (
                          <Lock className="h-7 w-7 stroke-[2.4]" />
                        )}
                        <span className="mt-1 text-[10px] font-black uppercase tracking-wider">
                          Nivel {lvl.levelNumber}
                        </span>
                        {isCompleted && !isCurrent && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#58CC02] text-white ring-2 ring-white">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Etiqueta del tema e info de preguntas/vidas */}
                    <div className="mt-2 w-44 rounded-2xl border border-slate-200 border-b-2 bg-white/95 px-2.5 py-1.5 text-center shadow-2xs">
                      <p
                        className={`text-xs font-black leading-tight ${
                          isCurrent
                            ? 'text-[#46A302]'
                            : isUnlocked
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {lvl.levelNumber}. {lvl.title}
                      </p>
                      <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <span>{lvl.questionCount} casos</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-rose-500">
                          <Heart className="h-2.5 w-2.5 fill-rose-500" /> {lvl.maxLives}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barra inferior de inicio rápido del nivel actual */}
          {activeLevel && (
            <div className="card-duo mt-3 flex flex-col items-center justify-between gap-4 p-4 sm:flex-row sm:px-6">
              <div className="text-center sm:text-left">
                <p className="text-xs font-black uppercase tracking-wider text-[#1899D6]">
                  {activeLevel.domainCode} • {activeLevel.questionCount} casos prácticos • {activeLevel.maxLives} vidas
                </p>
                <h2 className="text-base font-black text-slate-800 sm:text-lg">
                  Siguiente: Nivel {activeLevel.levelNumber} — {activeLevel.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onStartLevel(currentLevelIndex)}
                className="btn-3d btn-3d-green w-full shrink-0 px-6 py-3.5 text-sm uppercase sm:w-auto"
              >
                <span>¡Jugar Nivel {activeLevel.levelNumber}!</span>
                <Rocket className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* COLUMNA LATERAL DERECHA: PISTAS, INSIGNIAS Y OPCIONES */}
        <aside className="flex flex-col gap-5 lg:col-span-5 xl:col-span-4">
          {/* Tarjeta 1: Pistas de Estudio (5/5 recargables) */}
          <div className="card-duo p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF9C3] text-amber-500 ring-2 ring-[#FDE68A]">
                  <Lightbulb className="h-6 w-6 fill-[#FFC800]" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800">Pistas de Estudio</h2>
                  <p className="text-xs font-extrabold text-[#46A302]">Recargadas al 100 %</p>
                </div>
              </div>
              <span className="rounded-full border-2 border-[#FDE68A] bg-[#FEFCE8] px-3 py-1 text-xs font-black text-amber-700">
                {currentHints} / 5
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
              Cada nivel nuevo recarga tus <span className="font-extrabold text-slate-700">5 pistas estratégicas</span>{' '}
              alineadas al Marco para la Buena Enseñanza y descarta un distractor.
            </p>
          </div>

          {/* Tarjeta 2: Mis Insignias Docentes */}
          <div className="card-duo p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF9C3] text-amber-600 ring-2 ring-[#FDE68A]">
                <Trophy className="h-6 w-6 fill-[#FFC800]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">Mis Insignias Docentes</h2>
                <p className="text-xs font-bold text-slate-400">
                  {earnedBadges.length} de {levels.length} obtenidas
                </p>
              </div>
            </div>

            <div className="flex max-h-[380px] flex-col gap-2.5 overflow-y-auto pr-1">
              {levels.map((lvl) => {
                const badge = lvl.badge;
                const isEarned = earnedBadges.includes(badge.id);
                return (
                  <div
                    key={`${lvl.id}-${badge.id}`}
                    className={`flex items-center gap-3 rounded-2xl border p-2.5 transition ${
                      isEarned
                        ? 'border-[#FDE047] bg-[#FEFCE8]'
                        : 'border-slate-100 bg-slate-50/70'
                    }`}
                  >
                    <BadgeIconSvg icon={badge.icon} unlocked={isEarned} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-xs font-black ${isEarned ? 'text-slate-800' : 'text-slate-500'}`}>
                          {badge.name}
                        </p>
                        <span className="shrink-0 text-[10px] font-extrabold text-slate-400">
                          Nivel {lvl.levelNumber}
                        </span>
                      </div>
                      <p className="truncate text-[11px] font-semibold text-slate-400">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarjeta 3: Documentos activos y Opciones de Juego */}
          <div className="card-duo p-5">
            <h2 className="text-sm font-black text-slate-800">Opciones de Juego</h2>

            {campaign?.summary?.filesUsed && (
              <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200/70">
                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Base documental activa (3 PDFs):
                </p>
                <p className="truncate">📋 {campaign.summary.filesUsed.prueba}</p>
                <p className="truncate">📘 {campaign.summary.filesUsed.temario}</p>
                <p className="truncate">🏅 {campaign.summary.filesUsed.mbe}</p>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onOpenAvatarModal}
                className="btn-3d btn-3d-white w-full py-3 text-xs uppercase"
              >
                <RefreshCw className="h-4 w-4 text-[#1CB0F6]" />
                Cambiar Avatar Docente
              </button>

              <button
                type="button"
                onClick={onOpenResetModal}
                className="btn-3d btn-3d-outline-red w-full py-3 text-xs uppercase"
              >
                <AlertTriangle className="h-4 w-4" />
                Reiniciar Juego / Aventura
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
