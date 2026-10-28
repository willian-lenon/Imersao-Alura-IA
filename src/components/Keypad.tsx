import React from 'react';
import { Delete, RotateCcw, Equal } from 'lucide-react';
import { feedback } from '../utils/feedback';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (operator: string) => void;
  onPercent: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onParen: (paren: '(' | ')') => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onPercent,
  onClear,
  onBackspace,
  onToggleSign,
  onParen,
  onCalculate,
  isLoading,
}) => {
  const handleKeyClick = (action: () => void, type: 'number' | 'operator' | 'action' | 'equals') => {
    feedback.playKeyClick(type);
    action();
  };

  return (
    <div className="w-full flex flex-col gap-2.5 sm:gap-3 select-none">
      {/* Linha 1: Controles de Edição e Agrupamento */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => handleKeyClick(onClear, 'action')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold text-base sm:text-lg flex items-center justify-center transition-all border border-rose-500/20 active:scale-[0.97]"
          title="Limpar tudo (Escape)"
          aria-label="Limpar tudo"
        >
          <RotateCcw className="w-4 h-4 mr-1 sm:w-5 sm:h-5" />
          <span>AC</span>
        </button>

        <button
          type="button"
          onClick={() => handleKeyClick(onBackspace, 'action')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-base sm:text-lg flex items-center justify-center transition-all border border-slate-200/60 dark:border-slate-700/60 active:scale-[0.97]"
          title="Apagar caractere (Backspace)"
          aria-label="Apagar caractere anterior"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => handleKeyClick(() => onParen('('), 'operator')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-lg sm:text-xl flex items-center justify-center transition-all border border-slate-200/60 dark:border-slate-700/60 active:scale-[0.97]"
          title="Abrir parêntese"
          aria-label="Abrir parêntese"
        >
          (
        </button>

        <button
          type="button"
          onClick={() => handleKeyClick(() => onParen(')'), 'operator')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-lg sm:text-xl flex items-center justify-center transition-all border border-slate-200/60 dark:border-slate-700/60 active:scale-[0.97]"
          title="Fechar parêntese"
          aria-label="Fechar parêntese"
        >
          )
        </button>
      </div>

      {/* Linha 2: 7, 8, 9, ÷ (Divisão) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {['7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKeyClick(() => onDigit(digit), 'number')}
            className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xl sm:text-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200/80 dark:border-slate-700 active:scale-[0.97]"
            aria-label={`Dígito ${digit}`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeyClick(() => onOperator('/'), 'operator')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-2xl sm:text-3xl flex items-center justify-center transition-all border border-amber-500/20 active:scale-[0.97]"
          title="Divisão (/)"
          aria-label="Operação de Divisão"
        >
          ÷
        </button>
      </div>

      {/* Linha 3: 4, 5, 6, × (Multiplicação) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {['4', '5', '6'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKeyClick(() => onDigit(digit), 'number')}
            className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xl sm:text-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200/80 dark:border-slate-700 active:scale-[0.97]"
            aria-label={`Dígito ${digit}`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeyClick(() => onOperator('*'), 'operator')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-2xl sm:text-3xl flex items-center justify-center transition-all border border-amber-500/20 active:scale-[0.97]"
          title="Multiplicação (*)"
          aria-label="Operação de Multiplicação"
        >
          ×
        </button>
      </div>

      {/* Linha 4: 1, 2, 3, − (Subtração) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {['1', '2', '3'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKeyClick(() => onDigit(digit), 'number')}
            className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xl sm:text-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200/80 dark:border-slate-700 active:scale-[0.97]"
            aria-label={`Dígito ${digit}`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleKeyClick(() => onOperator('-'), 'operator')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-2xl sm:text-3xl flex items-center justify-center transition-all border border-amber-500/20 active:scale-[0.97]"
          title="Subtração (-)"
          aria-label="Operação de Subtração"
        >
          −
        </button>
      </div>

      {/* Linha 5: ±, 0, ., + (Adição) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => handleKeyClick(onToggleSign, 'action')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-lg sm:text-xl flex items-center justify-center transition-all border border-slate-200/60 dark:border-slate-700/60 active:scale-[0.97]"
          title="Inverter sinal positivo/negativo"
          aria-label="Inverter sinal"
        >
          ±
        </button>

        <button
          type="button"
          onClick={() => handleKeyClick(() => onDigit('0'), 'number')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xl sm:text-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200/80 dark:border-slate-700 active:scale-[0.97]"
          aria-label="Dígito 0"
        >
          0
        </button>

        <button
          type="button"
          onClick={() => handleKeyClick(() => onDigit('.'), 'number')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200/80 dark:border-slate-700 active:scale-[0.97]"
          title="Separador decimal"
          aria-label="Ponto decimal"
        >
          .
        </button>

        <button
          type="button"
          onClick={() => handleKeyClick(() => onOperator('+'), 'operator')}
          className="h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-2xl sm:text-3xl flex items-center justify-center transition-all border border-amber-500/20 active:scale-[0.97]"
          title="Adição (+)"
          aria-label="Operação de Adição"
        >
          +
        </button>
      </div>

      {/* Linha 6: Porcentagem (%) e Tecla Primária de Execução do Cálculo (=) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => handleKeyClick(onPercent, 'operator')}
          className="h-14 sm:h-15 rounded-xl sm:rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-2xl sm:text-3xl flex items-center justify-center transition-all border border-amber-500/20 active:scale-[0.97]"
          title="Porcentagem (%)"
          aria-label="Calcular Porcentagem"
        >
          %
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleKeyClick(onCalculate, 'equals')}
          className={`col-span-3 h-14 sm:h-15 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/15 active:scale-[0.98] ${
            isLoading ? 'opacity-80 cursor-wait' : ''
          }`}
          title="Calcular resultado (Enter ou =)"
          aria-label="Calcular resultado final com motor Python"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-base font-semibold">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processando em Python...</span>
            </div>
          ) : (
            <>
              <Equal className="w-6 h-6 stroke-[2.5]" />
              <span className="text-sm uppercase tracking-wider font-semibold opacity-90 sm:inline hidden">
                Calcular
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
