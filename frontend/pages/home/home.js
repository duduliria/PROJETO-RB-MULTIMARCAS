// Proteção de rota: se não houver usuário logado em localStorage, redireciona para login
document.addEventListener('DOMContentLoaded', () => {
  try {
    const usuario = JSON.parse(localStorage.getItem('rb_user'));
    if (!usuario) {
      // Não está logado -> volta para a tela de login
      window.location.href = '../../index.html';
      return;
    }
  } catch (e) {
    window.location.href = '../../index.html';
    return;
  }
});

/* Lógica do carrinho na página inicial (localStorage) */
(function () {
  const CHAVE_STORAGE = "rb_cart";

  function obterCarrinho() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
    } catch (e) {
      return [];
    }
  }

  function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(carrinho));
  }

  function obterQuantidadeTotal() {
    return obterCarrinho().reduce((s, item) => s + (item.qty || 0), 0);
  }

  function atualizarBadge() {
    const badge = document.querySelector(".acoes-topo .badge");
    if (!badge) return;
    const total = obterQuantidadeTotal();
    if (total > 0) {
      badge.textContent = total;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function adicionarAoCarrinho(produto) {
    const carrinho = obterCarrinho();
    const existente = carrinho.find((p) => p.id === produto.id);
    if (existente) {
      existente.qty += 1;
    } else {
      carrinho.push({ ...produto, qty: 1 });
    }
    salvarCarrinho(carrinho);
    atualizarBadge();
  }

  document.addEventListener("DOMContentLoaded", () => {
    atualizarBadge();
    document.querySelectorAll(".btn-adicionar").forEach((botao) => {
      botao.addEventListener("click", (e) => {
        const el = e.currentTarget;
        const produto = {
          id: el.dataset.id,
          name: el.dataset.name,
          price: parseFloat(el.dataset.price),
        };
        adicionarAoCarrinho(produto);
        botao.textContent = "Adicionado ✓";
        setTimeout(() => (botao.textContent = "Adicionar ao Carrinho"), 900);
      });
    });

    // --- FILTRO DE CATEGORIAS ---
    const select = document.getElementById("filtroCategoria");
    const produtosCards = Array.from(
      document.querySelectorAll(".card-produto")
    );
    const contadorEl = document.getElementById("contadorProdutos");

    function atualizarContador() {
      const visiveis = produtosCards.filter((c) => c.style.display !== "none");
      const n = visiveis.length;
      contadorEl.textContent = `${n} produto${n !== 1 ? "s" : ""} disponível${
        n !== 1 ? "s" : ""
      }`;
    }

    // popular select com categorias únicas encontradas nos cards
    const categorias = produtosCards
      .map((c) => c.dataset.category)
      .filter(Boolean);
    const unicas = [...new Set(categorias)];
    unicas.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });

    // evento para filtrar
    select.addEventListener("change", () => {
      const val = select.value;
      produtosCards.forEach((card) => {
        if (val === "todas" || card.dataset.category === val) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
      atualizarContador();
    });

    // inicializa contador corretamente
    atualizarContador();
  });
})();

// --- MENU DO USUÁRIO (MOSTRAR NOME E OPÇÃO SAIR) ---
document.addEventListener("DOMContentLoaded", () => {
  const perfilBtn = document.querySelector('.acoes-topo [aria-label="perfil"]');
  const userMenu = document.getElementById("user-menu");
  const USER_KEY = "rb_user";

  function obterUsuario() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  }

  const usuario = obterUsuario();

  if (usuario) {
    // Preencher dados visíveis no menu
    const nomeEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    if (nomeEl) nomeEl.textContent = usuario.nome || usuario.name || "Usuário";
    if (emailEl) emailEl.textContent = usuario.email || "";

    // Mostrar/ocultar menu ao clicar no ícone de perfil
    if (perfilBtn) {
      perfilBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (!userMenu) return;
        userMenu.style.display =
          userMenu.style.display === "block" ? "none" : "block";
      });
    }

    // Fechar ao clicar fora
    document.addEventListener("click", () => {
      if (userMenu) userMenu.style.display = "none";
    });

    // Logout
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(USER_KEY);
        // Redireciona para a página de login
        window.location.href = "../../index.html";
      });
    }
  } else {
    // Usuário não está logado: clicar no ícone leva ao login
    if (perfilBtn) {
      perfilBtn.addEventListener("click", () => {
        window.location.href = "../../index.html";
      });
    }
  }
});
