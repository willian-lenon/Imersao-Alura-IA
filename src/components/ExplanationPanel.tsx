import React, { useState, useEffect } from 'react';
import { BookOpen, Code2, GitFork, CheckCircle2, AlertTriangle, Layers, Copy, Check } from 'lucide-react';
import { CalculationResult } from '../types/calculator';

interface ExplanationPanelProps {
  lastResult: CalculationResult | null;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ lastResult }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'architecture' | 'code' | 'rules'>('steps');
  const [pythonSourceCode, setPythonSourceCode] = useState<string>('');
  const [isLoadingCode, setIsLoadingCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Busca o código-fonte de calculator.py do backend
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCode(true);
    fetch('/api/python-code')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setPythonSourceCode(data.code);
        }
      })
      .catch(() => {
        // Fallback caso offline
      })
      .finally(() => {
        if (isMounted) setIsLoadingCode(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyCode = async () => {
    if (!pythonSourceCode) return;
    try {
      await navigator.clipboard.writeText(pythonSourceCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignora erro de clipboard
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Navegação por Abas */}
      <div className="flex items-center gap-1 p-2 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'steps'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GitFork className="w-4 h-4 text-emerald-500" />
          <span>Passo a Passo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'architecture'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Fluxo & Arquitetura</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'code'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4 text-amber-500" />
          <span>Código Python</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'rules'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-500" />
          <span>Regras da Matemática</span>
        </button>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[560px] flex-1">
        {/* ABA 1: PASSO A PASSO DA RESOLUÇÃO ATUAL */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            {lastResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Expressão Avaliada</span>
                    {lastResult.execution_time_ms !== undefined && (
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        {lastResult.execution_time_ms} ms em Python
                      </span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 dark:text-white break-all">
                    {lastResult.expression}
                  </div>
                  {lastResult.success && lastResult.result && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Resultado Final</span>
                      <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        = {lastResult.result}
                      </span>
                    </div>
                  )}
                </div>

                {lastResult.success && lastResult.steps && lastResult.steps.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Resolução Sequencial (Ordem de Precedência)
                    </h4>
                    <div className="space-y-2">
                      {lastResult.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200 text-sm"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-mono">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : lastResult.error ? (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      <span>Tratamento de Exceção Matemática</span>
                    </div>
                    <p className="text-sm font-mono mt-1">{lastResult.error}</p>
                  </div>
                ) : null}

                {/* Notação Polonesa Reversa (RPN) para inspeção analítica */}
                {lastResult.rpn_tokens && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 block mb-1 font-medium">Árvore Linearizada (RPN / Shunting-Yard):</span>
                    <div className="font-mono text-slate-700 dark:text-slate-300 flex flex-wrap gap-1.5">
                      {lastResult.rpn_tokens.map((tok, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-semibold"
                        >
                          {tok}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <GitFork className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Nenhum cálculo realizado ainda.
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Digite uma expressão como <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">10 + 5 * 2</code> ou <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">(15 - 3) / 4</code> e clique em <strong>=</strong> para ver a resolução passo a passo pelo Python.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ABA 2: FLUXO E ARQUITETURA DE SISTEMAS */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Visão do Analista de Sistemas: Fluxo Ponta a Ponta
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Como os dados transitam desde o toque na tela até o resultado retornado pelo motor Python.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Captura & Entrada (Interface Reativa)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  O usuário digita números e operadores via toque tátil no celular ou teclado físico no computador. O estado React monta a expressão garantindo sintaxe amigável.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Camada de API Full Stack (Node.js & Express)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  O endpoint <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">POST /api/calculate</code> recebe o payload JSON com a expressão, valida seu tamanho e caracteres permitidos, e despacha de forma segura para o processo Python isolado via <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">child_process.execFile</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Análise Léxica & Tokenização em Python</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  O script <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">calculator.py</code> decompõe o texto em uma sequência estruturada de tokens (<code className="font-mono text-emerald-600 dark:text-emerald-400">NUMBER</code>, <code className="font-mono text-amber-600 dark:text-amber-400">OPERATOR</code>, <code className="font-mono text-purple-600 dark:text-purple-400">PAREN</code>, <code className="font-mono text-blue-600 dark:text-blue-400">UNARY_OP</code>), tratando decimais e números negativos.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                  <span>Precedência Shunting-Yard & Avaliação Decimal</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  O algoritmo Shunting-Yard (de Edsger Dijkstra) converte os tokens em Notação Polonesa Reversa (RPN), ordenando as multiplicações e divisões antes de adições e subtrações. A avaliação é realizada com a biblioteca nativa <code className="font-mono text-slate-800 dark:text-slate-200 font-semibold">decimal.Decimal</code> do Python, eliminando imprecisões binárias de ponto flutuante.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">5</span>
                  <span>Tratamento Seguro de Exceções</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Cenários críticos como <strong>divisão por zero</strong>, parênteses desbalanceados ou ausência de operandos são capturados por classes de exceção personalizadas (<code className="font-mono text-rose-500">MathEngineError</code>) e respondidos com mensagens pedagógicas em português.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: CÓDIGO PYTHON REAL */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  calculator.py (Backend Python 3.10)
                </h4>
                <p className="text-xs text-slate-500">Código-fonte oficial executado no servidor</p>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            {isLoadingCode ? (
              <div className="p-8 text-center text-xs text-slate-500">Carregando código...</div>
            ) : (
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[420px]">
                <code>{pythonSourceCode || '# Carregando script calculator.py...'}</code>
              </pre>
            )}
          </div>
        )}

        {/* ABA 4: REGRAS DA MATEMÁTICA E PEMDAS */}
        {activeTab === 'rules' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
              <h4 className="font-bold text-purple-700 dark:text-purple-300 text-base">
                Regra Fundamental da Precedência (PEMDAS / BODMAS)
              </h4>
              <p className="text-xs text-purple-900/80 dark:text-purple-200/80">
                Na matemática convencional, as operações NÃO são avaliadas simplesmente da esquerda para a direita de forma cega.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  1. Multiplicação e Divisão (Prioritárias)
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Têm precedência nível 2. Em <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">10 + 5 * 2</code>, primeiro calcula-se <code className="font-mono text-emerald-600">5 * 2 = 10</code>, e então <code className="font-mono text-emerald-600">10 + 10 = 20</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  2. Adição e Subtração
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Têm precedência nível 1. Possuem associatividade à esquerda, sendo resolvidas da esquerda para a direita após as multiplicações e divisões.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  3. Parênteses de Agrupamento
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Parênteses alteram a ordem padrão. Em <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">(10 + 5) * 2</code>, o conteúdo interno é resolvido primeiro gerando <code className="font-mono text-purple-600">15 * 2 = 30</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  4. Indeterminação da Divisão por Zero
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Não existe número real <code className="font-mono">x</code> tal que <code className="font-mono">x * 0 = a</code> (para <code className="font-mono">a != 0</code>). O motor Python bloqueia e alerta o usuário imediatamente.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
              <strong>Vantagem do Python Decimal:</strong> Evita o clássico problema de ponto flutuante IEEE 754 (onde <code className="font-mono">0.1 + 0.2</code> resultaria em <code className="font-mono">0.30000000000000004</code>). O motor Python garante a resposta exata <code className="font-mono font-bold">0.3</code>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
