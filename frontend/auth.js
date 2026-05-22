/**
 * MR. JOHN SPORTS BAR — Autenticação e Logout
 */

function logout() {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('carrinho');
  localStorage.removeItem('pedidoAtual');
  window.location.href = '../login/login.html';
}

function getNomeUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  return usuario?.nome || '';
}

function isAdmin() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  return usuario?.role === 'ADMIN';
}