import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import UploadScreen from './components/UploadScreen';
import AvatarModal from './components/AvatarModal';
import LearningPath from './components/LearningPath';
import QuizEvent from './components/QuizEvent';
import ResetModal from './components/ResetModal';
import {
  clearCampaignData,
  clearUploadedDocs,
  DEFAULT_PROGRESS,
  loadCampaignData,
  loadProgressSync,
  loadUploadedDocs,
  saveCampaignData,
  saveProgressSync,
  saveUploadedDocs,
} from './services/storage';
import { generateStudyCampaign, normalizeCampaignToMedia } from './services/questionEngine';

export default function App() {
  const [progress, setProgress] = useState(() => loadProgressSync());
  const [docs, setDocs] = useState({
    pruebaEjemplo: null,
    temario: null,
    marcoBuenaEnsenanza: null,
  });
  const [campaign, setCampaign] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modales auxiliares
  const [showAvatarOverlay, setShowAvatarOverlay] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Hidratar documentos PDF y campaña guardados en IndexedDB al abrir la app
  useEffect(() => {
    let active = true;
    async function hydrate() {
      const [savedDocs, savedCampaign] = await Promise.all([
        loadUploadedDocs(),
        loadCampaignData(),
      ]);
      if (!active) return;

      if (savedDocs) {
        setDocs(savedDocs);
      }
      if (savedCampaign) {
        const cleanedCampaign = normalizeCampaignToMedia(savedCampaign);
        setCampaign(cleanedCampaign);
        await saveCampaignData(cleanedCampaign);
      } else {
        // Si no hay campaña guardada, asegurar que empiece en la pantalla de subida
        setProgress((prev) => ({ ...prev, screen: 'upload' }));
      }
      setIsHydrating(false);
    }
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  // Guardar progreso automáticamente en localStorage ante cualquier cambio
  useEffect(() => {
    saveProgressSync(progress);
  }, [progress]);

  async function handleUpdateDoc(slotKey, parsedPdf) {
    const updated = { ...docs, [slotKey]: parsedPdf };
    setDocs(updated);
    await saveUploadedDocs(updated);
  }

  async function handleGenerateAdventure() {
    if (!docs.pruebaEjemplo || !docs.temario || !docs.marcoBuenaEnsenanza) return;
    setIsGenerating(true);
    try {
      const nextGenCount = (progress.generationCount || 1) + 1;
      const newCampaign = await generateStudyCampaign({
        pruebaDoc: docs.pruebaEjemplo,
        temarioDoc: docs.temario,
        mbeDoc: docs.marcoBuenaEnsenanza,
        generationCount: nextGenCount,
        previousFingerprints: progress.usedFingerprints || [],
      });

      await saveCampaignData(newCampaign);
      setCampaign(newCampaign);

      const mergedFingerprints = [
        ...(progress.usedFingerprints || []),
        ...(newCampaign.newFingerprints || []),
      ].slice(-120);

      setProgress((prev) => ({
        ...prev,
        screen: 'avatar',
        currentLevelIndex: 0,
        unlockedLevelIndex: 0,
        lastCheckpointIndex: 0,
        completedLevels: [],
        earnedBadges: [],
        currentHints: 5,
        generationCount: nextGenCount,
        usedFingerprints: mergedFingerprints,
      }));
    } finally {
      setIsGenerating(false);
    }
  }

  function handleConfirmAvatarSetup(chosenAvatarId) {
    setProgress((prev) => ({
      ...prev,
      avatarId: chosenAvatarId,
      screen: 'map',
      currentHints: 5,
    }));
  }

  function handleStartLevel(levelIdx) {
    // Recargar pistas al 100 % (5/5) cada vez que se inicia un nivel
    setProgress((prev) => ({
      ...prev,
      currentLevelIndex: levelIdx,
      currentHints: 5,
      screen: 'quiz',
    }));
  }

  function handleLevelVictory({ earnedXp = 0 }) {
    if (!campaign) return;
    const levels = campaign.levels;
    const clearedIdx = progress.currentLevelIndex;
    const clearedLevel = levels[clearedIdx];
    const nextIdx = Math.min(levels.length - 1, clearedIdx + 1);
    const nextUnlocked = Math.max(progress.unlockedLevelIndex, nextIdx);

    // Calcular nuevo Punto de Control guardado (intercalados: 1 sí, 2 no, 3 sí, 4 no...)
    let updatedCheckpoint = progress.lastCheckpointIndex;
    if (clearedLevel?.isCheckpoint && clearedIdx > updatedCheckpoint) {
      updatedCheckpoint = clearedIdx;
    }
    if (levels[nextUnlocked]?.isCheckpoint && nextUnlocked > updatedCheckpoint) {
      updatedCheckpoint = nextUnlocked;
    }

    const newCompleted = progress.completedLevels.includes(clearedLevel.levelNumber)
      ? progress.completedLevels
      : [...progress.completedLevels, clearedLevel.levelNumber];

    const badgeId = clearedLevel?.badge?.id;
    const newBadges =
      badgeId && !progress.earnedBadges.includes(badgeId)
        ? [...progress.earnedBadges, badgeId]
        : progress.earnedBadges;

    setProgress((prev) => ({
      ...prev,
      screen: 'map',
      streak: prev.streak + 1,
      xp: (prev.xp || 0) + earnedXp,
      currentLevelIndex: nextIdx,
      unlockedLevelIndex: nextUnlocked,
      lastCheckpointIndex: updatedCheckpoint,
      completedLevels: newCompleted,
      earnedBadges: newBadges,
      currentHints: 5, // Recargadas al 100 % para el siguiente nodo
    }));
  }

  function handleLevelDefeatToCheckpoint() {
    // Penalización por errores: regresa al último Punto de Control guardado con 5 pistas recargadas
    setProgress((prev) => {
      const checkpointIdx = prev.lastCheckpointIndex || 0;
      const checkpointLevelNum = checkpointIdx + 1;
      return {
        ...prev,
        screen: 'map',
        currentLevelIndex: checkpointIdx,
        unlockedLevelIndex: checkpointIdx,
        completedLevels: prev.completedLevels.filter((num) => num < checkpointLevelNum),
        currentHints: 5,
      };
    });
  }

  async function handleConfirmReset(removeAttachments) {
    setIsGenerating(true);
    try {
      const nextGenCount = (progress.generationCount || 1) + 1;

      if (removeAttachments) {
        await Promise.all([clearUploadedDocs(), clearCampaignData()]);
        setDocs({
          pruebaEjemplo: null,
          temario: null,
          marcoBuenaEnsenanza: null,
        });
        setCampaign(null);
        setShowResetModal(false);
        setProgress((prev) => ({
          ...DEFAULT_PROGRESS,
          avatarId: prev.avatarId,
          soundEnabled: prev.soundEnabled,
          generationCount: nextGenCount,
          usedFingerprints: prev.usedFingerprints || [],
          screen: 'upload',
        }));
        return;
      }

      // Opción "No": conservar los 3 PDFs adjuntos y regenerar preguntas y pistas 100 % nuevas
      const regeneratedCampaign = await generateStudyCampaign({
        pruebaDoc: docs.pruebaEjemplo,
        temarioDoc: docs.temario,
        mbeDoc: docs.marcoBuenaEnsenanza,
        generationCount: nextGenCount,
        previousFingerprints: progress.usedFingerprints || [],
      });

      await saveCampaignData(regeneratedCampaign);
      setCampaign(regeneratedCampaign);

      const mergedFingerprints = [
        ...(progress.usedFingerprints || []),
        ...(regeneratedCampaign.newFingerprints || []),
      ].slice(-120);

      setShowResetModal(false);
      setProgress((prev) => ({
        ...prev,
        screen: 'map',
        currentLevelIndex: 0,
        unlockedLevelIndex: 0,
        lastCheckpointIndex: 0,
        completedLevels: [],
        earnedBadges: [],
        currentHints: 5,
        generationCount: nextGenCount,
        usedFingerprints: mergedFingerprints,
      }));
    } finally {
      setIsGenerating(false);
    }
  }

  if (isHydrating) {
    return (
      <div className="bg-duo-dots flex min-h-screen items-center justify-center">
        <div className="card-duo px-8 py-6 text-center">
          <p className="font-display text-xl font-bold text-[#58CC02]">Cargando ProfeListo...</p>
        </div>
      </div>
    );
  }

  const activeLevel = campaign?.levels?.[progress.currentLevelIndex] || campaign?.levels?.[0];
  const checkpointLevelNumber =
    campaign?.levels?.[progress.lastCheckpointIndex]?.levelNumber || 1;
  const totalBadgesCount = campaign?.levels?.length || 8;

  // Vista inmersiva de Evento / Preguntas
  if (progress.screen === 'quiz' && campaign && activeLevel) {
    return (
      <QuizEvent
        key={`${campaign.seed}-L${activeLevel.levelNumber}`}
        level={activeLevel}
        isLastLevel={progress.currentLevelIndex === campaign.levels.length - 1}
        avatarId={progress.avatarId}
        streak={progress.streak}
        checkpointLevelNumber={checkpointLevelNumber}
        soundEnabled={progress.soundEnabled}
        onToggleSound={() =>
          setProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onHintsChange={(h) => setProgress((prev) => ({ ...prev, currentHints: h }))}
        onExitToMap={() => setProgress((prev) => ({ ...prev, screen: 'map', currentHints: 5 }))}
        onLevelVictory={handleLevelVictory}
        onLevelDefeatToCheckpoint={handleLevelDefeatToCheckpoint}
      />
    );
  }

  return (
    <div className="bg-duo-dots flex min-h-screen flex-col">
      <Header
        screen={progress.screen}
        streak={progress.streak}
        earnedBadgesCount={progress.earnedBadges.length}
        totalBadgesCount={totalBadgesCount}
        soundEnabled={progress.soundEnabled}
        avatarId={progress.avatarId}
        hasSelectedAvatar={progress.screen !== 'upload'}
        onToggleSound={() =>
          setProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onOpenAvatarSelector={() => setShowAvatarOverlay(true)}
        onGoHome={() => {
          if (campaign && progress.screen !== 'upload') {
            setProgress((prev) => ({ ...prev, screen: 'map' }));
          }
        }}
      />

      <div className="flex-1">
        {progress.screen === 'upload' && (
          <UploadScreen
            docs={docs}
            onUpdateDoc={handleUpdateDoc}
            onGenerateAdventure={handleGenerateAdventure}
            isGenerating={isGenerating}
          />
        )}

        {progress.screen === 'avatar' && (
          <AvatarModal
            selectedAvatarId={progress.avatarId}
            campaignSummary={campaign?.summary}
            isModal={false}
            onConfirmAvatar={handleConfirmAvatarSetup}
          />
        )}

        {progress.screen === 'map' && campaign && (
          <LearningPath
            campaign={campaign}
            avatarId={progress.avatarId}
            currentLevelIndex={progress.currentLevelIndex}
            unlockedLevelIndex={progress.unlockedLevelIndex}
            lastCheckpointIndex={progress.lastCheckpointIndex}
            completedLevels={progress.completedLevels}
            earnedBadges={progress.earnedBadges}
            currentHints={progress.currentHints}
            onStartLevel={handleStartLevel}
            onOpenAvatarModal={() => setShowAvatarOverlay(true)}
            onOpenResetModal={() => setShowResetModal(true)}
          />
        )}
      </div>

      {/* Pie informativo */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-3.5 text-center text-[11px] font-bold text-slate-400">
        ProfeListo Gamification Engine • Guardado 100 % Local en Navegador (LocalStorage + IndexedDB)
      </footer>

      {/* Modal flotante para cambiar Avatar en cualquier momento */}
      {showAvatarOverlay && (
        <AvatarModal
          selectedAvatarId={progress.avatarId}
          isModal
          onConfirmAvatar={(chosenId) => {
            setProgress((prev) => ({ ...prev, avatarId: chosenId }));
            setShowAvatarOverlay(false);
          }}
          onCancel={() => setShowAvatarOverlay(false)}
        />
      )}

      {/* Modal de Reinicio con retención opcional de los 3 archivos adjuntos */}
      <ResetModal
        isOpen={showResetModal}
        isRegenerating={isGenerating}
        onConfirmReset={handleConfirmReset}
        onClose={() => setShowResetModal(false)}
      />
    </div>
  );
}
