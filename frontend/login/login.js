const form = document.getElementById("form");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  let valid = true;
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");

  // Limpar erros anteriores (mantendo seu padrão)
  document.querySelectorAll(".input-group").forEach(group => {
    group.classList.remove("input-error");
    const errorSpan = group.querySelector(".error");
    if (errorSpan) errorSpan.style.display = "none";
  });

  // Validação simples de front-end
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

    fetch("http://localhost:8080/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosLogin)
    })
    .then(async response => {
      if (response.ok) {
        const usuarioLogado = await response.json();

        // Salvando os dados no localStorage para usar no PedidoController depois
        localStorage.setItem('usuarioLogadoId', usuarioLogado.id);
        localStorage.setItem('usuarioLogadoNome', usuarioLogado.nome);

        alert(`E aí, ${usuarioLogado.nome}! Login feito com sucesso.`);
        window.location.href = "../cardapio/cardapio.html"; 

      } else if (response.status === 401) {
        alert("E-mail ou senha incorretos.");
      } else {
        alert("Erro no servidor: " + response.status);
      }
    })
    .catch(error => {
      console.error("Erro de conexão:", error);
      alert("O servidor Java parece estar desligado!");
    });
  }
});

// Sua função de erro original
function showError(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    group.classList.add("input-error");
    const errorSpan = group.querySelector(".error");
    if (errorSpan) errorSpan.style.display = "block";
  }
}