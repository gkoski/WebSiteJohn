class Carrinho {
  constructor() {
    this.carrinho = [];
  }

  adicionarItem(item) {
    this.carrinho.push(item);
  }

  removerItem(id) {
    this.carrinho = this.carrinho.filter(item => item.id !== id);
  }

  limparCarrinho() {
    this.carrinho = [];
  }

  listarItens() {
    return this.carrinho;
  }
}

export default new Carrinho();
