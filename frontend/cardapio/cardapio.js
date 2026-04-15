const API_URL = 'http://localhost:8080/produtos';

/* === CLASSE DE SERVIÇO (Gabriel - SCRUM 54 e 55) === */
class CarrinhoService {
    constructor() {
        this.carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    }

    adicionarItem(item) {
        this.carrinho.push(item);
        this.salvarNoStorage();
    }

    removerItem(id) {
        const index = this.carrinho.findIndex(item => item.id === id);
        if (index > -1) {
            this.carrinho.splice(index, 1);
            this.salvarNoStorage();
        }
    }

    calcularTotal() {
        return this.carrinho.reduce((total, item) => total + item.preco, 0);
    }

    listarItens() { return this.carrinho; }
    salvarNoStorage() { localStorage.setItem('carrinho', JSON.stringify(this.carrinho)); }
}

const service = new CarrinhoService();

/* === INTERFACE E ABA LATERAL === */

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
    const itens = service.listarItens();

    if (!container) return;
    container.innerHTML = '';
    
    itens.forEach((item) => {
        container.innerHTML += `
            <div class="item-sidebar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 8px;">
                <div>
                    <strong style="display:block; color: #fff;">${item.nome}</strong>
                    <span style="color: #ffc107;">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <button onclick="removerDoCarrinho(${item.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size: 1.2rem;">🗑️</button>
            </div>
        `;
    });

    if (totalElement) {
        totalElement.innerText = `Total: R$ ${service.calcularTotal().toFixed(2).replace('.', ',')}`;
    }
    window.atualizarBadge();
};

/* === FUNÇÕES DE AÇÃO === */

window.adicionarAoCarrinho = (id, nome, preco) => {
    service.adicionarItem({ id, nome, preco });
    window.atualizarBadge();
    // Opcional: abrir a aba automaticamente ao adicionar
    // window.toggleCarrinho(); 
};

window.removerDoCarrinho = (id) => {
    service.removerItem(id);
    window.renderizarCarrinhoLateral();
    window.atualizarBadge();
};

window.atualizarBadge = () => {
    const badge = document.getElementById('qtd-itens');
    if (badge) badge.innerText = service.listarItens().length;
};

// ESSA É A FUNÇÃO QUE FALTAVA PARA O FINALIZAR FUNCIONAR
window.irParaCheckout = () => {
    if (service.listarItens().length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    window.location.href = "checkout.html";
};

/* === LISTAGEM DO BANCO === */
async function listarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        const lista = document.getElementById('menuLista');
        if (!lista) return;
        lista.innerHTML = '';

        produtos.forEach(p => {
            lista.innerHTML += `
                <div class="card">
                    <img src="${p.foto || 'https://via.placeholder.com/300'}" onerror="this.src='https://via.placeholder.com/300'">
                    <div class="card-content">
                        <h3>${p.nome}</h3>
                        <p>${p.descricao || ''}</p>
                        <div class="price">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
                        <button class="btn-adicionar" onclick="adicionarAoCarrinho(${p.id}, '${p.nome}', ${p.preco})">
                            Adicionar ao Carrinho 🛒
                        </button>
                    </div>
                </div>`;
        });
    } catch (e) { console.error("Erro na API:", e); }
}

window.onload = () => {
    listarProdutos();
    window.atualizarBadge();
};