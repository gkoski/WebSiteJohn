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

  function finalizarPedido() {
    const endereco = document.getElementById("endereco").value;
    const observacoes = document.getElementById("observacoes").value;

    if (!endereco) {
      alert("Por favor, informe o endereço!");
      return;
    }

    const pedido = {
      itens,
      endereco,
      observacoes
    };

    console.log("Pedido enviado:", pedido);
    alert("Pedido confirmado com sucesso!");
  }

  carregarItens();
