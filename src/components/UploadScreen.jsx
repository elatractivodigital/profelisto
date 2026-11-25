import React, { useRef, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  UploadCloud,
  Sparkles,
  Lock,
  Loader2,
  BookOpen,
  ClipboardCheck,
  Award,
  RefreshCw,
} from 'lucide-react';
import { extractPdfContent } from '../services/pdfReader';

const REQUIRED_SLOTS = [
  {
    key: 'pruebaEjemplo',
    stepNumber: 1,
    title: 'Prueba de Ejemplo (.pdf)',
    subtitle: 'Calibra el estilo de preguntas, distractores y dificultad',
    badgeColor: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
    icon: ClipboardCheck,
  },
  {
    key: 'temario',
    stepNumber: 2,
    title: 'Temario Oficial (.pdf)',
    subtitle: 'Define los ejes temáticos y la cantidad de niveles (6 a 10)',
    badgeColor: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    icon: BookOpen,
  },
  {
    key: 'marcoBuenaEnsenanza',
    stepNumber: 3,
    title: 'Marco para la Buena Enseñanza (.pdf)',
    subtitle: 'Alimenta los dominios docentes y las 5 pistas pedagógicas',
    badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    icon: Award,
  },
];

export default function UploadScreen({ docs, onUpdateDoc, onGenerateAdventure, isGenerating }) {
  const [loadingSlot, setLoadingSlot] = useState(null);
  const [dragSlot, setDragSlot] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = {
    pruebaEjemplo: useRef(null),
    temario: useRef(null),
    marcoBuenaEnsenanza: useRef(null),
  };

  const readyCount = REQUIRED_SLOTS.filter((s) => Boolean(docs?.[s.key])).length;
  const allThreeReady = readyCount === 3;

  async function handleFileForSlot(slotKey, file) {
    if (!file) return;
    setErrorMessage('');

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMessage(`El archivo "${file.name}" no es un PDF. Por favor adjunta documentos en formato .pdf.`);
      return;
    }

    setLoadingSlot(slotKey);
    try {
      const parsed = await extractPdfContent(file);
      onUpdateDoc(slotKey, parsed);
    } catch (err) {
      console.error('Error al leer el PDF:', err);
      setErrorMessage(`No se pudo procesar "${file.name}". Comprueba que sea un PDF válido e inténtalo de nuevo.`);
    } finally {
      setLoadingSlot(null);
    }
  }

  function handleDrop(e, slotKey) {
    e.preventDefault();
    setDragSlot(null);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileForSlot(slotKey, file);
    }
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="card-duo w-full p-6 sm:p-10">
        {/* Icono central superior estilo Duolingo */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-[#BBF7D0] border-b-4 border-b-[#86EFAC] bg-[#E8FDEB]">
          <div className="relative flex flex-col items-center">
            <span className="text-4xl leading-none" role="img" aria-label="Libros">
              📚
            </span>
            <Sparkles className="mt-0.5 h-5 w-5 text-[#FFC800] fill-[#FFC800]" />
          </div>
        </div>

        {/* Título y descripción */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-2xl font-bold text-slate-800 sm:text-4xl">
            ¡Aprende Jugando, Profe!
          </h1>
          <p className="mt-2.5 text-sm font-semibold leading-relaxed text-slate-500 sm:text-base">
            Adjunta los <span className="font-extrabold text-slate-700">3 documentos obligatorios en PDF</span> para que
            nuestro motor analice el estilo de evaluación, estructure entre <span className="font-extrabold text-[#46A302]">6 y 10 niveles</span>{' '}
            por dominio y genere desafíos inéditos con pistas estratégicas.
          </p>
        </div>

        {/* Contador de progreso 3 archivos obligatorios */}
        <div className="mt-5 flex items-center justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1 text-xs font-black uppercase tracking-wider transition-colors ${
              allThreeReady
                ? 'border-[#86EFAC] bg-[#DCFCE7] text-[#15803D]'
                : 'border-sky-200 bg-sky-50 text-sky-700'
            }`}
          >
            {allThreeReady ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#58CC02]" />
                ¡3 de 3 documentos obligatorios listos!
              </>
            ) : (
              <>Documentos obligatorios cargados: {readyCount} de 3</>
            )}
          </span>
        </div>

        {/* Mensaje de error si sube formato distinto a PDF */}
        {errorMessage && (
          <div className="mt-4 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-center text-xs font-extrabold text-red-600">
            {errorMessage}
          </div>
        )}

        {/* Las 3 tarjetas obligatorias de subida de PDF */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {REQUIRED_SLOTS.map((slot) => {
            const uploaded = docs?.[slot.key];
            const isSlotLoading = loadingSlot === slot.key;
            const isDragging = dragSlot === slot.key;
            const SlotIcon = slot.icon;

            return (
              <div
                key={slot.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragSlot(slot.key);
                }}
                onDragLeave={() => setDragSlot(null)}
                onDrop={(e) => handleDrop(e, slot.key)}
                onClick={() => inputRefs[slot.key].current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRefs[slot.key].current?.click();
                  }
                }}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 border-b-4 p-4 text-center transition-all ${
                  uploaded
                    ? 'border-[#86EFAC] border-b-[#4ADE80] bg-[#F0FDF4]'
                    : isDragging
                    ? 'border-[#1CB0F6] border-b-[#1899D6] bg-[#E0F2FE] scale-[1.01]'
                    : 'border-[#DCE8F5] border-b-[#C3D8EE] bg-[#F2F8FF] hover:border-[#7DD3FC] hover:bg-[#EBF5FF]'
                }`}
              >
                <input
                  ref={inputRefs[slot.key]}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileForSlot(slot.key, file);
                    e.target.value = '';
                  }}
                />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${slot.badgeColor}`}>
                      Obligatorio {slot.stepNumber}/3
                    </span>
                    {uploaded && <CheckCircle2 className="h-5 w-5 text-[#58CC02]" />}
                  </div>

                  {/* Icono 3D documento */}
                  <div
                    className={`mx-auto my-2 flex h-12 w-12 items-center justify-center rounded-2xl border-b-4 bg-white shadow-2xs ${
                      uploaded ? 'border-[#58CC02] text-[#46A302]' : 'border-[#1CB0F6] text-[#1CB0F6]'
                    }`}
                  >
                    {isSlotLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-[#1CB0F6]" />
                    ) : uploaded ? (
                      <FileText className="h-6 w-6" />
                    ) : (
                      <SlotIcon className="h-6 w-6" />
                    )}
                  </div>

                  <h2 className="text-sm font-black text-slate-800">{slot.title}</h2>
                  <p className="mt-1 text-xs font-semibold leading-snug text-slate-500">{slot.subtitle}</p>
                </div>

                {/* Pie de la tarjeta */}
                <div className="mt-4">
                  {isSlotLoading ? (
                    <span className="inline-block rounded-xl bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#1CB0F6]">
                      Leyendo páginas del PDF...
                    </span>
                  ) : uploaded ? (
                    <div className="rounded-xl bg-white/90 px-3 py-2 text-left ring-1 ring-[#BBF7D0]">
                      <p className="truncate text-xs font-black text-slate-800" title={uploaded.fileName}>
                        📄 {uploaded.fileName}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>
                          {uploaded.pageCount} págs • {uploaded.wordCount} palabras
                        </span>
                        <span className="inline-flex items-center gap-0.5 font-extrabold text-[#1CB0F6] group-hover:underline">
                          <RefreshCw className="h-2.5 w-2.5" /> Cambiar
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-[#1CB0F6] shadow-2xs group-hover:bg-[#1CB0F6] group-hover:text-white">
                      <UploadCloud className="h-3.5 w-3.5" />
                      Subir o arrastrar PDF
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Principal Generar Aventura */}
        <div className="mt-7">
          <button
            type="button"
            disabled={!allThreeReady || isGenerating}
            onClick={onGenerateAdventure}
            className={`btn-3d w-full py-4 text-sm uppercase sm:text-base ${
              allThreeReady && !isGenerating ? 'btn-3d-green' : 'btn-3d-disabled'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analizando tus 3 documentos y creando niveles...
              </>
            ) : (
              <>
                <span role="img" aria-label="Cohete">
                  🚀
                </span>
                Generar mi Aventura de Estudio
              </>
            )}
          </button>
        </div>

        {/* Nota de almacenamiento local sin costo */}
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-bold text-slate-400">
          <Lock className="h-3.5 w-3.5 text-amber-500" />
          Todo tu progreso y contenido se guarda 100 % en tu navegador (sin costos ni servidores externos).
        </p>
      </div>
    </main>
  );
}
