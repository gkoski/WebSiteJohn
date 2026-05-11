/**
 * MR. JOHN SPORTS BAR — Configuração Global da API
 * 
 * Alterar apenas este arquivo para trocar o ambiente (dev → produção).
 */

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

  /**
   * Monta a URL completa de um endpoint.
   * Exemplo: CONFIG.url('login') → 'http://localhost:8080/usuarios/login'
   */
  url(endpoint) {
    return this.API_URL + (this.endpoints[endpoint] ?? endpoint);
  }
};