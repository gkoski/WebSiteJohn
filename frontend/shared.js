/**
 * MR. JOHN SPORTS BAR — Toast / Feedback Inline (shared.js)
 * Substitui todos os alert() por notificações visuais.
 */

(function () {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  /**
   * Exibe uma notificação toast.
   * @param {string} msg  - Texto da mensagem
   * @param {'success'|'error'|'warning'|'info'} tipo - Tipo visual
   * @param {number} duracao - ms para auto-dismiss (padrão 3000)
   */
  window.showToast = function (msg, tipo = 'info', duracao = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.textContent = msg;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duracao);
  };
})();
