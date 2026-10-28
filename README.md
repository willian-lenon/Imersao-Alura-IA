# Calculadora Full Stack em Python & React - PyCalc Engine

Projeto de calculadora desenvolvido durante a **Imersão Alura IA**, originalmente gerado e aprimorado utilizando o **Google AI Studio** e integrado com backend em **Python 3.10** e frontend em **React / TypeScript**.

---

## 🚀 Funcionalidades

- **Quatro Operações Matemáticas Básicas:**
  - Adição (`+`)
  - Subtração (`−`)
  - Multiplicação (`×`)
  - Divisão (`÷`) com tratamento estrito e seguro de divisão por zero.
- **Cálculo de Porcentagem (`%`):**
  - **Porcentagem direta:** `50%` $\rightarrow$ `0.5`, `200 * 15%` $\rightarrow$ `30`.
  - **Acréscimo e desconto comercial relativo:** `100 + 20%` $\rightarrow$ `120`, `100 - 15%` $\rightarrow$ `85`.
  - **Expressões com agrupamento:** `(50 + 50)%` $\rightarrow$ `1`.
- **Precedência Matemática Rigorosa (PEMDAS / BODMAS):**
  - Respeito à ordem matemática via algoritmo *Shunting-Yard* (Edsger Dijkstra) e Notação Polonesa Reversa (RPN).
- **Precisão Decimal Absoluta:**
  - Uso do módulo padrão `decimal.Decimal` do Python com 28 dígitos de precisão, eliminando erros de ponto flutuante IEEE 754 (como `0.1 + 0.2 = 0.3`).
- **Passo a Passo Didático:**
  - Exibição de cada etapa da resolução matemática e tempo de execução em milissegundos.
- **Interface Responsiva & Teclado Físico:**
  - Compatível com navegadores e smartphones, além de suporte a atalhos do teclado numérico do computador.

---

## 📁 Estrutura do Projeto

```
├── calculator.py       # Motor matemático seguro em Python 3.10 (Shunting-Yard, RPN, Decimal)
├── test_calculator.py  # Bateria de testes unitários automatizados
├── server.ts           # Servidor API Node.js / Express para conexão segura com o Python
├── src/                # Interface visual moderna e responsiva em React / TailwindCSS
│   ├── App.tsx         # Componente principal e controle de fluxo
│   └── components/     # Display, Keypad, ExplanationPanel, HistoryPanel
└── package.json        # Dependências e scripts do ecossistema web
```

---

## 🧪 Como Executar os Testes Automatizados

Para validar o motor matemático e todas as operações:

```powershell
python test_calculator.py
```

Exemplo de execução direta via terminal:

```powershell
# Cálculo com porcentagem direta
python calculator.py "200 * 15%"

# Cálculo de acréscimo comercial
python calculator.py "100 + 20%"

# Expressão composta com precedência
python calculator.py "10 + 5 * 2"
```
