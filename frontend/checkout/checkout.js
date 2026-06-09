const API_URL = CONFIG.url('pedidos');

let subtotalGeral = 0;
let freteAtual = null;      // valor do frete (number) ou null se não calculado
let bairroValido = false;   // true só quando o bairro é atendido

document.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.checkAuth()) return;
    carregarResumo();
    inicializarCep();
});

/* ================================================================
   RESUMO DOS ITENS
   ================================================================ */
function carregarResumo() {
    const listaElement = document.getElementById("lista-itens");
    const dadosSalvos = localStorage.getItem('carrinho');
    const itensBrutos = dadosSalvos ? JSON.parse(dadosSalvos) : [];

    if (itensBrutos.length === 0) {
        listaElement.innerHTML = "<p class='carrinho-vazio-msg'>Seu carrinho está vazio!</p>";
        atualizarTotais();
        return;
    }

    const itensAgrupados = itensBrutos.reduce((acc, item) => {
        const encontrado = acc.find(i => i.id === item.id);
        if (encontrado) {
            encontrado.quantidade = (encontrado.quantidade || 1) + (item.quantidade || 1);
        } else {
            acc.push({ ...item, quantidade: item.quantidade || 1 });
        }
        return acc;
    }, []);

    listaElement.innerHTML = "";
    subtotalGeral = 0;

    itensAgrupados.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        subtotalGeral += subtotal;

        const div = document.createElement("div");
        div.className = "item-resumo";
        div.innerHTML = `
            <span>${item.quantidade}x ${item.nome}</span>
            <span class="item-valor">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        `;
        listaElement.appendChild(div);
    });

    atualizarTotais();
}

/* ================================================================
   CEP + VIACEP
   ================================================================ */
function inicializarCep() {
    const cepInput = document.getElementById('cep');

    cepInput.addEventListener('input', () => {
        // Máscara simples 00000-000
        let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
        cepInput.value = v;
    });

    cepInput.addEventListener('blur', buscarCep);
}

async function buscarCep() {
    const cepInput = document.getElementById('cep');
    const status = document.getElementById('cepStatus');
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        status.className = 'cep-status erro';
        status.textContent = 'CEP deve ter 8 dígitos.';
        return;
    }

    status.className = 'cep-status carregando';
    status.textContent = 'Buscando endereço...';

    try {
        const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resp.json();

        if (dados.erro) {
            status.className = 'cep-status erro';
            status.textContent = 'CEP não encontrado.';
            return;
        }

        document.getElementById('rua').value = dados.logradouro || '';
        document.getElementById('bairro').value = dados.bairro || '';

        status.className = 'cep-status ok';
        status.textContent = 'Endereço encontrado!';

        // Com o bairro em mãos, calcula o frete
        calcularFrete(dados.bairro || '');
    } catch (e) {
        status.className = 'cep-status erro';
        status.textContent = 'Erro ao buscar o CEP.';
    }
}

/* ================================================================
   FRETE (consulta o backend pelo bairro)
   ================================================================ */
// Remove acentos pra casar com a tabela do banco
function semAcento(texto) {
    return (texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

async function calcularFrete(bairro) {
    const aviso = document.getElementById('avisoEntrega');

    if (!bairro) {
        freteAtual = null;
        bairroValido = false;
        aviso.style.display = 'none';
        atualizarTotais();
        return;
    }

    const bairroBusca = semAcento(bairro);

    try {
        const resp = await fetch(CONFIG.API_URL + '/entrega/' + encodeURIComponent(bairroBusca), {
            headers: CONFIG.getAuthHeaders()
        });

        if (resp.ok) {
            const dados = await resp.json();
            freteAtual = Number(dados.valorEntrega);
            bairroValido = true;

            aviso.className = 'aviso-entrega ok';
            aviso.style.display = 'block';
            aviso.textContent = `Entregamos no ${dados.bairro}! Frete: R$ ${freteAtual.toFixed(2).replace('.', ',')}`;
        } else {
            // 404 = bairro não atendido
            freteAtual = null;
            bairroValido = false;

            aviso.className = 'aviso-entrega erro';
            aviso.style.display = 'block';
            aviso.textContent = 'Infelizmente ainda não entregamos no seu bairro.';
        }
    } catch (e) {
        freteAtual = null;
        bairroValido = false;
        aviso.className = 'aviso-entrega erro';
        aviso.style.display = 'block';
        aviso.textContent = 'Não foi possível calcular o frete. Tente novamente.';
    }

    atualizarTotais();
}

/* ================================================================
   TOTAIS + ESTADO DO BOTÃO
   ================================================================ */
function atualizarTotais() {
    const subtotalEl = document.getElementById('subtotal');
    const freteEl = document.getElementById('frete');
    const totalEl = document.getElementById('total');
    const btn = document.getElementById('btnConfirmar');

    subtotalEl.textContent = `R$ ${subtotalGeral.toFixed(2).replace('.', ',')}`;

    if (freteAtual !== null) {
        freteEl.textContent = `R$ ${freteAtual.toFixed(2).replace('.', ',')}`;
    } else {
        freteEl.textContent = '—';
    }

    const total = subtotalGeral + (freteAtual || 0);
    totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    // Botão só libera com carrinho cheio E bairro atendido
    const temItens = subtotalGeral > 0;
    btn.disabled = !(temItens && bairroValido);
}

/* ================================================================
   FINALIZAR PEDIDO
   ================================================================ */
async function finalizarPedido() {
    const numero = document.getElementById("numero").value;
    const rua = document.getElementById("rua").value;
    const bairro = document.getElementById("bairro").value;
    const complemento = document.getElementById("complemento").value;

    if (!rua || !bairro) {
        showToast("Informe o CEP para preencher o endereço!", 'warning');
        return;
    }
    if (!numero) {
        showToast("Informe o número do endereço!", 'warning');
        return;
    }
    if (!bairroValido) {
        showToast("Não entregamos no bairro informado.", 'error');
        return;
    }

    const dadosSalvos = JSON.parse(localStorage.getItem('carrinho')) || [];
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) {
        showToast("Você precisa estar logado para finalizar o pedido!", 'error');
        setTimeout(() => { window.location.href = "../login/login.html"; }, 1000);
        return;
    }

    const itensParaEnviar = dadosSalvos.reduce((acc, item) => {
        const encontrado = acc.find(i => i.produtoId === item.id);
        if (encontrado) {
            encontrado.quantidade += (item.quantidade || 1);
        } else {
            acc.push({ produtoId: item.id, quantidade: item.quantidade || 1 });
        }
        return acc;
    }, []);

    // Monta o endereço completo num texto só
    const enderecoCompleto = `${rua}, ${numero}${complemento ? ' - ' + complemento : ''}`;

    const pedidoDTO = {
        usuarioId: usuario.id,
        itens: itensParaEnviar,
        endereco: enderecoCompleto,
        bairro: semAcento(bairro)
        // valorTotal e valorEntrega são calculados no backend
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: CONFIG.getAuthHeaders(),
            body: JSON.stringify(pedidoDTO)
        });

        if (response.ok) {
            const pedido = await response.json();
            localStorage.setItem('pedidoAtual', JSON.stringify(pedido));
            localStorage.removeItem('carrinho');
            showToast("Pedido realizado com sucesso!", 'success');
            setTimeout(() => {
                window.location.href = "../checkout/acompanhamento.html";
            }, 800);
        } else {
            const erro = await response.json().catch(() => null);
            showToast(erro?.erro || "Erro ao salvar o pedido.", 'error');
        }
    } catch (e) {
        showToast("Erro de conexão com o servidor.", 'error');
    }
}