/**
 * MR. JOHN SPORTS BAR — Ver/Ocultar Senha
 * Ativa todos os botões .toggle-senha da página.
 * Cada botão deve ter data-target apontando para o id do input de senha,
 * e conter dois SVGs: .eye-show (olho aberto) e .eye-hide (olho cortado).
 */
document.addEventListener('DOMContentLoaded', () => {
  const botoes = document.querySelectorAll('.toggle-senha');

  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      const alvoId = botao.dataset.target;
      const input = document.getElementById(alvoId);
      if (!input) return;

      const mostrando = input.type === 'text';

      // Alterna o tipo do input
      input.type = mostrando ? 'password' : 'text';

      // Alterna os ícones
      const eyeShow = botao.querySelector('.eye-show');
      const eyeHide = botao.querySelector('.eye-hide');
      if (eyeShow) eyeShow.style.display = mostrando ? '' : 'none';
      if (eyeHide) eyeHide.style.display = mostrando ? 'none' : '';

      // Acessibilidade
      botao.setAttribute('aria-pressed', String(!mostrando));
      botao.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Ocultar senha');
    });
  });
});