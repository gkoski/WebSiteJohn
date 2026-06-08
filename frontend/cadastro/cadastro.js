const form = document.getElementById("form");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  let valid = true;

  const nome = document.getElementById("nome");
  const cpf = document.getElementById("cpf");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const termos = document.getElementById("termos");

  document.querySelectorAll(".input-group").forEach(group => {
    group.classList.remove("input-error");
    const errorSpan = group.querySelector(".error");
    if (errorSpan) errorSpan.style.display = "none";
  });

  if (!nome.value.trim()) {
    showError("nomeGroup");
    valid = false;
  }

  const cpfRegex = /^\d{11}$/;
  if (!cpfRegex.test(cpf.value.replace(/\D/g, ""))) {
    showError("cpfGroup");
    valid = false;
  }

  if (!email.value.includes("@")) {
    showError("emailGroup");
    valid = false;
  }

  if (senha.value.length < 6) {
    showError("senhaGroup");
    valid = false;
  }

  if (senha.value !== confirmarSenha.value) {
    showError("confirmarSenhaGroup");
    valid = false;
  }

  if (!termos.checked) {
    showToast("Você precisa aceitar os termos.", 'warning');
    valid = false;
  }

  if (valid) {
    const dadosUsuario = {
      nome: nome.value,
      cpf: cpf.value.replace(/\D/g, ""),
      email: email.value,
      senha: senha.value
    };

    fetch(CONFIG.url('usuarios'), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosUsuario)
    })
    .then(async response => {
      if (response.ok) {

        const usuarioCriado = await response.json();

        localStorage.setItem('usuarioLogado', JSON.stringify({
          id: usuarioCriado.id,
          nome: usuarioCriado.nome,
          email: usuarioCriado.email
        }));

        showToast("Cadastro realizado com sucesso!", 'success');
        form.reset();

        setTimeout(() => {
          window.location.href = "../cardapio/cardapio.html";
        }, 800);

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

/* --- Modal de Termos de Uso --- */
(function () {
  const modal = document.getElementById("termosModal");
  const abrir = document.getElementById("abrirTermos");
  const fechar = document.getElementById("fecharTermos");
  const aceitar = document.getElementById("aceitarTermos");
  const checkbox = document.getElementById("termos");
  if (!modal || !abrir) return;

  function abrirModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function fecharModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  abrir.addEventListener("click", abrirModal);
  fechar.addEventListener("click", fecharModal);

  aceitar.addEventListener("click", () => {
    if (checkbox) checkbox.checked = true;
    fecharModal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) fecharModal();
  });
})();
