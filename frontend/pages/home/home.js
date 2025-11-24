/* Lógica do carrinho na página inicial (localStorage) */
(function () {
  const CHAVE_STORAGE = 'rb_cart';

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
    const badge = document.querySelector('.acoes-topo .badge');
    if (!badge) return;
    const total = obterQuantidadeTotal();
    if (total > 0) {
      badge.textContent = total;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
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

  document.addEventListener('DOMContentLoaded', () => {
    atualizarBadge();
    document.querySelectorAll('.btn-adicionar').forEach((botao) => {
      botao.addEventListener('click', (e) => {
        const el = e.currentTarget;
        const produto = {
          id: el.dataset.id,
          name: el.dataset.name,
          price: parseFloat(el.dataset.price),
        };
        adicionarAoCarrinho(produto);
        botao.textContent = 'Adicionado ✓';
        setTimeout(() => (botao.textContent = 'Adicionar ao Carrinho'), 900);
      });
    });
  });
})();
