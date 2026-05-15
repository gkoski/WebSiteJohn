// ============================================================
// ACOMPANHAMENTO — lê pedido do localStorage e exibe timeline
// ============================================================

const STATUS_ORDER = ['RECEBIDO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE'];
const STATUS_MAP = {
  RECEBIDO:   'step-recebido',
  PREPARANDO: 'step-preparando',
  ENVIADO:    'step-enviado',
  ENTREGUE:   'step-entregue',
};

function formatarMoeda(valor) {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}

function atualizarTimeline(statusAtual) {
  const indexAtual = STATUS_ORDER.indexOf(statusAtual?.toUpperCase());

  STATUS_ORDER.forEach((status, index) => {
    const stepId = STATUS_MAP[status];
    const el = document.getElementById(stepId);
    if (!el) return;

    el.classList.remove('completed', 'active', 'pending');

    if (index < indexAtual) {
      el.classList.add('completed');
    } else if (index === indexAtual) {
      el.classList.add('active');
    } else {
      el.classList.add('pending');
    }
  });
}

function renderizarItens(itens) {
  const lista = document.getElementById('lista-itens');
  if (!itens || itens.length === 0) {
    lista.innerHTML = '<p class="empty-msg">Nenhum item encontrado.</p>';
    return;
  }

  lista.innerHTML = itens.map(item => `
    <div class="item-row">
      <div class="item-info">
        <span class="item-qty">${item.quantidade}x</span>
        <span class="item-nome">${item.produto?.nome || item.nomeProduto || 'Produto'}</span>
      </div>
      <span class="item-preco">${formatarMoeda((item.precoUnitario || 0) * item.quantidade)}</span>
    </div>
  `).join('');
}

async function carregarPedido() {
  // Tenta pegar o pedido do localStorage (salvo no checkout)
  const pedidoSalvo = localStorage.getItem('pedidoAtual');

  if (pedidoSalvo) {
    const pedido = JSON.parse(pedidoSalvo);
    atualizarTimeline(pedido.status || 'RECEBIDO');
    renderizarItens(pedido.itens || []);
    document.getElementById('valor-total').textContent = formatarMoeda(pedido.valorTotal || 0);
    return;
  }

  // Se não houver no localStorage, busca o último pedido do usuário na API
  try {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
      document.getElementById('lista-itens').innerHTML = '<p class="empty-msg">Faça login para ver seu pedido.</p>';
      return;
    }

    const response = await fetch(CONFIG.url('pedidos') + '/usuario/' + usuarioLogado.id);
    if (!response.ok) throw new Error('Erro ao buscar pedido');

    const pedidos = await response.json();
    // Pega o pedido mais recente
    const pedido = Array.isArray(pedidos) ? pedidos[pedidos.length - 1] : pedidos;

    atualizarTimeline(pedido.status || 'RECEBIDO');
    renderizarItens(pedido.itens || []);
    document.getElementById('valor-total').textContent = formatarMoeda(pedido.valorTotal || 0);

  } catch (err) {
    console.error('Erro ao carregar pedido:', err);
    document.getElementById('lista-itens').innerHTML = '<p class="empty-msg">Não foi possível carregar o pedido.</p>';
  }
}

// Auto-refresh a cada 30 segundos
setInterval(async () => {
  const pedidoSalvo = localStorage.getItem('pedidoAtual');
  if (!pedidoSalvo) return;

  try {
    const pedido = JSON.parse(pedidoSalvo);
    const response = await fetch(CONFIG.url('pedidos') + '/' + pedido.id);
    if (!response.ok) return;

    const pedidoAtualizado = await response.json();
    atualizarTimeline(pedidoAtualizado.status);

    // Atualiza o pedido no localStorage com status mais recente
    localStorage.setItem('pedidoAtual', JSON.stringify(pedidoAtualizado));
  } catch (err) {
    console.error('Erro no polling:', err);
  }
}, 30000);

window.onload = carregarPedido;