# 📋 Guia Passo a Passo: Quadro de Tarefas Kanban com Cards

Este documento serve como um guia didático e checklist para acompanhar o entendimento e a evolução da sua aplicação de tarefas para o formato **Quadro Kanban com Cards**, permitindo adicionar, mover entre colunas e remover atividades.

---

## 🎯 Objetivo desta Versão (Kanban Board)
Transformar a lista simples em um quadro interativo com:
- **3 Colunas de Status**:
  1. 📌 **Pendente**: Tarefas a serem iniciadas.
  2. ⏳ **Em Andamento**: Tarefas que você está executando no momento.
  3. ✅ **Concluído**: Tarefas finalizadas (com texto riscado).
- **Cards Interativos**:
  - Arrastar e soltar (HTML5 Drag and Drop API nativa).
  - Seletor rápido de coluna diretamente no card (ótimo para telas de toque ou teclado).
  - Botão de exclusão (🗑️).
- **Persistência no Navegador (`localStorage`)**: Todas as movimentações e novos cards ficam salvos mesmo se você fechar ou recarregar o navegador.
- **Tecnologias**: Exclusivamente **HTML5**, **CSS3** e **JavaScript puro** (Vanilla JS).

---

## 📂 Estrutura de Arquivos

```text
desafio_03/
│
├── index.html            # Estrutura do quadro e das colunas
├── style.css             # Estilos de cards, layout em grid/colunas e efeitos de drag
├── script.js             # Lógica de Drag & Drop, movimentação e localStorage
└── GUIA_PASSO_A_PASSO.md # Guia de passos e conceitos explicados
```

---

## 🧭 Checklist de Construção e Entendimento

### Etapa 1: Estrutura HTML (`index.html`)
- [x] **Formulário de Entrada Flexível**:
  - Campo `<input>` para digitar a tarefa.
  - Campo `<select>` para escolher em qual coluna o card começará (Pendente, Em Andamento ou Concluído).
  - Botão `<button type="submit">` para cadastrar.
- [x] **Estrutura do Quadro (`<main class="quadro-kanban">`)**:
  - Três seções `<section class="coluna">` identificadas por atributos `data-status`.
  - Cabeçalho com indicador de cor e contadores dinâmicos (`<span class="contador-badge">`).
  - Container interno (`.coluna-cards`) preparado para receber os cards dinamicamente.

---

### Etapa 2: Estilização Visual com CSS (`style.css`)
- [x] **Layout em Grid Responsivo**:
  - `grid-template-columns: repeat(3, 1fr)` para colocar as 3 colunas lado a lado no computador.
  - `@media (max-width: 900px)` para empilhar as colunas automaticamente em telas menores.
- [x] **Aparência dos Cards (`.card-tarefa`)**:
  - Fundo branco, bordas suaves, sombra com efeito hover (`transform: translateY(-2px)`).
  - Cursor `grab` (mãozinha aberta) e `grabbing` (mão fechada ao arrastar).
- [x] **Feedback Visual de Arraste**:
  - `.card-tarefa.arrastando`: Fica semi-transparente durante o arraste (`opacity: 0.4`).
  - `.coluna.drag-over`: A coluna destino ganha destaque com borda colorida e fundo sutilmente destacado quando um card passa por cima dela.

---

### Etapa 3: Lógica e HTML5 Drag & Drop no JavaScript (`script.js`)
- [x] **Estrutura de Dados Atualizada**:
  ```javascript
  {
    id: "1718000000000",
    texto: "Estudar manipulação do DOM",
    status: "em_andamento" // 'pendente', 'em_andamento' ou 'concluido'
  }
  ```
- [x] **API Nativa de Arrastar e Soltar (HTML5 Drag and Drop)**:
  - `card.setAttribute('draggable', 'true')`: Habilita o card para ser arrastado.
  - Evento `dragstart`: Armazena o ID do card e aplica a classe visual `.arrastando`.
  - Evento `dragover`: Executa `e.preventDefault()` na coluna destino para autorizar a soltura.
  - Evento `drop`: Captura o status da coluna onde o card foi solto e chama a função `moverTarefaParaColuna()`.
- [x] **Compatibilidade e Acessibilidade**:
  - Cada card possui também um seletor `<select>` com as opções de coluna, permitindo mover tarefas mesmo sem usar o mouse (essencial em telas de toque).
- [x] **Persistência no `localStorage`**:
  - Todas as adições, mudanças de coluna e remoções salvam automaticamente o array atualizado com `JSON.stringify()`.

---

## 🚀 Como Testar as Novas Funcionalidades

1. Dê dois cliques no arquivo [**`index.html`**](file:///c:/imersao_alura_ia/desafio_03/index.html) no seu navegador.
2. **Adicionar cards**: Digite uma atividade, escolha a coluna inicial e clique em **+ Adicionar Card**.
3. **Mover arrastando (Drag & Drop)**:
   - Clique e segure com o botão esquerdo do mouse sobre um card.
   - Arraste-o para outra coluna (repare que a coluna de destino muda de cor ao passar por cima).
   - Solte o botão do mouse. O card agora pertencerá à nova coluna!
4. **Mover pelo seletor**:
   - No rodapé do card, mude a opção do menu suspenso para outra coluna e veja o card se mover imediatamente.
5. **Verificar os contadores**: Os números no topo de cada coluna atualizam instantaneamente.
6. **Testar persistência**: Aperte **F5** no teclado. Todos os cards permanecem exatamente nas colunas onde você os deixou!
