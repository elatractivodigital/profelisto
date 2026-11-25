import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { TEACHER_AVATARS, TeacherAvatarSvg } from './TeacherIllustrations';

export default function AvatarModal({
  selectedAvatarId = 'mateo',
  campaignSummary = null,
  isModal = false,
  onConfirmAvatar,
  onCancel,
}) {
  const [draftId, setDraftId] = useState(selectedAvatarId);

  const containerClasses = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm overflow-y-auto'
    : 'mx-auto flex max-w-4xl flex-col items-center px-4 py-8 sm:px-6 sm:py-10';

  return (
    <div className={containerClasses}>
      <div className="card-duo animate-pop-in w-full max-w-3xl p-6 sm:p-9">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF4FF] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#1899D6]">
            <Sparkles className="h-3.5 w-3.5" />
            Configuración de Personaje Docente
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            ¡Elige a tu Profe para el Camino!
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Selecciona uno de los 4 avatares docentes con delantal que te acompañará en cada nivel y punto de control.
          </p>
        </div>

        {/* Resumen del análisis de los 3 PDFs si ya se generó campaña */}
        {campaignSummary && !isModal && (
          <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-2xl border-2 border-[#BBF7D0] bg-[#F0FDF4] p-3 text-center sm:grid-cols-4">
            <div className="rounded-xl bg-white px-2 py-2.5">
              <p className="text-[10px] font-black uppercase text-slate-400">Niveles Creados</p>
              <p className="mt-0.5 text-sm font-black text-[#46A302] sm:text-base">
                {campaignSummary.levelCount} Niveles
              </p>
            </div>
            <div className="rounded-xl bg-white px-2 py-2.5">
              <p className="text-[10px] font-black uppercase text-slate-400">Puntos Control</p>
              <p className="mt-0.5 text-sm font-black text-amber-600 sm:text-base">
                {campaignSummary.checkpointsCount} Intercalados
              </p>
            </div>
            <div className="rounded-xl bg-white px-2 py-2.5">
              <p className="text-[10px] font-black uppercase text-slate-400">Desafíos Totales</p>
              <p className="mt-0.5 text-sm font-black text-[#1CB0F6] sm:text-base">
                {campaignSummary.totalQuestions} Casos
              </p>
            </div>
            <div className="rounded-xl bg-white px-2 py-2.5">
              <p className="text-[10px] font-black uppercase text-slate-400">Pistas / Nivel</p>
              <p className="mt-0.5 text-sm font-black text-purple-600 sm:text-base">
                5 Recargables
              </p>
            </div>
          </div>
        )}

        {/* Cuadrícula de 4 Avatares (2 masculinos y 2 femeninos) */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TEACHER_AVATARS.map((av) => {
            const isSelected = draftId === av.id;
            return (
              <button
                key={av.id}
                type="button"
                onClick={() => setDraftId(av.id)}
                className={`relative flex items-center gap-4 rounded-3xl border-2 border-b-4 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#58CC02] border-b-[#46A302] bg-[#F4FFE9] scale-[1.01]'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:border-[#7DD3FC] hover:bg-sky-50/40'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#58CC02] text-white shadow-xs">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </span>
                )}

                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: av.bgColor }}
                >
                  <TeacherAvatarSvg avatarId={av.id} mode="full" size={88} />
                </div>

                <div className="min-w-0 flex-1 pr-6">
                  <h3 className="text-lg font-black text-slate-800">{av.name}</h3>
                  <p className="text-xs font-extrabold text-[#1899D6]">{av.specialty}</p>
                  <p className="mt-1 text-xs font-semibold leading-snug text-slate-500">«{av.quote}»</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Botones de acción */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isModal && onCancel && (
            <button type="button" onClick={onCancel} className="btn-3d btn-3d-white px-6 py-3.5 text-sm uppercase">
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={() => onConfirmAvatar(draftId)}
            className="btn-3d btn-3d-green w-full py-3.5 text-base uppercase sm:w-auto sm:px-10"
          >
            {isModal ? 'Guardar Avatar Docente' : '¡Comenzar Aventura! 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}
