import React from 'react';
import { History, Trash2, ArrowUpRight } from 'lucide-react';
import { CalculationHistoryItem } from '../types/calculator';

interface HistoryPanelProps {
  history: CalculationHistoryItem[];
  onSelectResult: (val: string) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectResult,
  onClearHistory,
}) => {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Histórico de Cálculos
          </h3>
          <span className="text-xs text-slate-400 font-mono">({history.length})</span>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
            title="Limpar todo o histórico"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 max-h-[360px] sm:max-h-[460px] scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
            <p className="text-xs text-slate-500">Nenhum cálculo registrado ainda.</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all group flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatTime(item.timestamp)}</span>
                {item.executionTimeMs !== undefined && (
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px]">
                    {item.executionTimeMs}ms
                  </span>
                )}
              </div>

              <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                {item.expression}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  = {item.result}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectResult(item.result)}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 opacity-90 group-hover:opacity-100 transition-opacity"
                  title="Usar este resultado na calculadora"
                >
                  <span>Reutilizar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
