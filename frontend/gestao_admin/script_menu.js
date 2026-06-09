const API_URL = CONFIG.url('produtos');
let idProdutoEmEdicao = null;
let fotoAtual = ''; // foto já existente do produto em edição (caso nenhuma nova seja enviada)

// Resolve o caminho da foto: URLs completas ficam como estão;
// caminhos relativos (/uploads/...) recebem o host da API.
function resolverFotoUrl(foto) {
    if (!foto) return 'https://via.placeholder.com/300x160?text=Sem+Foto';
    if (/^https?:\/\//i.test(foto)) return foto;
    if (foto.startsWith('/')) return CONFIG.API_URL + foto;
    return foto;
}

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
                        <img src="${resolverFotoUrl(p.foto)}"
                             alt="${p.nome || 'Produto do cardápio'}"
                             onerror="this.src='https://via.placeholder.com/300x160?text=Sem+Foto'">
                        <div class="card-content">
                            <h3>${p.nome || 'Sem Nome'}</h3>
                            <p>${p.descricao || ''}</p>
                            <div class="price">R$ ${precoNumerico.toFixed(2).replace('.', ',')}</div>

                            <div class="card-acoes">
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
    fotoAtual = foto || '';

    document.getElementById('nomeInput').value = nome;
    document.getElementById('descInput').value = descricao;
    document.getElementById('precoInput').value = preco;
    document.getElementById('catInput').value = categoriaId;

    // Limpa qualquer arquivo escolhido e mostra a foto atual no preview
    const fotoInput = document.getElementById('fotoInput');
    if (fotoInput) fotoInput.value = '';
    if (fotoAtual) {
        mostrarPreview(resolverFotoUrl(fotoAtual), 'Foto atual');
    } else {
        esconderPreview();
    }

    const btn = document.getElementById('btnSalvar');
    btn.innerText = "Atualizar";
    btn.style.background = "var(--orange)";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function cadastrarNoJava() {
    const nome = document.getElementById('nomeInput').value;
    const preco = document.getElementById('precoInput').value;
    const categoriaId = document.getElementById('catInput').value;

    if (!nome || !preco || !categoriaId) {
        showToast("Preencha Nome, Preço e Categoria!", 'warning');
        return;
    }

    const btn = document.getElementById('btnSalvar');
    const fotoInput = document.getElementById('fotoInput');
    const arquivo = fotoInput && fotoInput.files ? fotoInput.files[0] : null;

    // Define a foto: nova (upload) tem prioridade; senão mantém a atual em edição.
    let fotoUrl = fotoAtual || '';

    if (arquivo) {
        if (!arquivo.type.startsWith('image/')) {
            showToast("Selecione um arquivo de imagem válido.", 'warning');
            return;
        }
        try {
            btn.disabled = true;
            const textoOriginal = btn.innerText;
            btn.innerText = "Enviando foto…";
            fotoUrl = await uploadFoto(arquivo);
            btn.innerText = textoOriginal;
        } catch (e) {
            btn.disabled = false;
            showToast("Falha ao enviar a foto.", 'error');
            return;
        }
        btn.disabled = false;
    }

    const produtoObj = {
        nome: nome,
        descricao: document.getElementById('descInput').value,
        preco: parseFloat(preco.toString().replace(',', '.')),
        foto: fotoUrl,
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

// Envia o arquivo ao endpoint /upload/foto e devolve a URL completa da imagem.
async function uploadFoto(file) {
    const formData = new FormData();
    formData.append('file', file);

    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const token = usuario && usuario.token ? usuario.token : null;

    const res = await fetch(CONFIG.url('/upload/foto'), {
        method: 'POST',
        // Sem Content-Type manual: o navegador define o boundary do multipart.
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });

    if (!res.ok) throw new Error('Upload falhou: ' + res.status);
    const data = await res.json();
    return CONFIG.API_URL + data.url; // ex.: http://localhost:8080/uploads/arquivo.jpg
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
    fotoAtual = '';
    document.getElementById('nomeInput').value = '';
    document.getElementById('descInput').value = '';
    document.getElementById('precoInput').value = '';
    const fotoInput = document.getElementById('fotoInput');
    if (fotoInput) fotoInput.value = '';
    esconderPreview();
    document.getElementById('catInput').value = '';

    const btn = document.getElementById('btnSalvar');
    btn.innerText = "Salvar";
    btn.style.background = "var(--red)";
}

// --- Preview da foto ---
function mostrarPreview(src, texto) {
    const wrap = document.getElementById('fotoPreviewWrap');
    const img = document.getElementById('fotoPreview');
    const campo = document.getElementById('uploadField');
    const txt = document.getElementById('uploadText');
    if (img) img.src = src;
    if (wrap) wrap.style.display = 'block';
    if (campo) campo.classList.add('has-file');
    if (txt && texto) txt.textContent = texto;
}

function esconderPreview() {
    const wrap = document.getElementById('fotoPreviewWrap');
    const campo = document.getElementById('uploadField');
    const txt = document.getElementById('uploadText');
    if (wrap) wrap.style.display = 'none';
    if (campo) campo.classList.remove('has-file');
    if (txt) txt.textContent = 'Foto do produto';
}
async function carregarCategorias() {
    try {
        const res = await fetch(CONFIG.url('categorias'), {
            headers: CONFIG.getAuthHeaders()
        });
        if (!res.ok) return;

        const categorias = await res.json();
        const select = document.getElementById('catInput');

        // Mantém a opção placeholder e adiciona as categorias do banco
        select.innerHTML = '<option value="">Categoria...</option>';
        categorias.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.id} - ${cat.nome}</option>`;
        });
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.checkAdmin()) return;
    document.getElementById('nomeUsuario').textContent = getNomeUsuario();

    const fotoInput = document.getElementById('fotoInput');
    if (fotoInput) {
        fotoInput.addEventListener('change', () => {
            const arquivo = fotoInput.files && fotoInput.files[0];
            if (!arquivo) {
                if (fotoAtual) mostrarPreview(resolverFotoUrl(fotoAtual), 'Foto atual');
                else esconderPreview();
                return;
            }
            if (!arquivo.type.startsWith('image/')) {
                showToast("Selecione um arquivo de imagem.", 'warning');
                fotoInput.value = '';
                return;
            }
            mostrarPreview(URL.createObjectURL(arquivo), arquivo.name);
        });
    }

    const removerFoto = document.getElementById('removerFoto');
    if (removerFoto) {
        removerFoto.addEventListener('click', () => {
            if (fotoInput) fotoInput.value = '';
            fotoAtual = '';
            esconderPreview();
        });
    }

    carregarCategorias();
    listarProdutos();
});
