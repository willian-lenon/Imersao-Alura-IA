// ============================================================
// APLICAÇÃO DE QUADRO KANBAN DE TAREFAS
// Tecnologias: JavaScript puro (Vanilla JS) + HTML5 Drag & Drop + localStorage
// ============================================================

// 1. SELEÇÃO DE ELEMENTOS DO DOM
const formTarefa = document.getElementById('form-tarefa');
const inputTarefa = document.getElementById('input-tarefa');
const selectColunaInicial = document.getElementById('select-coluna-inicial');

// Mapeamento dos containers de cards de cada coluna
const containersColunas = {
  pendente: document.getElementById('cards-pendente'),
  em_andamento: document.getElementById('cards-em_andamento'),
  concluido: document.getElementById('cards-concluido')
};

// Badges de contadores
const badgesContadores = {
  pendente: document.getElementById('badge-pendente'),
  em_andamento: document.getElementById('badge-em_andamento'),
  concluido: document.getElementById('badge-concluido')
};

// Chave utilizada no localStorage
const STORAGE_KEY = 'minha_lista_de_tarefas_kanban';

// Variável para guardar o ID do card que está sendo arrastado
let cardSendoArrastadoId = null;

// 2. ESTADO DA APLICAÇÃO (CARREGAMENTO DO LOCALSTORAGE)
let tarefas = carregarTarefasDoStorage();

// ============================================================
// 3. FUNÇÕES DE PERSISTÊNCIA (MEMÓRIA DO NAVEGADOR)
// ============================================================

/**
 * Carrega as tarefas salvas no localStorage e faz compatibilidade com versões antigas.
 */
function carregarTarefasDoStorage() {
  // Tenta carregar do novo formato kanban
  const dados = localStorage.getItem(STORAGE_KEY);
  if (dados) {
    try {
      return JSON.parse(dados);
    } catch (e) {
      console.error('Erro ao ler tarefas:', e);
      return [];
    }
  }

  // Compatibilidade com a versão anterior (se houver dados na chave antiga)
  const dadosAntigos = localStorage.getItem('minha_lista_de_tarefas');
  if (dadosAntigos) {
    try {
      const listaAntiga = JSON.parse(dadosAntigos);
      // Converte o formato antigo (concluida: boolean) para o novo formato (status)
      return listaAntiga.map((item) => ({
        id: item.id || Date.now() + Math.random(),
        texto: item.texto,
        status: item.concluida ? 'concluido' : 'pendente'
      }));
    } catch (e) {
      return [];
    }
  }

  return [];
}

/**
 * Salva as tarefas atuais no localStorage.
 */
function salvarTarefasNoStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

// ============================================================
// 4. FUNÇÕES DE MANIPULAÇÃO DAS TAREFAS
// ============================================================

/**
 * Adiciona um novo card de tarefa.
 */
function adicionarTarefa(texto, status = 'pendente') {
  const textoLimpo = texto.trim();
  if (!textoLimpo) return;

  const novaTarefa = {
    id: Date.now().toString(), // ID único em formato texto
    texto: textoLimpo,
    status: status // 'pendente', 'em_andamento' ou 'concluido'
  };

  tarefas.unshift(novaTarefa);
  salvarTarefasNoStorage();
  renderizarQuadro();
}

/**
 * Move a tarefa para uma nova coluna.
 */
function moverTarefaParaColuna(tarefaId, novoStatus) {
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id.toString() === tarefaId.toString()) {
      return { ...tarefa, status: novoStatus };
    }
    return tarefa;
  });

  salvarTarefasNoStorage();
  renderizarQuadro();
}

/**
 * Remove uma tarefa permanentemente.
 */
function removerTarefa(tarefaId) {
  tarefas = tarefas.filter((tarefa) => tarefa.id.toString() !== tarefaId.toString());
  salvarTarefasNoStorage();
  renderizarQuadro();
}

// ============================================================
// 5. RENDERIZAÇÃO DA INTERFACE (DESENHAR CARDS NA TELA)
// ============================================================

/**
 * Redesenha todos os cards em suas respectivas colunas e atualiza contadores.
 */
function renderizarQuadro() {
  // Limpa as 3 colunas
  Object.keys(containersColunas).forEach((status) => {
    containersColunas[status].innerHTML = '';
  });

  // Contadores por coluna
  const contadores = { pendente: 0, em_andamento: 0, concluido: 0 };

  // Renderiza cada card na coluna correta
  tarefas.forEach((tarefa) => {
    const statusValido = containersColunas[tarefa.status] ? tarefa.status : 'pendente';
    contadores[statusValido]++;

    const cardElemento = criarElementoCard(tarefa);
    containersColunas[statusValido].appendChild(cardElemento);
  });

  // Atualiza os badges de contagem
  Object.keys(badgesContadores).forEach((status) => {
    badgesContadores[status].textContent = contadores[status];

    // Se a coluna estiver vazia, adiciona aviso visual
    if (contadores[status] === 0) {
      const msgVazia = document.createElement('div');
      msgVazia.className = 'coluna-vazia';
      msgVazia.textContent = 'Arraste um card para cá';
      containersColunas[status].appendChild(msgVazia);
    }
  });
}

/**
 * Cria a estrutura DOM de um card com eventos de Drag & Drop e botões rápidos.
 */
function criarElementoCard(tarefa) {
  const card = document.createElement('div');
  card.className = 'card-tarefa';
  card.setAttribute('draggable', 'true');
  card.dataset.id = tarefa.id;
  card.dataset.status = tarefa.status;

  // 1. Texto do card
  const conteudo = document.createElement('div');
  conteudo.className = 'card-conteudo';
  conteudo.textContent = tarefa.texto;

  // 2. Rodapé com seletor de coluna e botão de exclusão
  const rodape = document.createElement('div');
  rodape.className = 'card-rodape';

  // Seletor para mover (ótimo para telas de toque ou teclado)
  const selectMover = document.createElement('select');
  selectMover.className = 'card-mover-select';
  selectMover.title = 'Mover tarefa para outra coluna';

  const opcoes = [
    { valor: 'pendente', label: '📌 Pendente' },
    { valor: 'em_andamento', label: '⏳ Em Andamento' },
    { valor: 'concluido', label: '✅ Concluído' }
  ];

  opcoes.forEach((opt) => {
    const optionEl = document.createElement('option');
    optionEl.value = opt.valor;
    optionEl.textContent = opt.label;
    if (opt.valor === tarefa.status) {
      optionEl.selected = true;
    }
    selectMover.appendChild(optionEl);
  });

  // Ao mudar a seleção no dropdown, move o card
  selectMover.addEventListener('change', (e) => {
    moverTarefaParaColuna(tarefa.id, e.target.value);
  });

  // Botão de deletar
  const btnDeletar = document.createElement('button');
  btnDeletar.className = 'btn-deletar-card';
  btnDeletar.title = 'Excluir esta tarefa';
  btnDeletar.innerHTML = '🗑️';
  btnDeletar.addEventListener('click', () => {
    removerTarefa(tarefa.id);
  });

  rodape.appendChild(selectMover);
  rodape.appendChild(btnDeletar);

  card.appendChild(conteudo);
  card.appendChild(rodape);

  // ============================================================
  // EVENTOS DE DRAG & DROP NO CARD
  // ============================================================
  card.addEventListener('dragstart', (e) => {
    cardSendoArrastadoId = tarefa.id;
    card.classList.add('arrastando');
    // Necessário para navegadores baseados em Gecko/Firefox
    e.dataTransfer.setData('text/plain', tarefa.id);
    e.dataTransfer.effectAllowed = 'move';
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('arrastando');
    cardSendoArrastadoId = null;
    // Remove qualquer destaque residual das colunas
    document.querySelectorAll('.coluna').forEach((col) => {
      col.classList.remove('drag-over');
    });
  });

  return card;
}

// ============================================================
// 6. CONFIGURAÇÃO DE DROP ZONES (COLUNAS QUE RECEBEM CARDS)
// ============================================================

function configurarColunasParaArrastarESoltar() {
  const colunas = document.querySelectorAll('.coluna');

  colunas.forEach((coluna) => {
    const statusDestino = coluna.dataset.status;

    // Quando o card está passando por cima da coluna
    coluna.addEventListener('dragover', (e) => {
      e.preventDefault(); // Permite que a área receba o drop
      e.dataTransfer.dropEffect = 'move';
      coluna.classList.add('drag-over');
    });

    // Quando o card sai da coluna sem soltar
    coluna.addEventListener('dragleave', (e) => {
      // Garante que só remove o estilo se realmente saiu do elemento da coluna
      if (!coluna.contains(e.relatedTarget)) {
        coluna.classList.remove('drag-over');
      }
    });

    // Quando o card é solto na coluna
    coluna.addEventListener('drop', (e) => {
      e.preventDefault();
      coluna.classList.remove('drag-over');

      const id = cardSendoArrastadoId || e.dataTransfer.getData('text/plain');
      if (id && statusDestino) {
        moverTarefaParaColuna(id, statusDestino);
      }
    });
  });
}

// ============================================================
// 7. EVENTOS GERAIS
// ============================================================

// Envio do formulário para criar nova tarefa
formTarefa.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const texto = inputTarefa.value;
  const statusInicial = selectColunaInicial.value;

  adicionarTarefa(texto, statusInicial);

  inputTarefa.value = '';
  inputTarefa.focus();
});

// Inicialização
configurarColunasParaArrastarESoltar();
renderizarQuadro();
