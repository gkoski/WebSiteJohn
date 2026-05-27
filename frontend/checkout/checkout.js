const API_URL = CONFIG.url('pedidos');

document.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.checkAuth()) return;
    carregarResumo();
});

function carregarResumo() {
    const listaElement = document.getElementById("lista-itens");
    const totalElement = document.getElementById("total");

    const dadosSalvos = localStorage.getItem('carrinho');
    const itensBrutos = dadosSalvos ? JSON.parse(dadosSalvos) : [];

    if (itensBrutos.length === 0) {
        listaElement.innerHTML = "<p style='color: var(--text-muted); text-align: center; padding: 20px;'>Seu carrinho está vazio!</p>";
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
    let totalGeral = 0;

    itensAgrupados.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        totalGeral += subtotal;

        const div = document.createElement("div");
        div.style.cssText = "display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-strong);";

        div.innerHTML = `
            <span>${item.quantidade}x ${item.nome}</span>
            <span style="color: var(--orange); font-weight: 600;">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
        `;
        listaElement.appendChild(div);
    });

    totalElement.innerText = totalGeral.toFixed(2).replace('.', ',');
}

async function finalizarPedido() {
    const endereco = document.getElementById("endereco").value;
    const observacoes = document.getElementById("observacoes").value;
    const totalTexto = document.getElementById("total").innerText;

    if (!endereco) {
        showToast("Informe o endereço de entrega!", 'warning');
        return;
    }

    const dadosSalvos = JSON.parse(localStorage.getItem('carrinho')) || [];
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) {
        showToast("Você precisa estar logado para finalizar o pedido!", 'error');
        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 1000);
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

    const pedidoDTO = {
        usuarioId: usuario.id,
        valorTotal: parseFloat(totalTexto.replace(',', '.')),
        itens: itensParaEnviar
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
            showToast("Erro ao salvar o pedido.", 'error');
        }
    } catch (e) {
        showToast("Erro de conexão com o servidor.", 'error');
    }
}
