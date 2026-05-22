const CONFIG = {
  API_URL: 'http://localhost:8080',

  endpoints: {
    produtos:    '/produtos',
    destaque:    '/produtos/destaque',
    categorias:  '/categorias',
    pedidos:     '/pedidos',
    usuarios:    '/usuarios',
    login:       '/usuarios/login',
  },

  url(endpoint) {
    return this.API_URL + (this.endpoints[endpoint] ?? endpoint);
  },

  // Retorna headers com token JWT
  getAuthHeaders() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const token = usuario?.token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  // Redireciona para login se não autenticado
  checkAuth() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || !usuario.token) {
      window.location.href = '../login/login.html';
      return false;
    }
    return true;
  },

  // Redireciona para login se não for ADMIN
  checkAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || !usuario.token || usuario.role !== 'ADMIN') {
      window.location.href = '../login/login.html';
      return false;
    }
    return true;
  }
};