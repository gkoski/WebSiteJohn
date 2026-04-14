const API_URL = 'http://localhost:8080/produtos';
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

async function listarProdutos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) return;

        const produtos = await response.json();
        const lista = document.getElementById('menuLista');
        lista.innerHTML = '';

        if (Array.isArray(produtos)) {
            produtos.forEach(p => {
                const precoNumerico = typeof p.preco === 'number' ? p.preco : 0;
                
                lista.innerHTML += `
                    <div class="card">
                        <img src="${p.foto || 'https://via.placeholder.com/300'}" 
                             onerror="this.src='https://via.placeholder.com/300'">
                        <div class="card-content">
                            <h3>${p.nome || 'Sem Nome'}</h3>
                            <p>${p.descricao || ''}</p>
                            <div class="price">R$ ${precoNumerico.toFixed(2).replace('.', ',')}</div>
                            
                            <button class="btn-adicionar" onclick="adicionarAoCarrinho(${p.id}, '${p.nome}', ${p.preco})">
                                Adicionar ao Carrinho 🛒
                            </button>
                        </div>
                    </div>`;
            });
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}

function adicionarAoCarrinho(id, nome, preco) {
    // Adiciona o objeto do produto ao array do carrinho
    carrinho.push({ id, nome, preco });
    
    // Salva no LocalStorage para a próxima página (Checkout)
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    atualizarInterface();
}

function atualizarInterface() {
    const contador = document.getElementById('qtd-itens');
    if(contador) contador.innerText = carrinho.length;
}

function irParaCheckout() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    window.location.href = "checkout.html";
}

// Inicialização
window.onload = () => {
    listarProdutos();
    atualizarInterface();
};