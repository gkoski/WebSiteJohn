/* ============================================================
   RODAPÉ GLOBAL — Desenvolvido por OmniSyst
   Injeta o mesmo rodapé em todas as páginas (sistema + LP).
   Estilo embutido para funcionar independente do CSS da página.
   Para mudar o rodapé, edite SOMENTE este arquivo.
   ============================================================ */
(function () {
  // Descobre o caminho relativo até a raiz do frontend.
  // Páginas em subpastas (cardapio/, login/, etc.) precisam de "../".
  // A LP (index.html) e o lp_omnisyst.html ficam na raiz.
  const emSubpasta = /\/(cardapio|login|cadastro|checkout|gestao_admin)\//.test(window.location.pathname);
  const base = emSubpasta ? '../' : '';
  const linkOmni = base + 'lp_omnisyst.html';

  // Estilo do rodapé (injetado uma vez)
  if (!document.getElementById('omni-footer-style')) {
    const style = document.createElement('style');
    style.id = 'omni-footer-style';
    style.textContent = `
      .omni-footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        width: 100%;
        box-sizing: border-box;
        padding: 14px 20px;
        text-align: center;
        font-family: 'DM Sans', system-ui, sans-serif;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.02em;
        color: rgba(244, 239, 230, 0.55);
        background: rgba(0, 0, 0, 0.35);
        border-top: 1px solid rgba(255, 255, 255, 0.07);
      }
      .omni-footer a {
        color: #14476e;
        font-weight: 700;
        text-decoration: none;
        transition: color 0.25s ease;
      }
      .omni-footer a:hover {
        color: #1e6ba8;
        text-decoration: underline;
      }
      .omni-footer .omni-sep { opacity: 0.4; margin: 0 4px; }
    `;
    document.head.appendChild(style);
  }

  // Monta o rodapé
  const footer = document.createElement('footer');
  footer.className = 'omni-footer';
  footer.innerHTML =
    'Desenvolvido por <a href="' + linkOmni + '">OmniSyst</a>' +
    '<span class="omni-sep">·</span>© 2026';

  // Adiciona ao final do body
  document.body.appendChild(footer);
})();