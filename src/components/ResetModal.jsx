import React from 'react';
import { AlertTriangle, Trash2, RefreshCw, X } from 'lucide-react';

export default function ResetModal({ isOpen, isRegenerating, onConfirmReset, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="card-duo animate-pop-in relative w-full max-w-md p-6 text-center sm:p-7">
        <button
          type="button"
          onClick={onClose}
          disabled={isRegenerating}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Cerrar ventana"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-b-4 border-amber-300 bg-amber-100 text-amber-600">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <p className="text-xs font-black uppercase tracking-wider text-amber-600">Reiniciar Partida</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-slate-800">
          ¿Quieres quitar los archivos adjuntos?
        </h2>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
          Al reiniciar tu aventura, todas las preguntas de los eventos y las pistas pedagógicas se generarán de forma{' '}
          <span className="font-extrabold text-slate-700">completamente nueva y diferente</span> a la partida anterior.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {/* Opción NO: conserva los 3 PDFs y regenera preguntas inéditas */}
          <button
            type="button"
            disabled={isRegenerating}
            onClick={() => onConfirmReset(false)}
            className="btn-3d btn-3d-blue w-full py-3.5 text-xs uppercase sm:text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            No (Conservar PDFs y crear preguntas nuevas)
          </button>

          {/* Opción SÍ: borra archivos adjuntos y vuelve a la pantalla de subida */}
          <button
            type="button"
            disabled={isRegenerating}
            onClick={() => onConfirmReset(true)}
            className="btn-3d btn-3d-red w-full py-3.5 text-xs uppercase sm:text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Sí (Quitar los 3 archivos adjuntos)
          </button>

          <button
            type="button"
            disabled={isRegenerating}
            onClick={onClose}
            className="btn-3d btn-3d-white w-full py-2.5 text-xs uppercase"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
