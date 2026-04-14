const API_URL = 'http://localhost:8080/produtos';
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
                        <img src="${p.foto || 'https://via.placeholder.com/300'}" 
                             onerror="this.src='https://via.placeholder.com/300'">
                        <div class="card-content">
                            <h3>${p.nome || 'Sem Nome'}</h3>
                            <p>${p.descricao || ''}</p>
                            <div class="price">R$ ${precoNumerico.toFixed(2).replace('.', ',')}</div>
                            
                            <div style="display: flex; gap: 5px; margin-top: 10px;">
                                <button class="btn-editar" onclick="prepararEdicao(${p.id}, '${p.nome}', '${p.descricao}', ${p.preco}, '${p.foto}', ${catId})">
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
    btn.style.background = "#2196F3"; // Azul para edição
}


async function cadastrarNoJava() {
    const nome = document.getElementById('nomeInput').value;
    const preco = document.getElementById('precoInput').value;
    const categoriaId = document.getElementById('catInput').value;

    if(!nome || !preco || !categoriaId) return alert("Preencha Nome, Preço e Categoria!");

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoObj)
        });

        if(res.ok) {
            alert(idProdutoEmEdicao ? "Produto atualizado!" : "Produto salvo!");
            cancelarEdicao(); 
            listarProdutos(); 
        } else {
            alert("Erro na operação com o banco.");
        }
    } catch (error) {
        alert("Erro de conexão.");
    }
}

async function deletarDoBanco(id) {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        listarProdutos();
    } catch (error) {
        alert("Erro ao deletar.");
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
    btn.innerText = "Salvar no Banco";
    btn.style.background = "#ff0000"; // Volta para vermelho
}

window.onload = listarProdutos;