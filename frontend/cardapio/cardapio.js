/* ================================================================
   MR. JOHN SPORTBAR - SISTEMA DE CARDÁPIO E CARRINHO
   ================================================================
*/

const API_URL = 'http://localhost:8080/produtos';

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

    // ADICIONAR ITEM: Agora agrupa por ID
    adicionarItem(produto) {
        const itemExistente = this.carrinho.find(item => item.id === produto.id);

        if (itemExistente) {
            // Se já existe, apenas aumenta a quantidade
            itemExistente.quantidade = (itemExistente.quantidade || 1) + 1;
        } else {
            // Se não existe, adiciona o novo objeto com quantidade 1
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

    // REMOVER ITEM: Diminui a quantidade ou remove se chegar a zero
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
        // Multiplica preço por quantidade de cada item
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
            <div class="item-sidebar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 8px;">
                <div>
                    <strong style="display:block;">${item.quantidade}x ${item.nome}</strong>
                    <span style="color: #ff2b2b;">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button onclick="removerDoCarrinho(${item.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:1.2rem;">🗑️</button>
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
    console.log(`Adicionado: ${nome}`);
};

window.removerDoCarrinho = (id) => {
    service.removerItem(id);
};

window.atualizarBadge = () => {
    const badge = document.getElementById('qtd-itens');
    if (badge) {
        // Soma as quantidades individuais para mostrar o total real
        const totalProdutos = service.listarItens().reduce((acc, item) => acc + (item.quantidade || 1), 0);
        badge.innerText = totalProdutos;
    }
};

window.irParaCheckout = () => {
    if (service.listarItens().length === 0) {
        alert("Seu carrinho está vazio!");
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
                    <img src="${p.foto || 'https://via.placeholder.com/300'}" onerror="this.src='https://via.placeholder.com/300'">
                    <div class="card-content">
                        <h3>${p.nome || 'Sem Nome'}</h3>
                        <p>${p.descricao || ''}</p>
                        <div class="price">R$ ${preco.toFixed(2).replace('.', ',')}</div>
                        <button class="btn-adicionar" onclick="adicionarAoCarrinho(${p.id}, '${p.nome}', ${preco})">
                            Adicionar ao Carrinho 🛒
                        </button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

window.onload = () => {
    listarProdutos();
    window.atualizarBadge();
};