const API_URL = 'http://localhost:8080/pedidos';

window.onload = () => {
    carregarResumo();
};

function carregarResumo() {
    const listaElement = document.getElementById("lista-itens");
    const totalElement = document.getElementById("total");
    
    // 1. Pega os dados brutos do localStorage
    const dadosSalvos = localStorage.getItem('carrinho');
    const itensBrutos = dadosSalvos ? JSON.parse(dadosSalvos) : [];

    if (itensBrutos.length === 0) {
        listaElement.innerHTML = "<p>Seu carrinho está vazio!</p>";
        return;
    }

    // 2. Agrupa itens repetidos para exibir "2x Hambúrguer" em vez de linhas separadas
    const itensAgrupados = itensBrutos.reduce((acc, item) => {
        const encontrado = acc.find(i => i.id === item.id);
        if (encontrado) {
            encontrado.quantidade = (encontrado.quantidade || 1) + (item.quantidade || 1);
        } else {
            acc.push({ ...item, quantidade: item.quantidade || 1 });
        }
        return acc;
    }, []);

    // 3. Renderiza na tela
    listaElement.innerHTML = "";
    let totalGeral = 0;

    itensAgrupados.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        totalGeral += subtotal;

        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.padding = "10px 0";
        div.style.borderBottom = "1px solid #444";
        
        div.innerHTML = `
            <span>${item.quantidade}x ${item.nome}</span>
            <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
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
        alert("Informe o endereço!");
        return;
    }

    // Preparar dados para o Java
    const dadosSalvos = JSON.parse(localStorage.getItem('carrinho')) || [];
    const usuario = JSON.parse(localStorage.getItem('usuario')) || { id: 1 };

    // Agrupar para o DTO do Java
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedidoDTO)
        });

        if (response.ok) {
            const pedido = await response.json();
            alert("Pedido confirmado!");
            localStorage.removeItem('carrinho');
            
            // Redireciona WhatsApp
            const msg = `*Pedido #${pedido.id}*\nTotal: R$ ${totalTexto}\nEndereço: ${endereco}`;
            window.location.href = `https://wa.me/5541999999999?text=${encodeURIComponent(msg)}`;
        } else {
            alert("Erro ao salvar no banco.");
        }
    } catch (e) {
        alert("Erro de conexão.");
    }
}