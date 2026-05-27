const form = document.getElementById("form");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  let valid = true;
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");

  document.querySelectorAll(".input-group").forEach(group => {
    group.classList.remove("input-error");
    const errorSpan = group.querySelector(".error");
    if (errorSpan) errorSpan.style.display = "none";
  });

  if (!email.value.includes("@")) {
    showError("emailGroup");
    valid = false;
  }

  if (senha.value.length < 1) {
    showError("senhaGroup");
    valid = false;
  }

  if (valid) {
    const dadosLogin = {
      email: email.value,
      senha: senha.value
    };

    fetch(CONFIG.url('login'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosLogin)
    })
    .then(async response => {
      if (response.ok) {
        const usuarioLogado = await response.json();

        localStorage.setItem('usuarioLogado', JSON.stringify({
          id: usuarioLogado.id,
          nome: usuarioLogado.nome,
          email: usuarioLogado.email,
          role: usuarioLogado.role,
          token: usuarioLogado.token
        }));

        showToast(`E aí, ${usuarioLogado.nome}! Login feito com sucesso.`, 'success');

        setTimeout(() => {
          if (usuarioLogado.role === 'ADMIN') {
            window.location.href = "../gestao_admin/menu.html";
          } else {
            window.location.href = "../cardapio/cardapio.html";
          }
        }, 800);

      } else if (response.status === 401) {
        showToast("E-mail ou senha incorretos.", 'error');
      } else {
        showToast("Erro no servidor: " + response.status, 'error');
      }
    })
    .catch(error => {
      console.error("Erro de conexão:", error);
      showToast("O servidor parece estar desligado!", 'error');
    });
  }
});

function showError(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    group.classList.add("input-error");
    const errorSpan = group.querySelector(".error");
    if (errorSpan) errorSpan.style.display = "block";
  }
}
