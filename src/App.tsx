import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Moon, Sun, Terminal } from 'lucide-react';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { ExplanationPanel } from './components/ExplanationPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { CalculationResult, CalculationHistoryItem } from './types/calculator';
import { feedback } from './utils/feedback';

export default function App() {
  const [expression, setExpression] = useState<string>('');
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [isResult, setIsResult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [pythonStatus, setPythonStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'calc' | 'analysis' | 'history'>('calc');

  // Verifica o status do motor Python no backend ao carregar
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setPythonStatus('connected');
        } else {
          setPythonStatus('offline');
        }
      })
      .catch(() => {
        setPythonStatus('offline');
      });
  }, []);

  // Alterna o modo escuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sincroniza configuração de som com o feedback manager
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    feedback.soundEnabled = nextState;
  };

  // Trata entrada de dígitos e ponto decimal
  const handleDigit = useCallback((digit: string) => {
    setErrorMessage(null);

    if (isResult) {
      // Se acabou de calcular um resultado e digitou novo número, inicia nova expressão
      setCurrentInput(digit === '.' ? '0.' : digit);
      setExpression('');
      setIsResult(false);
      return;
    }

    if (digit === '.') {
      if (currentInput.includes('.')) return;
      setCurrentInput((prev) => (prev ? prev + '.' : '0.'));
      return;
    }

    if (currentInput === '0') {
      setCurrentInput(digit);
    } else {
      setCurrentInput((prev) => prev + digit);
    }
  }, [currentInput, isResult]);

  // Trata operadores matemáticos (+, -, *, /)
  const handleOperator = useCallback((op: string) => {
    setErrorMessage(null);
    setIsResult(false);

    if (currentInput) {
      // Se há um número em digitação, concatena na expressão
      setExpression((prev) => (prev ? `${prev} ${currentInput} ${op}` : `${currentInput} ${op}`));
      setCurrentInput('');
    } else if (expression) {
      // Se o último caractere da expressão já for um operador, substitui pelo novo
      const trimmed = expression.trim();
      const lastChar = trimmed.slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) {
        setExpression(trimmed.slice(0, -1).trim() + ` ${op}`);
      } else {
        setExpression(`${expression} ${op}`);
      }
    }
  }, [currentInput, expression]);

  // Trata parênteses
  const handleParen = useCallback((paren: '(' | ')') => {
    setErrorMessage(null);
    setIsResult(false);

    if (paren === '(') {
      if (currentInput && currentInput !== '0') {
        // Se há um número antes de (, adiciona multiplicação implícita: ex: 5( -> 5 * (
        setExpression((prev) => (prev ? `${prev} ${currentInput} * (` : `${currentInput} * (`));
        setCurrentInput('');
      } else {
        setExpression((prev) => (prev ? `${prev} (` : `(`));
      }
    } else {
      // Fecha parêntese
      if (currentInput) {
        setExpression((prev) => (prev ? `${prev} ${currentInput} )` : `${currentInput} )`));
        setCurrentInput('');
      } else {
        setExpression((prev) => (prev ? `${prev} )` : `)`));
      }
    }
  }, [currentInput]);

  // Inverte o sinal (+ / -) do operando atual
  const handleToggleSign = useCallback(() => {
    if (!currentInput || currentInput === '0') return;
    if (currentInput.startsWith('-')) {
      setCurrentInput(currentInput.slice(1));
    } else {
      setCurrentInput('-' + currentInput);
    }
  }, [currentInput]);

  // Apaga o último caractere (Backspace)
  const handleBackspace = useCallback(() => {
    setErrorMessage(null);
    if (isResult) {
      setCurrentInput('0');
      setIsResult(false);
      return;
    }

    if (currentInput.length > 1) {
      setCurrentInput((prev) => prev.slice(0, -1));
    } else if (currentInput.length === 1 && currentInput !== '0') {
      setCurrentInput('0');
    } else if (expression) {
      // Se o input atual estiver vazio, apaga da expressão
      const trimmed = expression.trim();
      const parts = trimmed.split(' ');
      parts.pop();
      setExpression(parts.join(' '));
    }
  }, [currentInput, expression, isResult]);

  // Limpa tudo (All Clear)
  const handleClear = useCallback(() => {
    setExpression('');
    setCurrentInput('0');
    setIsResult(false);
    setErrorMessage(null);
  }, []);

  // Executa o cálculo via motor Python no backend
  const handleCalculate = useCallback(async () => {
    let fullExpr = expression;
    if (currentInput) {
      fullExpr = expression ? `${expression} ${currentInput}` : currentInput;
    }

    fullExpr = fullExpr.trim();
    if (!fullExpr) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: fullExpr }),
      });

      const data: CalculationResult = await response.json();

      if (data.success && data.result !== undefined) {
        setCurrentInput(data.result);
        setExpression(fullExpr);
        setIsResult(true);
        setLastResult(data);

        // Adiciona ao histórico de cálculos
        const historyItem: CalculationHistoryItem = {
          id: `${Date.now()}-${Math.random()}`,
          expression: fullExpr,
          result: data.result,
          steps: data.steps,
          executionTimeMs: data.execution_time_ms,
          timestamp: Date.now(),
          engine: data.engine,
        };
        setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
      } else {
        const errorText = data.error || 'Erro ao processar cálculo matemático.';
        setErrorMessage(errorText);
        setLastResult({
          success: false,
          error: errorText,
          expression: fullExpr,
        });
      }
    } catch {
      setErrorMessage('Erro de comunicação com o servidor Python.');
    } finally {
      setIsLoading(false);
    }
  }, [currentInput, expression]);

  // Reutiliza um resultado do histórico na calculadora
  const handleSelectHistoryResult = (val: string) => {
    setCurrentInput(val);
    setExpression('');
    setIsResult(false);
    setErrorMessage(null);
    setMobileTab('calc');
  };

  // Limpa o histórico
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Suporte a teclado físico do computador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input ou textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        feedback.playKeyClick('number');
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        feedback.playKeyClick('number');
        handleDigit('.');
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        feedback.playKeyClick('operator');
        handleOperator(e.key);
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        feedback.playKeyClick('operator');
        handleParen(e.key as '(' | ')');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        feedback.playKeyClick('equals');
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        feedback.playKeyClick('action');
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        feedback.playKeyClick('action');
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleOperator, handleParen, handleCalculate, handleBackspace, handleClear]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors antialiased">
      {/* Top Bar seguindo o Top Bar Contract: 3 zonas sem poluição visual */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zona 1: Nome da Marca */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              PyCalc
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              v1.0 Python Engine
            </span>
          </div>

          {/* Zona 2: Navegação e Informações de Estado */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <span className="text-slate-900 dark:text-white font-semibold">
              Calculadora Científica Básica
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>Precedência PEMDAS</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>Precisão Decimal Exata</span>
          </nav>

          {/* Zona 3: Controles Úteis (Som, Tema Escuro/Claro) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
              }`}
              title={soundEnabled ? 'Desativar som de clique' : 'Ativar som de clique'}
              aria-label="Alternar som"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline font-medium">Som</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema claro/escuro"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navegação Mobile em Segmented Control (quando em telas menores) */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 sticky top-16 z-20">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMobileTab('calc')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mobileTab === 'calc'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Calculadora
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('analysis')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mobileTab === 'analysis'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Passos & Python
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('history')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mobileTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Histórico ({history.length})
          </button>
        </div>
      </div>

      {/* Conteúdo Principal Responsivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA: Calculadora (Sempre visível no Desktop, ou quando mobileTab === 'calc' no mobile) */}
          <div
            className={`lg:col-span-5 w-full flex flex-col gap-4 ${
              mobileTab === 'calc' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-4">
              {/* Display de 2 linhas com expressão e valor principal */}
              <Display
                expression={expression}
                currentInput={currentInput}
                isResult={isResult}
                errorMessage={errorMessage}
                pythonStatus={pythonStatus}
                onClearError={() => setErrorMessage(null)}
              />

              {/* Teclado tátil e ergonômico */}
              <Keypad
                onDigit={handleDigit}
                onOperator={handleOperator}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onToggleSign={handleToggleSign}
                onParen={handleParen}
                onCalculate={handleCalculate}
                isLoading={isLoading}
              />
            </div>

            {/* Dica de teclado para desktop */}
            <div className="hidden sm:flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Suporte a teclado numérico físico</span>
              <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                0-9 · + − × ÷ · Enter · Esc
              </span>
            </div>
          </div>

          {/* COLUNA DIREITA: Painel de Explicação, Engenharia de Software e Histórico */}
          <div
            className={`lg:col-span-7 w-full flex flex-col gap-6 ${
              mobileTab !== 'calc' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Se no mobile estiver no histórico, exibe Histórico primeiro */}
            {mobileTab === 'history' ? (
              <HistoryPanel
                history={history}
                onSelectResult={handleSelectHistoryResult}
                onClearHistory={handleClearHistory}
              />
            ) : (
              <>
                {/* Painel com abas: Passo a Passo, Arquitetura, Código Python, Regras Matemáticas */}
                <ExplanationPanel lastResult={lastResult} />

                {/* Histórico compacto em desktop abaixo da explicação */}
                <div className="hidden lg:block">
                  <HistoryPanel
                    history={history}
                    onSelectResult={handleSelectHistoryResult}
                    onClearHistory={handleClearHistory}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé discreto e institucional */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          PyCalc Engine · Desenvolvido com Python 3.10, Express e React 19 · Respeito integral às regras de precedência matemática
        </p>
      </footer>
    </div>
  );
}
