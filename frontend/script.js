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
    alert("Cadastro realizado com sucesso!");
    form.reset();
  }
});

function showError(groupId) {
  const group = document.getElementById(groupId);
  group.classList.add("input-error");
  group.querySelector(".error").style.display = "block";
}