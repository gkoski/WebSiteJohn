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
    group.querySelector(".error").style.display = "none";
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
    .then(response => {
      if (response.ok) {
        alert("Show! Usuário cadastrado com sucesso.");
        form.reset();
      } else {
        alert("Erro no servidor: " + response.status);
      }
    })
    .catch(error => {
      console.error("Erro de conexão:", error);
      alert("Servidor parece estar desligado!");
    });
  }
});

function showError(groupId) {
  const group = document.getElementById(groupId);
  group.classList.add("input-error");
  group.querySelector(".error").style.display = "block";
}