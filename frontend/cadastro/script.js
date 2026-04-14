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

  // Limpar erros anteriores
  document.querySelectorAll(".input-group").forEach(group => {
    group.classList.remove("input-error");
    const errorSpan = group.querySelector(".error");
    if (errorSpan) errorSpan.style.display = "none";
  });

  // Validações
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
    alert("Você precisa aceitar os termos");
    valid = false;
  }

  if (valid) {
    const dadosUsuario = {
      nome: nome.value,
      cpf: cpf.value.replace(/\D/g, ""),
      email: email.value,
      senha: senha.value
    };

    fetch("http://localhost:8080/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosUsuario)
    })
    .then(async response => {
      if (response.ok) {

        const usuarioCriado = await response.json();

        localStorage.setItem('usuarioLogadoId', usuarioCriado.id);
        localStorage.setItem('usuarioLogadoNome', usuarioCriado.nome);

        alert("Show! Usuário cadastrado com sucesso.");
        form.reset();

        window.location.href = "/cardapio/cardapio.html"; 

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

function showError(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    group.classList.add("input-error");
    const errorSpan = group.querySelector(".error");
    if (errorSpan) errorSpan.style.display = "block";
  }
}