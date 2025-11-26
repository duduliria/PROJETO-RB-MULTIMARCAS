document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const botao = form.querySelector('button[type="submit"]');

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

  function validar() {
    let valido = true;
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value.trim()) {
      mostrarErro(email, "Informe seu e-mail.");
      valido = false;
    } else if (!reEmail.test(email.value.trim())) {
      mostrarErro(email, "Informe um e-mail válido.");
      valido = false;
    } else {
      limparErro(email);
    }

    if (!senha.value) {
      mostrarErro(senha, "Informe sua senha.");
      valido = false;
    } else {
      limparErro(senha);
    }

    return valido;
  }

  [email, senha].forEach((el) =>
    el.addEventListener("input", () => limparErro(el))
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validar()) return;

    botao.disabled = true;
    const txtOriginal = botao.textContent;
    botao.textContent = "Entrando...";

    try {
      const API_BASE = "http://localhost:3000"
      const resp = await fetch(`${API_BASE}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value.trim(), senha: senha.value }),
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.status === 200) {
        // Salva usuário em localStorage e redireciona para a home
        try {
          const usuarioParaSalvar = {
            id: data.id || null,
            nome: data.nome || "",
            email: data.email || "",
            tipo: "cliente",
          };
          localStorage.setItem("rb_user", JSON.stringify(usuarioParaSalvar));
        } catch (err) {
          console.warn("Não foi possível salvar usuário no localStorage", err);
        }
        window.location.href = "pages/home/home.html";
        return;
      }

      // Tratamento de erros retornados pelo backend
      if (resp.status === 404) {
        mostrarErro(email, data.erro || "E-mail não cadastrado.");
        alert(data.erro || "E-mail não cadastrado. Faça o cadastro.");
      } else if (resp.status === 401) {
        mostrarErro(senha, data.erro || "E-mail ou senha incorretos.");
      } else if (resp.status === 400) {
        alert(data.erro || "Dados inválidos.");
      } else {
        alert(
          data.erro || "Erro ao tentar entrar. Tente novamente mais tarde."
        );
      }
    } catch (err) {
      console.error(err);
      alert(
        "Erro na conexão com o servidor. Verifique se o backend está rodando."
      );
    } finally {
      botao.disabled = false;
      botao.textContent = txtOriginal;
    }
  });
});
