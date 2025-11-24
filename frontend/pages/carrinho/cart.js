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

  function formatarDinheiro(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function atualizarBadgeCabecalho() {
    const badge = document.querySelector('.acoes-topo .badge');
    if (!badge) return;
    const total = obterCarrinho().reduce((s, i) => s + (i.qty || 0), 0);
    if (total > 0) {
      badge.textContent = total;
      badge.style.display = 'inline-flex';
    } else badge.style.display = 'none';
  }

  function renderizarVazio(mostrar) {
    const vazio = document.getElementById('cart-empty');
    const grade = document.getElementById('cart-grid');
    if (mostrar) {
      vazio.style.display = '';
      grade.style.display = 'none';
    } else {
      vazio.style.display = 'none';
      grade.style.display = 'flex';
    }
  }

  function renderizarCarrinho() {
    const carrinho = obterCarrinho();
    atualizarBadgeCabecalho();
    if (!carrinho || carrinho.length === 0) {
      renderizarVazio(true);
      return;
    }
    renderizarVazio(false);

    const lista = document.getElementById('cart-list');
    const resumo = document.getElementById('cart-summary');
    lista.innerHTML = '';
    resumo.innerHTML = '';

    let total = 0;
    carrinho.forEach((item) => {
      const subtotal = item.price * item.qty;
      total += subtotal;

      const linha = document.createElement('div');
      linha.className = 'item-row';
      linha.innerHTML = `
        <div class="item-thumb">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="8" fill="#efeef2"/></svg>
        </div>
        <div class="item-info">
          <div class="nome">${item.name}</div>
          <div class="categoria">Categoria</div>
        </div>
        <div class="item-controls">
          <div class="item-qty">
            <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
            <div class="qty-value">${item.qty}</div>
            <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-id="${item.id}" title="Remover">🗑️</button>
        </div>
        <div style="min-width:120px;text-align:right">
          <div class="item-price">${formatarDinheiro(subtotal)}</div>
          <div class="item-unit">R$ ${item.price.toFixed(2)} cada</div>
        </div>
      `;
      lista.appendChild(linha);
    });

    // resumo
    const resumoHtml = document.createElement('div');
    resumoHtml.innerHTML = `
      <h3>Resumo do Pedido</h3>
      <div class="resumo-itens"></div>
      <div class="resumo-total"><span>Total</span><span>${formatarDinheiro(total)}</span></div>
      <a class="btn-finalizar" href="#">Finalizar Compra</a>
    `;
    resumo.appendChild(resumoHtml);

    // preencher resumo-itens
    const resumoItens = resumo.querySelector('.resumo-itens');
    obterCarrinho().forEach((i) => {
      const linha = document.createElement('div');
      linha.className = 'resumo-linha';
      linha.innerHTML = `<span>${i.name} × ${i.qty}</span><span>${formatarDinheiro(i.price * i.qty)}</span>`;
      resumoItens.appendChild(linha);
    });

    // associar ouvintes
    lista.querySelectorAll('.qty-btn').forEach((btn) => btn.addEventListener('click', aoClicarQuantidade));
    lista.querySelectorAll('.remove-btn').forEach((btn) => btn.addEventListener('click', aoRemover));
  }

  function aoClicarQuantidade(e) {
    const id = e.currentTarget.dataset.id;
    const acao = e.currentTarget.dataset.action;
    const carrinho = obterCarrinho();
    const item = carrinho.find((p) => p.id === id);
    if (!item) return;
    if (acao === 'plus') item.qty++;
    else if (acao === 'minus') {
      item.qty = Math.max(1, item.qty - 1);
    }
    salvarCarrinho(carrinho);
    renderizarCarrinho();
  }

  function aoRemover(e) {
    const id = e.currentTarget.dataset.id;
    let carrinho = obterCarrinho();
    carrinho = carrinho.filter((p) => p.id !== id);
    salvarCarrinho(carrinho);
    renderizarCarrinho();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrinho();
  });
})();
