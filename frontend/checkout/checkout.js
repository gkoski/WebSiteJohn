const itens = [
    { nome: "Produto A", preco: 25.50, quantidade: 2 },
    { nome: "Produto B", preco: 15.00, quantidade: 1 }
  ];

  function carregarItens() {
    const lista = document.getElementById("lista-itens");
    let total = 0;

    itens.forEach(item => {
      const subtotal = item.preco * item.quantidade;
      total += subtotal;

      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <span>${item.nome} (x${item.quantidade})</span>
        <span>R$ ${subtotal.toFixed(2)}</span>
      `;
      lista.appendChild(div);
    });

    document.getElementById("total").innerText = total.toFixed(2);
  }

  async function finalizarPedido() {
    const endereco = document.getElementById("endereco").value;
    const observacoes = document.getElementById("observacoes").value;

    if (!endereco) {
      alert("Por favor, informe o endereço!");
      return;
    }

    // Monta o pedido
    const pedido = {
      itens,
      endereco,
      observacoes
    };

    try {
      const response = await fetch("/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pedido)
      });

      if (response.status === 201) {
        const data = await response.json();

        const pedidoId = data.id; // backend deve retornar { id: 123 }

        // Calcula total
        let total = 0;
        let listaItens = "";

        itens.forEach(item => {
          const subtotal = item.preco * item.quantidade;
          total += subtotal;
          listaItens += `- ${item.nome} (x${item.quantidade})\n`;
        });

        // Monta mensagem
        const mensagem = `Olá John! Pedido #${pedidoId} confirmado.\nTotal: R$ ${total.toFixed(2)}\nItens:\n${listaItens}`;

        // Número do John (coloque no formato internacional, ex: 5541999999999)
        const telefone = "5541999999999";

        // Codifica a mensagem para URL
        const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

        // Redireciona para o WhatsApp
        window.location.href = url;

      } else {
        alert("Erro ao finalizar pedido.");
      }

    } catch (error) {
      console.error("Erro:", error);
      alert("Erro na comunicação com o servidor.");
    }
  }

  carregarItens();
