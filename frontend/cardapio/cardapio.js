/* ================================================================
   MR. JOHN SPORTS BAR — Cardápio + Carrinho
   ================================================================ */

const API_URL = CONFIG.url('produtos');

let produtosCarregados = [];

/* ================================================================
   CARRINHO
   ================================================================ */
class CarrinhoService {
  constructor() {
    this.key = 'carrinho';
    try {
      const dadosSalvos = localStorage.getItem(this.key);
      this.carrinho = dadosSalvos ? JSON.parse(dadosSalvos) : [];
    } catch (e) {
      this.carrinho = [];
    }
  }

  salvar() {
    localStorage.setItem(this.key, JSON.stringify(this.carrinho));
  }

  adicionar(produto) {
    const existente = this.carrinho.find(i => i.id === produto.id);
    if (existente) {
      existente.quantidade = (existente.quantidade || 1) + 1;
    } else {
      this.carrinho.push({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        foto: produto.foto,
        quantidade: 1
      });
    }
    this.salvar();
    this.refresh();
  }

  incrementar(id) {
    const item = this.carrinho.find(i => i.id === id);
    if (item) {
      item.quantidade = (item.quantidade || 1) + 1;
      this.salvar();
      this.refresh();
    }
  }

  decrementar(id) {
    const item = this.carrinho.find(i => i.id === id);
    if (!item) return;
    if (item.quantidade > 1) {
      item.quantidade -= 1;
    } else {
      this.remover(id);
      return;
    }
    this.salvar();
    this.refresh();
  }

  remover(id) {
    this.carrinho = this.carrinho.filter(i => i.id !== id);
    this.salvar();
    this.refresh();
  }

  esvaziar() {
    this.carrinho = [];
    this.salvar();
    this.refresh();
  }

  itens() { return this.carrinho; }

  total() {
    return this.carrinho.reduce((t, i) => t + (i.preco * (i.quantidade || 1)), 0);
  }

  qtdTotal() {
    return this.carrinho.reduce((acc, i) => acc + (i.quantidade || 1), 0);
  }

  refresh() {
    renderCarrinho();
    atualizarBadge();
  }
}

const cart = new CarrinhoService();

/* ================================================================
   SIDEBAR
   ================================================================ */
window.toggleCarrinho = () => {
  const sidebar = document.getElementById('carrinhoLateral');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
};

function resolverFotoUrl(foto) {
  if (!foto) return '';
  if (/^https?:\/\//i.test(foto)) return foto;
  if (foto.startsWith('/')) return CONFIG.API_URL + foto;
  return foto;
}

function renderCarrinho() {
  const container = document.getElementById('itensCarrinhoLateral');
  const totalEl = document.getElementById('totalCarrinho');
  if (!container) return;

  const itens = cart.itens();

  if (itens.length === 0) {
    container.innerHTML = `
      <div class="carrinho-vazio">
        <span class="emoji">🍔</span>
        <p>Seu carrinho está vazio.</p>
        <small>Escolhe algo no cardápio e bora!</small>
      </div>`;
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    return;
  }

  container.innerHTML = itens.map(item => {
    const subtotal = item.preco * (item.quantidade || 1);
    const nomeEsc = (item.nome || '').replace(/'/g, "\\'");
    return `
      <article class="item-sidebar">
        <img class="item-thumb" src="${resolverFotoUrl(item.foto)}" alt="${nomeEsc}" onerror="this.style.visibility='hidden'">
        <div class="item-info">
          <strong>${item.nome}</strong>
          <span class="item-preco-unit">R$ ${item.preco.toFixed(2).replace('.', ',')} un.</span>
        </div>
        <div class="item-actions">
          <div class="qty-control">
            <button class="qty-btn" onclick="cart.decrementar(${item.id})" aria-label="Diminuir">−</button>
            <span class="qty-value">${item.quantidade}</span>
            <button class="qty-btn" onclick="cart.incrementar(${item.id})" aria-label="Aumentar">+</button>
          </div>
          <div class="item-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
          <button class="btn-remover" onclick="cart.remover(${item.id})" aria-label="Remover item">🗑️</button>
        </div>
      </article>`;
  }).join('');

  const total = cart.total();
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function atualizarBadge() {
  const badge = document.getElementById('qtd-itens');
  if (badge) badge.textContent = cart.qtdTotal();
}

window.cart = cart;

window.esvaziarCarrinho = () => {
  if (cart.itens().length === 0) {
    showToast('O carrinho já está vazio.', 'warning');
    return;
  }
  cart.esvaziar();
  showToast('Carrinho esvaziado!', 'success');
};

window.adicionarAoCarrinho = (id) => {
  const p = produtosCarregados.find(x => x.id === id);
  if (!p) return;
  cart.adicionar(p);
  showToast(`${p.nome} adicionado ao carrinho!`, 'success', 1400);
};

window.irParaCheckout = () => {
  if (cart.itens().length === 0) {
    showToast("Seu carrinho está vazio!", 'warning');
    return;
  }
  window.location.href = "../checkout/checkout.html";
};

/* ================================================================
   BUSCA / FILTRO NA TELA
   ================================================================ */
function filtrarProdutos(termo) {
  const t = (termo || '').toLowerCase().trim();

  if (!t) {
    renderProdutos(produtosCarregados, false);
    return;
  }

  const filtrados = produtosCarregados.filter(p => {
    const nome = (p.nome || '').toLowerCase();
    const desc = (p.descricao || '').toLowerCase();
    return nome.includes(t) || desc.includes(t);
  });

  renderProdutos(filtrados, true);
}

/* ================================================================
   RENDER DOS CARDS POR CATEGORIA
   ================================================================ */
function renderProdutos(produtos, emBusca = false) {
  [1, 2, 3].forEach(catId => {
    const grid = document.getElementById(`menu-${catId}`);
    const count = document.getElementById(`count-${catId}`);
    if (!grid) return;

    // Seção inteira (pra esconder/mostrar)
    const section = grid.closest('.cat-section');

    const itens = produtos.filter(p => p.categoria && Number(p.categoria.id) === catId);
    if (count) count.textContent = itens.length;

    if (itens.length === 0) {
      if (emBusca) {
        // Modo busca: esconde a seção inteira
        if (section) section.style.display = 'none';
      } else {
        // Sem busca: categoria realmente vazia
        if (section) section.style.display = '';
        grid.innerHTML = `<div class="empty-state">Em breve!</div>`;
      }
      return;
    }

    // Tem itens: garante seção visível
    if (section) section.style.display = '';

    grid.innerHTML = itens.map(p => {
      const preco = typeof p.preco === 'number' ? p.preco : 0;
      const nome = p.nome || 'Sem nome';
      const fotoFallback = 'https://via.placeholder.com/600x500?text=Sem+Foto';

      return `
        <article class="card">
          <div class="img-wrap">
            <img src="${resolverFotoUrl(p.foto) || fotoFallback}"
                 alt="${nome}"
                 onerror="this.src='${fotoFallback}'">
          </div>
          <div class="card-content">
            <h3>${nome}</h3>
            <p>${p.descricao || ''}</p>
            <div class="row">
              <span class="price">R$ ${preco.toFixed(2).replace('.', ',')}</span>
              <button class="btn-adicionar" onclick="adicionarAoCarrinho(${p.id})">
                Adicionar
              </button>
            </div>
          </div>
        </article>`;
    }).join('');
  });
}

/* ================================================================
   SCROLL-SPY
   ================================================================ */
function setupScrollSpy() {
  const pills = document.querySelectorAll('.cat-pill');
  const sections = document.querySelectorAll('.cat-section');
  if (!sections.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const target = pill.dataset.target;
      const section = document.getElementById(target);
      if (!section) return;
      const headerH = document.querySelector('header').offsetHeight + document.querySelector('.cat-nav').offsetHeight + 12;
      const top = section.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        pills.forEach(p => p.classList.toggle('active', p.dataset.target === id));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

/* ================================================================
   BUSCA NA API (só API real)
   ================================================================ */
async function listarProdutos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ' + response.status);
    const produtos = await response.json();
    produtosCarregados = Array.isArray(produtos) ? produtos : [];
    renderProdutos(produtosCarregados, false);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    showToast('Não foi possível carregar o cardápio.', 'error');
  }
}

/* ================================================================
   INIT
   ================================================================ */
window.addEventListener('DOMContentLoaded', () => {
  if (!CONFIG.checkAuth()) return;
  document.getElementById('nomeUsuario').textContent = getNomeUsuario();
  listarProdutos().then(() => setupScrollSpy());
  renderCarrinho();
  atualizarBadge();

  const buscaInput = document.getElementById('buscaProduto');
  if (buscaInput) {
    buscaInput.addEventListener('input', (e) => filtrarProdutos(e.target.value));
  }
});