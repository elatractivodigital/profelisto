import React, { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Heart,
  Lightbulb,
  Volume2,
  VolumeX,
  GraduationCap,
  Compass,
  CheckCircle2,
  XCircle,
  BookOpen,
  Star,
} from 'lucide-react';
import { getAvatarById, TeacherAvatarSvg } from './TeacherIllustrations';
import {
  BossScoldingModal,
  CelebratingTeachersBanner,
  LevelVictoryModal,
} from './FeedbackAnimations';
import {
  playBossPenaltySound,
  playCorrectSound,
  playHintSound,
  playVictorySound,
  playWrongSound,
  speakCaseText,
  stopSpeaking,
} from '../services/sound';

const PRAISE_MESSAGES = [
  '¡Decisión pedagógica impecable y centrada en el aprendizaje!',
  '¡Excelente lectura del aula según el Marco para la Buena Enseñanza!',
  '¡Gran criterio formativo e inclusivo, Profe!',
  '¡Mediación docente de altísimo nivel!',
];

function renderHighlightedStem(stem, highlightPhrase) {
  if (!highlightPhrase || !stem.toLowerCase().includes(highlightPhrase.toLowerCase())) {
    return stem;
  }
  const idx = stem.toLowerCase().indexOf(highlightPhrase.toLowerCase());
  const before = stem.slice(0, idx);
  const match = stem.slice(idx, idx + highlightPhrase.length);
  const after = stem.slice(idx + highlightPhrase.length);
  return (
    <>
      {before}
      <mark className="rounded-md bg-[#FFF3BF] px-1.5 py-0.5 font-black text-slate-900">
        {match}
      </mark>
      {after}
    </>
  );
}

export default function QuizEvent({
  level,
  isLastLevel = false,
  avatarId = 'mateo',
  streak = 1,
  checkpointLevelNumber = 1,
  soundEnabled = true,
  onToggleSound,
  onHintsChange,
  onExitToMap,
  onLevelVictory,
  onLevelDefeatToCheckpoint,
}) {
  const avatar = getAvatarById(avatarId);

  // Cola dinámica de preguntas (permite "Saltar" enviando el caso al final)
  const [queue, setQueue] = useState(() => level?.questions || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Vidas (3 a 5 según nivel) y 5 pistas recargadas al 100 % al iniciar nivel
  const [lives, setLives] = useState(level?.maxLives || 4);
  const [hints, setHints] = useState(level?.maxHints || 5);

  // Estado de la pregunta actual
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [status, setStatus] = useState('answering'); // 'answering' | 'correct' | 'wrong'
  const [usedHintText, setUsedHintText] = useState('');
  const [eliminatedOptionId, setEliminatedOptionId] = useState(null);
  const [earnedXp, setEarnedXp] = useState(0);

  // Modales de cierre del evento
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showBossModal, setShowBossModal] = useState(false);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const currentQuestion = queue[currentIdx];
  const totalQuestions = level?.questions?.length || 1;
  const progressPct = Math.min(100, Math.round((completedCount / totalQuestions) * 100));

  const praiseText = useMemo(
    () => PRAISE_MESSAGES[(currentIdx + completedCount) % PRAISE_MESSAGES.length],
    [currentIdx, completedCount]
  );

  if (!level || !currentQuestion) return null;

  function resetQuestionUiState() {
    stopSpeaking();
    setSelectedOptionId(null);
    setStatus('answering');
    setUsedHintText('');
    setEliminatedOptionId(null);
  }

  function handleUseHint() {
    if (status !== 'answering' || hints <= 0 || usedHintText) return;
    playHintSound(soundEnabled);

    const newHints = hints - 1;
    setHints(newHints);
    onHintsChange?.(newHints);
    setUsedHintText(currentQuestion.hint);

    // Además de mostrar la pista MBE, descarta estratégicamente una opción incorrecta
    const wrongCandidates = currentQuestion.options.filter(
      (opt) => !opt.isCorrect && opt.id !== selectedOptionId
    );
    const fallbackWrong = currentQuestion.options.filter((opt) => !opt.isCorrect);
    const toEliminate = (wrongCandidates[0] || fallbackWrong[0])?.id || null;
    setEliminatedOptionId(toEliminate);
    if (selectedOptionId && selectedOptionId === toEliminate) {
      setSelectedOptionId(null);
    }
  }

  function handleSkipQuestion() {
    if (status !== 'answering' || queue.length - currentIdx <= 1) return;
    const updated = [...queue];
    const [skipped] = updated.splice(currentIdx, 1);
    updated.push(skipped);
    setQueue(updated);
    resetQuestionUiState();
  }

  function handleCheckAnswer() {
    if (!selectedOptionId || status !== 'answering') return;
    const chosen = currentQuestion.options.find((o) => o.id === selectedOptionId);
    if (!chosen) return;

    if (chosen.isCorrect) {
      playCorrectSound(soundEnabled);
      setStatus('correct');
      setCompletedCount((c) => c + 1);
      setEarnedXp((xp) => xp + (currentQuestion.xpReward || 15));
    } else {
      playWrongSound(soundEnabled);
      const nextLives = lives - 1;
      setLives(nextLives);
      setStatus('wrong');
    }
  }

  function handleContinueAfterCheck() {
    // Si perdió su última vida, aparece el Jefe amonestando y envía a Punto de Control
    if (status === 'wrong' && lives <= 0) {
      playBossPenaltySound(soundEnabled);
      setShowBossModal(true);
      return;
    }

    // Si era la última pregunta de la cola
    if (currentIdx + 1 >= queue.length) {
      playVictorySound(soundEnabled);
      setShowVictoryModal(true);
      return;
    }

    // Si falló pero aún tiene vidas, reinsertar el caso al final para asegurar dominio real o avanzar
    if (status === 'wrong') {
      setQueue((prev) => [...prev, currentQuestion]);
    }

    setCurrentIdx((i) => i + 1);
    resetQuestionUiState();
  }

  const canSkip = status === 'answering' && queue.length - currentIdx > 1;

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FB]">
      {/* BARRA SUPERIOR DE EVENTO */}
      <header className="sticky top-0 z-20 border-b-2 border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onExitToMap();
            }}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white transition hover:border-[#1CB0F6] hover:border-b-[#1899D6] hover:bg-[#F0F9FF] active:translate-y-0.5"
            title="Volver a la sección de niveles"
            aria-label="Volver a la sección de niveles"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform group-hover:scale-105"
            >
              {/* Bandera superior de la escuela */}
              <line x1="14" y1="2.5" x2="14" y2="7.5" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 2.8L19.5 4.4L14 6V2.8Z" fill="#FF4B4B" />
              {/* Techo triangular */}
              <polygon points="3,13 14,6.2 25,13" fill="#FF9600" stroke="#E07B00" strokeWidth="1.6" strokeLinejoin="round" />
              {/* Fachada principal */}
              <rect x="5.5" y="12.5" width="17" height="12" rx="2" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.6" />
              {/* Reloj central */}
              <circle cx="14" cy="15.2" r="2" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.3" />
              {/* Ventanas laterales */}
              <rect x="7.6" y="15.5" width="3" height="3.2" rx="0.8" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.2" />
              <rect x="17.4" y="15.5" width="3" height="3.2" rx="0.8" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.2" />
              {/* Puerta de la escuela */}
              <path d="M12 24.5V19.8C12 18.8 12.8 18 14 18C15.2 18 16 18.8 16 19.8V24.5H12Z" fill="#1CB0F6" />
            </svg>
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#58CC02] text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-800">ProfeListo</span>
          </div>

          {/* Barra de progreso animada */}
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#58CC02] transition-all duration-300"
              style={{ width: `${ Math.max(8, progressPct) }%` }}
            >
              <div className="mx-2 mt-1 h-1 rounded-full bg-white/35" />
            </div>
          </div>

          {/* Indicadores: Racha, Vidas (errores restantes) y Pistas */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <span className="hidden items-center gap-1 rounded-full bg-[#FFF8EC] px-2.5 py-1 text-xs font-black text-[#FF9600] md:inline-flex">
              <Flame className="h-3.5 w-3.5 fill-[#FF9600]" />
              {streak}
            </span>

            <span
              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-[#FF4B4B]"
              title="Margen de errores antes de amonestación del Director"
            >
              <Heart className="h-3.5 w-3.5 fill-[#FF4B4B]" />
              {lives}/{level.maxLives}
            </span>

            <span
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700"
              title="Pistas pedagógicas disponibles en este nivel"
            >
              <Lightbulb className="h-3.5 w-3.5 fill-[#FFC800] text-amber-500" />
              {hints}/{level.maxHints}
            </span>

            <button
              type="button"
              onClick={onToggleSound}
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Alternar sonido"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-[#1CB0F6]" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* CUERPO CENTRAL DEL DESAFÍO */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-10 pt-5 sm:px-6 sm:pt-7">
        {/* Subcabecera con Nivel, Caso y Botón de Pista Pedagógica */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8FDEB] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#2B8A00]">
              🎓 Nivel {level.levelNumber} • {level.title}
            </span>
            <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-black uppercase text-slate-600">
              Dominio superado {completedCount} de {totalQuestions}
            </span>
          </div>

          <button
            type="button"
            disabled={hints <= 0 || Boolean(usedHintText) || status !== 'answering'}
            onClick={handleUseHint}
            className={`btn-3d rounded-full px-4 py-1.5 text-xs ${
              hints > 0 && !usedHintText && status === 'answering'
                ? 'btn-3d-white border-amber-300 border-b-amber-400 text-slate-800 hover:bg-amber-50'
                : 'btn-3d-disabled'
            }`}
          >
            <Lightbulb className="h-4 w-4 fill-[#FFC800] text-amber-500" />
            <span>Pista Pedagógica</span>
            <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-black text-amber-800">
              {hints}
            </span>
          </button>
        </div>

        {/* Alerta estratégica si le queda 1 sola vida y aún tiene pistas */}
        {lives === 1 && hints > 0 && !usedHintText && status === 'answering' && (
          <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-extrabold text-amber-900">
            ⚠️ ¡Atención, Profe! Estás a un fallo de que salga el Director amonestando. ¡Aún tienes{' '}
            <span className="underline">{hints} pistas disponibles</span> para asegurar tu respuesta!
          </div>
        )}

        {/* Personaje Docente + Bocadillo de Dilema en el Aula */}
        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Tarjeta del Profe con botón Escuchar caso */}
          <div className="flex shrink-0 flex-col items-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-slate-200 border-b-4 bg-white p-2 shadow-sm sm:h-36 sm:w-36">
              <TeacherAvatarSvg
                avatarId={avatar.id}
                mode="full"
                size={112}
                celebrating={status === 'correct'}
              />
              <span className="absolute -bottom-2.5 right-2 rounded-full bg-[#58CC02] px-2.5 py-0.5 text-[11px] font-black text-white shadow-2xs">
                👩‍🏫 {avatar.shortName}
              </span>
            </div>

            <button
              type="button"
              onClick={() => speakCaseText(`${currentQuestion.stem} ${currentQuestion.question}`)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-600 shadow-2xs transition hover:border-[#1CB0F6] hover:text-[#1CB0F6]"
            >
              <Volume2 className="h-3.5 w-3.5 text-[#1CB0F6]" />
              Escuchar caso
            </button>
          </div>

          {/* Bocadillo del caso */}
          <div className="card-duo relative flex-1 p-5 sm:p-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0284C7]">
                <BookOpen className="h-3.5 w-3.5" />
                {currentQuestion.caseLabel} • {level.domainCode}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-amber-500">
                <Star className="h-3.5 w-3.5 fill-[#FFC800]" />+{currentQuestion.xpReward} XP
              </span>
            </div>

            <p className="text-base font-extrabold leading-relaxed text-slate-800 sm:text-lg">
              {renderHighlightedStem(currentQuestion.stem, currentQuestion.highlightPhrase)}
            </p>

            <p className="mt-3 text-sm font-bold text-slate-600 sm:text-base">
              {currentQuestion.question}
            </p>
          </div>
        </div>

        {/* Pista Pedagógica activada visible de inmediato sobre las opciones */}
        {usedHintText && (
          <div className="animate-pop-in mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-[#86EFAC] bg-[#F0FDF4] px-4 py-3 text-center text-xs font-extrabold text-[#166534] sm:text-sm">
            <Compass className="h-4 w-4 shrink-0 text-[#58CC02]" />
            <span>
              {usedHintText}{' '}
              {eliminatedOptionId && (
                <span className="font-black text-[#15803D]">
                  (Opción {eliminatedOptionId} descartada)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Las 4 Opciones de Respuesta estilo Duolingo */}
        <div className="mt-5 flex flex-col gap-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isEliminated = eliminatedOptionId === opt.id;

            let optionClasses =
              'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 text-slate-700';

            if (isEliminated) {
              optionClasses =
                'border-slate-200 bg-slate-100/70 text-slate-400 line-through opacity-55 cursor-not-allowed';
            } else if (status === 'answering' && isSelected) {
              optionClasses =
                'border-[#1CB0F6] border-b-[#1899D6] bg-[#E8F7FF] text-[#0B5E8A]';
            } else if (status !== 'answering' && opt.isCorrect) {
              optionClasses =
                'border-[#58CC02] border-b-[#46A302] bg-[#ECFFD9] text-[#2B6E00]';
            } else if (status === 'wrong' && isSelected && !opt.isCorrect) {
              optionClasses =
                'border-[#FF4B4B] border-b-[#EA2B2B] bg-[#FFECEC] text-[#A61B1B]';
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={status !== 'answering' || isEliminated}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`flex w-full items-center gap-3.5 rounded-2xl border-2 border-b-4 px-4 py-3.5 text-left transition-all sm:px-5 sm:py-4 ${optionClasses}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                    isSelected && status === 'answering'
                      ? 'bg-[#1CB0F6] text-white'
                      : status !== 'answering' && opt.isCorrect
                      ? 'bg-[#58CC02] text-white'
                      : status === 'wrong' && isSelected
                      ? 'bg-[#FF4B4B] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.id}
                </span>

                <span className="flex-1 text-sm font-bold leading-snug sm:text-[15px]">
                  {opt.text}
                </span>

                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    isSelected
                      ? 'border-[#1CB0F6] bg-[#1CB0F6]'
                      : 'border-slate-300 bg-white'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </main>

      {/* BARRA INFERIOR FIJA ESTILO DUOLINGO (COMPROBAR / FEEDBACK ANIMADO) */}
      <footer
        className={`sticky bottom-0 z-20 border-t-2 px-4 py-4 transition-colors ${
          status === 'correct'
            ? 'border-[#86EFAC] bg-[#D7FFB8]'
            : status === 'wrong'
            ? 'border-[#FCA5A5] bg-[#FFDFE0]'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          {status === 'answering' && (
            <>
              <button
                type="button"
                disabled={!canSkip}
                onClick={handleSkipQuestion}
                className={`btn-3d w-full px-6 py-3 text-xs uppercase sm:w-auto ${
                  canSkip ? 'btn-3d-white' : 'btn-3d-disabled'
                }`}
              >
                Saltar
              </button>

              <button
                type="button"
                disabled={!selectedOptionId}
                onClick={handleCheckAnswer}
                className={`btn-3d w-full px-10 py-3.5 text-sm uppercase sm:w-auto ${
                  selectedOptionId ? 'btn-3d-green' : 'btn-3d-disabled'
                }`}
              >
                Comprobar
              </button>
            </>
          )}

          {status === 'correct' && (
            <>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <CelebratingTeachersBanner praiseText={praiseText} />
                <p className="text-xs font-extrabold text-[#2B6E00]">{currentQuestion.explanation}</p>
              </div>
              <button
                type="button"
                onClick={handleContinueAfterCheck}
                className="btn-3d btn-3d-green w-full shrink-0 px-8 py-3.5 text-sm uppercase sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4" />
                Continuar
              </button>
            </>
          )}

          {status === 'wrong' && (
            <>
              <div className="flex flex-1 items-start gap-3 text-left">
                <XCircle className="mt-0.5 h-7 w-7 shrink-0 text-[#EA2B2B]" />
                <div>
                  <p className="text-sm font-black text-[#A61B1B]">
                    {lives <= 0
                      ? '¡Has alcanzado el límite de errores de este nivel!'
                      : `Respuesta incorrecta • Te quedan ${lives} oportunidades`}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-[#7F1D1D]">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinueAfterCheck}
                className="btn-3d btn-3d-red w-full shrink-0 px-8 py-3.5 text-sm uppercase sm:w-auto"
              >
                {lives <= 0 ? 'Ir a Dirección' : 'Entendido'}
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Modal de Victoria del Nivel + Entrega de Insignia */}
      {showVictoryModal && (
        <LevelVictoryModal
          level={level}
          avatarId={avatarId}
          isLastLevel={isLastLevel}
          onContinue={() => {
            setShowVictoryModal(false);
            onLevelVictory({ earnedXp });
          }}
        />
      )}

      {/* Modal del Jefe Amonestando -> Regreso al último Punto de Control */}
      {showBossModal && (
        <BossScoldingModal
          checkpointLevelNumber={checkpointLevelNumber}
          hintsLeftWhenFailed={hints}
          onReturnToCheckpoint={() => {
            setShowBossModal(false);
            onLevelDefeatToCheckpoint();
          }}
        />
      )}
    </div>
  );
}
