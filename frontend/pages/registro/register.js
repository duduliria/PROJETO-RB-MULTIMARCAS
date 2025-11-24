document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro");
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirma = document.getElementById("confirma-senha");
  const botao = form.querySelector('button[type="submit"]');

  // Função auxiliar para mostrar erro
  function mostrarErro(input, mensagem) {
    const small =
      input.nextElementSibling &&
      input.nextElementSibling.classList.contains("msg-erro")
        ? input.nextElementSibling
        : null;
    if (small) {
      small.textContent = mensagem;
      small.style.color = "#b00020";
      small.style.fontSize = "12px";
      small.style.marginTop = "6px";
      input.setAttribute("aria-invalid", "true");
    }
  }

  function limparErro(input) {
    const small =
      input.nextElementSibling &&
      input.nextElementSibling.classList.contains("msg-erro")
        ? input.nextElementSibling
        : null;
    if (small) {
      small.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  // Validações simples e didáticas
  function validar() {
    let valido = true;
    // nome
    if (!nome.value.trim()) {
      mostrarErro(nome, "Por favor, informe seu nome completo.");
      valido = false;
    } else {
      limparErro(nome);
    }

    // email
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      mostrarErro(email, "O e-mail é obrigatório.");
      valido = false;
    } else if (!reEmail.test(email.value.trim())) {
      mostrarErro(email, "Informe um e-mail válido.");
      valido = false;
    } else {
      limparErro(email);
    }

    // senha
    if (!senha.value) {
      mostrarErro(senha, "A senha é obrigatória.");
      valido = false;
    } else if (senha.value.length < 6) {
      mostrarErro(senha, "Senha muito curta. Mínimo 6 caracteres.");
      valido = false;
    } else {
      limparErro(senha);
    }

    // confirma
    if (!confirma.value) {
      mostrarErro(confirma, "Confirme sua senha.");
      valido = false;
    } else if (confirma.value !== senha.value) {
      mostrarErro(confirma, "As senhas não coincidem.");
      valido = false;
    } else {
      limparErro(confirma);
    }

    return valido;
  }

  // Limpar erros ao digitar
  [nome, email, senha, confirma].forEach((input) => {
    input.addEventListener("input", () => limparErro(input));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validar()) return;

    // Preparar envio
    botao.disabled = true;
    const textoOriginal = botao.textContent;
    botao.textContent = "Cadastrando...";

    try {
      const resp = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.value.trim(),
          email: email.value.trim(),
          senha: senha.value,
        }),
      });

      const data = await resp.json();
      if (resp.status === 201) {
        try {
          const usuarioParaSalvar = {
            id: data.id || null,
            nome: nome.value.trim(),
            email: email.value.trim(),
            tipo: "cliente",
          };
          localStorage.setItem("rb_user", JSON.stringify(usuarioParaSalvar));
        } catch (e) {
          console.warn("Não foi possível salvar usuário no localStorage", e);
        }
        window.location.href = "../home/home.html";
        return;
      }

      // Tratamento de erros retornados pela API
      if (data && data.erro) {
        // Exibir erro genérico no topo dos campos ou no campo correspondente
        if (data.erro.toLowerCase().includes("email")) {
          mostrarErro(email, data.erro);
        } else {
          // se não souber onde mostrar, usar alert (didático)
          alert("Erro: " + data.erro);
        }
      } else {
        alert("Erro ao cadastrar. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na conexão com o servidor. Verifique se a API está rodando.");
    } finally {
      botao.disabled = false;
      botao.textContent = textoOriginal;
    }
  });
});
