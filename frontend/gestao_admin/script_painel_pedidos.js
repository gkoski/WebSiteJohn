// ============================================================
// PAINEL DE PEDIDOS — Mr. John Sports Bar
// Lista, filtra e avança status dos pedidos.
// Faz fetch em CONFIG.url('pedidos'); se a API falhar, usa
// pedidos-mock pra a interface seguir visível em dev.
// ============================================================

const API_URL = (typeof CONFIG !== 'undefined') ? CONFIG.url('pedidos') : '/pedidos';

const STATUS_ORDER = ['RECEBIDO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE'];
const STATUS_LABEL = {
    RECEBIDO:   'Recebido',
    PREPARANDO: 'Preparando',
    ENVIADO:    'Enviado',
    ENTREGUE:   'Entregue',
    CANCELADO:  'Cancelado'
};
const STATUS_NEXT_LABEL = {
    RECEBIDO:   'Iniciar preparo',
    PREPARANDO: 'Marcar enviado',
    ENVIADO:    'Marcar entregue'
};

let pedidos = [];
let filtroAtual = '';
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

function proximoStatus(atual) {
    const i = STATUS_ORDER.indexOf(atual);
    return (i >= 0 && i < STATUS_ORDER.length - 1) ? STATUS_ORDER[i + 1] : null;
}

function isHoje(iso) {
    if (!iso) return false;
    const d = new Date(iso);
    const hoje = new Date();
    return d.toDateString() === hoje.toDateString();
}

function showToast(msg, tipo = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + tipo;
    setTimeout(() => el.classList.remove('show'), 2400);
}

// ------------------------------------------------------------
// Render
// ------------------------------------------------------------
function atualizarKPIs() {
    const hoje = pedidos.filter(p => isHoje(p.dataPedido));
    const preparo = pedidos.filter(p => p.status === 'PREPARANDO').length;
    const prontos = pedidos.filter(p => p.status === 'ENVIADO').length;
    const faturamento = hoje
        .filter(p => p.status !== 'CANCELADO')
        .reduce((acc, p) => acc + Number(p.valorTotal || 0), 0);

    document.getElementById('kpi-total').textContent = hoje.length;
    document.getElementById('kpi-preparo').textContent = preparo;
    document.getElementById('kpi-prontos').textContent = prontos;
    document.getElementById('kpi-faturamento').textContent = formatarMoeda(faturamento);
}

function pedidoMatchesFiltro(p) {
    if (filtroAtual && p.status !== filtroAtual) return false;
    if (buscaAtual) {
        const q = buscaAtual.toLowerCase();
        const nome = (p.usuario?.nome || '').toLowerCase();
        const idStr = String(p.id || '');
        if (!nome.includes(q) && !idStr.includes(q)) return false;
    }
    return true;
}

function renderPedidos() {
    const lista = document.getElementById('pedidosLista');
    const visiveis = pedidos.filter(pedidoMatchesFiltro);

    if (visiveis.length === 0) {
        lista.innerHTML = '<p class="empty-msg">Nenhum pedido encontrado.</p>';
        return;
    }

    lista.innerHTML = visiveis.map(p => {
        const status = (p.status || 'RECEBIDO').toUpperCase();
        const proximo = proximoStatus(status);
        const podeCancelar = status !== 'ENTREGUE' && status !== 'CANCELADO';
        const itensHtml = (p.itens || []).map(it => {
            const nome = it.produto?.nome || it.nomeProduto || it.nome || 'Produto';
            const preco = (it.precoUnitario || it.preco || 0) * (it.quantidade || 1);
            return `
                <li>
                    <span class="qtd-badge">${it.quantidade}x</span>
                    <span class="item-nome">${nome}</span>
                    <span class="item-preco">${formatarMoeda(preco)}</span>
                </li>
            `;
        }).join('');

        return `
            <article class="card-pedido" data-id="${p.id}">
                <div class="pedido-header">
                    <div class="pedido-id">Pedido <span>#${String(p.id).padStart(4, '0')}</span></div>
                    <span class="status-badge ${status.toLowerCase()}">${statusLabel(status)}</span>
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
                <div class="pedido-acoes">
                    <button class="btn-acao btn-avancar"
                            ${proximo ? '' : 'disabled'}
                            onclick="avancarStatus(${p.id})">
                        ${proximo ? (STATUS_NEXT_LABEL[status] || 'Avançar') : 'Finalizado'}
                    </button>
                    <button class="btn-acao btn-cancelar"
                            ${podeCancelar ? '' : 'disabled'}
                            onclick="cancelarPedido(${p.id})">
                        ${podeCancelar ? 'Cancelar' : '—'}
                    </button>
                </div>
                <div class="pedido-hora" style="padding: 8px 16px 14px; text-align:right;">
                    ${formatarHora(p.dataPedido)}
                </div>
            </article>
        `;
    }).join('');
}

function renderTudo() {
    atualizarKPIs();
    renderPedidos();
}

// ------------------------------------------------------------
// API
// ------------------------------------------------------------
async function listarPedidos() {
    const lista = document.getElementById('pedidosLista');
    lista.innerHTML = '<p class="empty-msg">Atualizando…</p>';

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

async function avancarStatus(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;

    const proximo = proximoStatus((pedido.status || '').toUpperCase());
    if (!proximo) return;

    const original = pedido.status;
    pedido.status = proximo; // otimista
    renderTudo();

    try {
        const res = await fetch(`${CONFIG.API_URL}/pedidos/${id}/status`, {
            method: 'PATCH',
            headers: CONFIG.getAuthHeaders(),
            body: JSON.stringify({ novoStatus: proximo })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast(`Pedido #${id} → ${statusLabel(proximo)}`, 'success');
    } catch (err) {
        // mock-mode: mantém a alteração só localmente
        showToast(`Pedido #${id} → ${statusLabel(proximo)} (offline)`, '');
    }
}

async function cancelarPedido(id) {
    if (!confirm(`Cancelar o pedido #${id}?`)) return;

    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;

    pedido.status = 'CANCELADO';
    renderTudo();

    try {
        const res = await fetch(`${CONFIG.API_URL}/pedidos/${id}/status`, {
            method: 'PATCH',
            headers: CONFIG.getAuthHeaders(),
            body: JSON.stringify({ novoStatus: 'CANCELADO' })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast(`Pedido #${id} cancelado`, 'error');
    } catch (err) {
        showToast(`Pedido #${id} cancelado (offline)`, '');
    }
}

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------
function inicializarEventos() {
    const grupo = document.getElementById('filtroStatus');
    grupo.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        grupo.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        filtroAtual = btn.dataset.status || '';
        renderPedidos();
    });

    const busca = document.getElementById('buscaInput');
    busca.addEventListener('input', (e) => {
        buscaAtual = e.target.value.trim();
        renderPedidos();
    });
}

// ------------------------------------------------------------
// Bootstrap
// ------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.checkAdmin()) return;
    inicializarEventos();
    listarPedidos();
});
