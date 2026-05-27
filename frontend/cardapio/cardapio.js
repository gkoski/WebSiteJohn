/* ================================================================
   MR. JOHN SPORTBAR - SISTEMA DE CARDÁPIO E CARRINHO
   ================================================================ */

const API_URL = CONFIG.url('produtos');

class CarrinhoService {
    constructor() {
        this.key = 'carrinho';
        try {
            const dadosSalvos = localStorage.getItem(this.key);
            this.carrinho = dadosSalvos ? JSON.parse(dadosSalvos) : [];
        } catch (e) {
            this.carrinho = [];
        }
    }

    salvarCarrinho() {
        localStorage.setItem(this.key, JSON.stringify(this.carrinho));
    }

    adicionarItem(produto) {
        const itemExistente = this.carrinho.find(item => item.id === produto.id);

        if (itemExistente) {
            itemExistente.quantidade = (itemExistente.quantidade || 1) + 1;
        } else {
            this.carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1
            });
        }

        this.salvarCarrinho();
        this.atualizarTudo();
    }

    removerItem(id) {
        const index = this.carrinho.findIndex(item => item.id === id);
        if (index > -1) {
            if (this.carrinho[index].quantidade > 1) {
                this.carrinho[index].quantidade -= 1;
            } else {
                this.carrinho.splice(index, 1);
            }
            this.salvarCarrinho();
        }
        this.atualizarTudo();
    }

    listarItens() {
        return this.carrinho;
    }

    calcularTotal() {
        return this.carrinho.reduce((total, item) => total + (item.preco * (item.quantidade || 1)), 0);
    }

    atualizarTudo() {
        window.atualizarBadge();
        if (typeof window.renderizarCarrinhoLateral === 'function') {
            window.renderizarCarrinhoLateral();
        }
    }
}

const service = new CarrinhoService();

/* === INTERFACE E SIDEBAR === */

window.toggleCarrinho = () => {
    const sidebar = document.getElementById('carrinhoLateral');
    if (sidebar) {
        sidebar.classList.toggle('active');
        window.renderizarCarrinhoLateral();
    }
};

window.renderizarCarrinhoLateral = () => {
    const container = document.getElementById('itensCarrinhoLateral');
    const totalElement = document.getElementById('totalCarrinho');
    if (!container) return;

    const itens = service.listarItens();
    container.innerHTML = '';

    itens.forEach((item) => {
        const subtotal = item.preco * (item.quantidade || 1);

        container.innerHTML += `
            <div class="item-sidebar">
                <div>
                    <strong style="display:block;">${item.quantidade}x ${item.nome}</strong>
                    <span style="color: var(--orange);">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div>
                    <button onclick="removerDoCarrinho(${item.id})" style="background:none; border:none; color:var(--red-bright); cursor:pointer; font-size:1.2rem;">🗑️</button>
                </div>
            </div>`;
    });

    if (totalElement) {
        totalElement.innerText = `Total: R$ ${service.calcularTotal().toFixed(2).replace('.', ',')}`;
    }
    window.atualizarBadge();
};

/* === FUNÇÕES DE AÇÃO (GLOBAIS) === */

window.adicionarAoCarrinho = (id, nome, preco) => {
    service.adicionarItem({ id, nome, preco });
    showToast(`${nome} adicionado ao carrinho!`, 'success', 1500);
};

window.removerDoCarrinho = (id) => {
    service.removerItem(id);
};

window.atualizarBadge = () => {
    const badge = document.getElementById('qtd-itens');
    if (badge) {
        const totalProdutos = service.listarItens().reduce((acc, item) => acc + (item.quantidade || 1), 0);
        badge.innerText = totalProdutos;
    }
};

window.irParaCheckout = () => {
    if (service.listarItens().length === 0) {
        showToast("Seu carrinho está vazio!", 'warning');
        return;
    }
    window.location.href = "../checkout/checkout.html";
};

/* === BUSCA DE PRODUTOS DA API === */
async function listarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        const lista = document.getElementById('menuLista');
        if (!lista) return;

        lista.innerHTML = '';
        produtos.forEach(p => {
            const preco = typeof p.preco === 'number' ? p.preco : 0;
            lista.innerHTML += `
                <div class="card">
                    <img src="${p.foto || 'https://via.placeholder.com/300x180?text=Sem+Foto'}"
                         alt="${p.nome || 'Produto do cardápio'}"
                         onerror="this.src='https://via.placeholder.com/300x180?text=Sem+Foto'">
                    <div class="card-content">
                        <h3>${p.nome || 'Sem Nome'}</h3>
                        <p>${p.descricao || ''}</p>
                        <div class="price">R$ ${preco.toFixed(2).replace('.', ',')}</div>
                        <button class="btn-adicionar" onclick="adicionarAoCarrinho(${p.id}, '${(p.nome || '').replace(/'/g, "\\'")}', ${preco})">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        showToast("Não foi possível carregar o cardápio.", 'error');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.checkAuth()) return;
    document.getElementById('nomeUsuario').textContent = getNomeUsuario();
    listarProdutos();
    window.atualizarBadge();
});
