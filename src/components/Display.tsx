import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Cpu } from 'lucide-react';

interface DisplayProps {
  expression: string;
  currentInput: string;
  isResult: boolean;
  errorMessage: string | null;
  pythonStatus: 'connected' | 'offline' | 'checking';
  onClearError: () => void;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  currentInput,
  isResult,
  errorMessage,
  pythonStatus,
  onClearError,
}) => {
  const [copied, setCopied] = useState(false);

  // Formata operadores matemáticos para apresentação visual
  const formatVisual = (str: string) => {
    return str
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' − ');
  };

  const handleCopy = async () => {
    const textToCopy = isResult ? currentInput : (currentInput || expression);
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignora falha de clipboard se restrito
    }
  };

  // Ajusta o tamanho da fonte conforme o comprimento do texto principal
  const getTextSizeClass = (text: string) => {
    const len = text.length;
    if (len > 18) return 'text-2xl sm:text-3xl';
    if (len > 12) return 'text-3xl sm:text-4xl';
    if (len > 8) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  return (
    <div className="relative bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 flex flex-col justify-between min-h-[160px] sm:min-h-[180px] overflow-hidden transition-all">
      {/* Barra superior de status e controles do display */}
      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] tracking-wide text-slate-300">
            {pythonStatus === 'connected' ? 'Motor Python 3.10 Ativo' : pythonStatus === 'checking' ? 'Verificando Python...' : 'Modo Seguro Local'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copiar resultado"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
          title="Copiar valor atual"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Linha superior: Expressão em construção ou anterior */}
      <div className="mt-3 text-right overflow-x-auto scrollbar-none whitespace-nowrap text-slate-400 font-mono text-sm sm:text-base min-h-[24px]">
        {expression ? formatVisual(expression) : <span className="opacity-0">0</span>}
      </div>

      {/* Mensagem de Erro Matemático ou Sintático */}
      {errorMessage ? (
        <div className="my-auto py-2 px-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between gap-2 text-rose-300 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-[11px] text-rose-400 hover:text-rose-200 underline shrink-0 px-1"
          >
            Limpar
          </button>
        </div>
      ) : (
        /* Linha principal: Dígito atual ou resultado */
        <div className="text-right overflow-x-auto scrollbar-none whitespace-nowrap py-1">
          <span
            className={`font-mono font-bold tracking-tight select-all tabular-nums transition-all ${
              isResult ? 'text-emerald-400' : 'text-white'
            } ${getTextSizeClass(currentInput || '0')}`}
          >
            {currentInput || '0'}
          </span>
        </div>
      )}
    </div>
  );
};
