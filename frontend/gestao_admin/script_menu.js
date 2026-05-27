const API_URL = CONFIG.url('produtos');
let idProdutoEmEdicao = null;

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
                const catId = p.categoria ? p.categoria.id : '';

                lista.innerHTML += `
                    <div class="card">
                        <img src="${p.foto || 'https://via.placeholder.com/300x160?text=Sem+Foto'}"
                             alt="${p.nome || 'Produto do cardápio'}"
                             onerror="this.src='https://via.placeholder.com/300x160?text=Sem+Foto'">
                        <div class="card-content">
                            <h3>${p.nome || 'Sem Nome'}</h3>
                            <p>${p.descricao || ''}</p>
                            <div class="price">R$ ${precoNumerico.toFixed(2).replace('.', ',')}</div>

                            <div style="display: flex; gap: 5px; margin-top: 10px;">
                                <button class="btn-editar" onclick="prepararEdicao(${p.id}, '${(p.nome || '').replace(/'/g, "\\'")}', '${(p.descricao || '').replace(/'/g, "\\'")}', ${p.preco}, '${p.foto || ''}', ${catId})">
                                    Editar
                                </button>
                                <button class="btn-excluir" onclick="deletarDoBanco(${p.id})">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>`;
            });
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
        showToast("Erro ao carregar produtos.", 'error');
    }
}

function prepararEdicao(id, nome, descricao, preco, foto, categoriaId) {
    idProdutoEmEdicao = id;

    document.getElementById('nomeInput').value = nome;
    document.getElementById('descInput').value = descricao;
    document.getElementById('precoInput').value = preco;
    document.getElementById('fotoInput').value = foto;
    document.getElementById('catInput').value = categoriaId;

    const btn = document.getElementById('btnSalvar');
    btn.innerText = "Atualizar";
    btn.style.background = "var(--blue)";
}

async function cadastrarNoJava() {
    const nome = document.getElementById('nomeInput').value;
    const preco = document.getElementById('precoInput').value;
    const categoriaId = document.getElementById('catInput').value;

    if (!nome || !preco || !categoriaId) {
        showToast("Preencha Nome, Preço e Categoria!", 'warning');
        return;
    }

    const produtoObj = {
        nome: nome,
        descricao: document.getElementById('descInput').value,
        preco: parseFloat(preco.toString().replace(',', '.')),
        foto: document.getElementById('fotoInput').value,
        categoria: { id: parseInt(categoriaId) }
    };

    if (idProdutoEmEdicao) produtoObj.id = idProdutoEmEdicao;
    const metodo = idProdutoEmEdicao ? 'PUT' : 'POST';

    try {
        const res = await fetch(API_URL, {
            method: metodo,
            headers: CONFIG.getAuthHeaders(),
            body: JSON.stringify(produtoObj)
        });

        if (res.ok) {
            showToast(idProdutoEmEdicao ? "Produto atualizado!" : "Produto salvo!", 'success');
            cancelarEdicao();
            listarProdutos();
        } else {
            showToast("Erro na operação com o banco.", 'error');
        }
    } catch (error) {
        showToast("Erro de conexão.", 'error');
    }
}

async function deletarDoBanco(id) {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: CONFIG.getAuthHeaders()
        });
        showToast("Produto excluído.", 'success');
        listarProdutos();
    } catch (error) {
        showToast("Erro ao excluir produto.", 'error');
    }
}

function cancelarEdicao() {
    idProdutoEmEdicao = null;
    document.getElementById('nomeInput').value = '';
    document.getElementById('descInput').value = '';
    document.getElementById('precoInput').value = '';
    document.getElementById('fotoInput').value = '';
    document.getElementById('catInput').value = '';

    const btn = document.getElementById('btnSalvar');
    btn.innerText = "Salvar";
    btn.style.background = "var(--red)";
}

document.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.checkAdmin()) return;
    document.getElementById('nomeUsuario').textContent = getNomeUsuario();
    listarProdutos();
});
