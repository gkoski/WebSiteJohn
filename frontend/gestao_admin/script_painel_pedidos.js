// ============================================================
// PAINEL DE PEDIDOS — Mr. John Sports Bar
// Kanban com colunas por status. Arraste o card de um pedido
// entre as colunas (HTML5 Drag and Drop API) para mudar o status.
// Faz fetch em CONFIG.url('pedidos'); se a API falhar, usa
// pedidos-mock pra a interface seguir visível em dev.
// ============================================================

const API_URL = (typeof CONFIG !== 'undefined') ? CONFIG.url('pedidos') : '/pedidos';

// Colunas do kanban (ordem da esquerda para a direita)
const STATUS_COLUMNS = ['RECEBIDO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

const STATUS_LABEL = {
    RECEBIDO:   'Recebido',
    PREPARANDO: 'Preparando',
    ENVIADO:    'Enviado',
    ENTREGUE:   'Entregue',
    CANCELADO:  'Cancelado'
};

let pedidos = [];
let buscaAtual = '';

// ------------------------------------------------------------
// Mock de fallback (caso a API não responda)
// ------------------------------------------------------------
const PEDIDOS_MOCK = [
    {
        id: 1042,
        dataPedido: new Date(Date.now() - 12 * 60000).toISOString(),
        valorTotal: 87.40,
        status: 'RECEBIDO',
        usuario: { nome: 'João Silva', email: 'joao@example.com' },
        itens: [
            { quantidade: 2, precoUnitario: 28.90, produto: { nome: "John's Cheese Burger" } },
            { quantidade: 1, precoUnitario: 29.60, produto: { nome: 'Porção de Onion Rings' } }
        ]
    },
    {
        id: 1041,
        dataPedido: new Date(Date.now() - 35 * 60000).toISOString(),
        valorTotal: 54.80,
        status: 'PREPARANDO',
        usuario: { nome: 'Marina Costa', email: 'marina@example.com' },
        itens: [
            { quantidade: 1, precoUnitario: 32.90, produto: { nome: 'Double Bacon Burger' } },
            { quantidade: 2, precoUnitario: 10.95, produto: { nome: 'Coca-Cola 350ml' } }
        ]
    },
    {
        id: 1040,
        dataPedido: new Date(Date.now() - 62 * 60000).toISOString(),
        valorTotal: 41.50,
        status: 'ENVIADO',
        usuario: { nome: 'Pedro Almeida', email: 'pedro@example.com' },
        itens: [
            { quantidade: 1, precoUnitario: 26.90, produto: { nome: 'Veggie Burger' } },
            { quantidade: 1, precoUnitario: 14.60, produto: { nome: 'Batata Rústica' } }
        ]
    },
    {
        id: 1039,
        dataPedido: new Date(Date.now() - 130 * 60000).toISOString(),
        valorTotal: 118.20,
        status: 'ENTREGUE',
        usuario: { nome: 'Ana Pereira', email: 'ana@example.com' },
        itens: [
            { quantidade: 3, precoUnitario: 28.90, produto: { nome: "John's Cheese Burger" } },
            { quantidade: 1, precoUnitario: 31.50, produto: { nome: 'Combo Família' } }
        ]
    },
    {
        id: 1038,
        dataPedido: new Date(Date.now() - 180 * 60000).toISOString(),
        valorTotal: 22.90,
        status: 'CANCELADO',
        usuario: { nome: 'Lucas Martins', email: 'lucas@example.com' },
        itens: [
            { quantidade: 1, precoUnitario: 22.90, produto: { nome: 'Coca-Cola Family' } }
        ]
    }
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function formatarMoeda(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',');
}

function formatarHora(iso) {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function statusLabel(status) {
    return STATUS_LABEL[status] || status;
}

function isHoje(iso) {
    if (!iso) return false;
    const d = new Date(iso);
    const hoje = new Date();
    return d.toDateString() === hoje.toDateString();
}

function pedidoMatchesBusca(p) {
    if (!buscaAtual) return true;
    const q = buscaAtual.toLowerCase();
    const nome = (p.usuario?.nome || '').toLowerCase();
    const idStr = String(p.id || '');
    return nome.includes(q) || idStr.includes(q);
}

// showToast vem de shared.js

// ------------------------------------------------------------
// Render — KPIs
// ------------------------------------------------------------
function atualizarKPIs() {
    const hoje = pedidos.filter(p => isHoje(p.dataPedido));
    const preparo = pedidos.filter(p => p.status === 'PREPARANDO').length;
    const prontos = pedidos.filter(p => p.status === 'ENVIADO').length;

    const elTotal = document.getElementById('kpi-total');
    const elPreparo = document.getElementById('kpi-preparo');
    const elProntos = document.getElementById('kpi-prontos');
    if (elTotal)   elTotal.textContent = hoje.length;
    if (elPreparo) elPreparo.textContent = preparo;
    if (elProntos) elProntos.textContent = prontos;
}

// ------------------------------------------------------------
// Render — Kanban
// ------------------------------------------------------------
function cardPedidoHTML(p) {
    const status = (p.status || 'RECEBIDO').toUpperCase();
    const itensHtml = (p.itens || []).map(it => {
        const nome = it.produto?.nome || it.nomeProduto || it.nome || 'Produto';
        const preco = (it.precoUnitario || it.preco || 0) * (it.quantidade || 1);
        return `
            <li>
                <span class="qtd-badge">${it.quantidade}x</span>
                <span class="item-nome">${nome}</span>
                <span class="item-preco">${formatarMoeda(preco)}</span>
            </li>`;
    }).join('');

    return `
        <article class="card-pedido" data-id="${p.id}" draggable="true">
            <div class="pedido-header">
                <div class="pedido-id">Pedido <span>#${String(p.id).padStart(4, '0')}</span></div>
                <span class="drag-handle" title="Arraste para mover">⠿</span>
            </div>
            <div class="pedido-body">
                <div class="cliente-info">
                    <span class="cliente-nome">${p.usuario?.nome || 'Cliente'}</span>
                    <span class="cliente-email">${p.usuario?.email || ''}</span>
                </div>
                <ul class="itens">${itensHtml}</ul>
            </div>
            <div class="pedido-total">
                <span class="label">Total</span>
                <span class="valor">${formatarMoeda(p.valorTotal)}</span>
            </div>
            <div class="pedido-hora" style="padding: 8px 16px 14px; text-align:right;">
                ${formatarHora(p.dataPedido)}
            </div>
        </article>`;
}

function renderKanban() {
    const board = document.getElementById('kanbanBoard');
    if (!board) return;

    const visiveis = pedidos.filter(pedidoMatchesBusca);

    board.innerHTML = STATUS_COLUMNS.map(status => {
        const doStatus = visiveis.filter(p => (p.status || 'RECEBIDO').toUpperCase() === status);
        const cards = doStatus.length
            ? doStatus.map(cardPedidoHTML).join('')
            : '<div class="kanban-empty">Solte pedidos aqui</div>';

        return `
            <div class="kanban-col" data-status="${status}">
                <div class="kanban-col-head">
                    <span class="kanban-col-title">${statusLabel(status)}</span>
                    <span class="kanban-col-count">${doStatus.length}</span>
                </div>
                <div class="kanban-col-body" data-status="${status}">
                    ${cards}
                </div>
            </div>`;
    }).join('');

    ativarDragAndDrop();
}

function renderTudo() {
    atualizarKPIs();
    renderKanban();
}

// ------------------------------------------------------------
// Drag and Drop (HTML5)
// ------------------------------------------------------------
let pedidoArrastadoId = null;

function ativarDragAndDrop() {
    const cards = document.querySelectorAll('.card-pedido[draggable="true"]');
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            pedidoArrastadoId = Number(card.dataset.id);
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.id);
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            pedidoArrastadoId = null;
            document.querySelectorAll('.kanban-col, .kanban-col-body')
                .forEach(el => el.classList.remove('drag-over'));
        });
    });

    const colunas = document.querySelectorAll('.kanban-col');
    colunas.forEach(col => {
        const body = col.querySelector('.kanban-col-body');

        col.addEventListener('dragover', (e) => {
            e.preventDefault(); // necessário para permitir o drop
            e.dataTransfer.dropEffect = 'move';
            col.classList.add('drag-over');
            if (body) body.classList.add('drag-over');
        });

        col.addEventListener('dragleave', (e) => {
            // só remove o realce se realmente saiu da coluna
            if (!col.contains(e.relatedTarget)) {
                col.classList.remove('drag-over');
                if (body) body.classList.remove('drag-over');
            }
        });

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            if (body) body.classList.remove('drag-over');

            const novoStatus = col.dataset.status;
            const id = pedidoArrastadoId || Number(e.dataTransfer.getData('text/plain'));
            if (id && novoStatus) {
                mudarStatus(id, novoStatus);
            }
        });
    });
}

// ------------------------------------------------------------
// API
// ------------------------------------------------------------
async function listarPedidos() {
    const board = document.getElementById('kanbanBoard');
    if (board) board.innerHTML = '<p class="empty-msg">Atualizando…</p>';

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        pedidos = Array.isArray(data) ? data : [];
        renderTudo();
        showToast('Pedidos atualizados', 'success');
    } catch (err) {
        console.warn('[Painel] API indisponível, usando dados de exemplo:', err.message);
        pedidos = PEDIDOS_MOCK;
        renderTudo();
        showToast('API offline — exibindo dados de exemplo', 'error');
    }
}

// Muda o status de um pedido (usado pelo drag and drop).
async function mudarStatus(id, novoStatus) {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;

    const atual = (pedido.status || '').toUpperCase();
    if (atual === novoStatus) return; // soltou na mesma coluna

    pedido.status = novoStatus; // atualização otimista
    renderTudo();

    try {
        const res = await fetch(`${CONFIG.API_URL}/pedidos/${id}/status`, {
            method: 'PATCH',
            headers: CONFIG.getAuthHeaders(),
            body: JSON.stringify({ novoStatus: novoStatus })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast(`Pedido #${id} → ${statusLabel(novoStatus)}`, 'success');
    } catch (err) {
        // mock-mode: mantém a alteração só localmente
        showToast(`Pedido #${id} → ${statusLabel(novoStatus)} (offline)`, '');
    }
}

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------
function inicializarEventos() {
    const busca = document.getElementById('buscaInput');
    if (busca) {
        busca.addEventListener('input', (e) => {
            buscaAtual = e.target.value.trim();
            renderKanban();
        });
    }
}

// ------------------------------------------------------------
// Bootstrap
// ------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.checkAdmin()) return;
    document.getElementById('nomeUsuario').textContent = getNomeUsuario();
    inicializarEventos();
    listarPedidos();
});
