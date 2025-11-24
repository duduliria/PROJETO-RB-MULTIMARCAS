/* Cart page logic: render items from localStorage and allow qty/remove */
(function () {
  const STORAGE_KEY = "rb_cart";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function formatMoney(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function updateHeaderBadge() {
    const badge = document.querySelector(".acoes-topo .badge");
    if (!badge) return;
    const count = getCart().reduce((s, i) => s + (i.qty || 0), 0);
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-flex";
    } else badge.style.display = "none";
  }

  function renderEmpty(show) {
    const empty = document.getElementById("cart-empty");
    const grid = document.getElementById("cart-grid");
    if (show) {
      empty.style.display = "";
      grid.style.display = "none";
    } else {
      empty.style.display = "none";
      grid.style.display = "flex";
    }
  }

  function renderCart() {
    const cart = getCart();
    updateHeaderBadge();
    if (!cart || cart.length === 0) {
      renderEmpty(true);
      return;
    }
    renderEmpty(false);

    const list = document.getElementById("cart-list");
    const summary = document.getElementById("cart-summary");
    list.innerHTML = "";
    summary.innerHTML = "";

    let total = 0;
    cart.forEach((item) => {
      const subtotal = item.price * item.qty;
      total += subtotal;

      const article = document.createElement("div");
      article.className = "item-row";
      article.innerHTML = `
        <div class="item-thumb">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="8" fill="#efeef2"/></svg>
        </div>
        <div class="item-info">
          <div class="nome">${item.name}</div>
          <div class="categoria">Categoria</div>
        </div>
        <div class="item-controls">
          <div class="item-qty">
            <button class="qty-btn" data-action="minus" data-id="${
              item.id
            }">−</button>
            <div class="qty-value">${item.qty}</div>
            <button class="qty-btn" data-action="plus" data-id="${
              item.id
            }">+</button>
          </div>
          <button class="remove-btn" data-id="${
            item.id
          }" title="Remover">🗑️</button>
        </div>
        <div style="min-width:120px;text-align:right">
          <div class="item-price">${formatMoney(subtotal)}</div>
          <div class="item-unit">R$ ${item.price.toFixed(2)} cada</div>
        </div>
      `;
      list.appendChild(article);
    });

    // summary
    const summaryHtml = document.createElement("div");
    summaryHtml.innerHTML = `
      <h3>Resumo do Pedido</h3>
      <div class="resumo-itens"></div>
      <div class="resumo-total"><span>Total</span><span>${formatMoney(
        total
      )}</span></div>
      <a class="btn-finalizar" href="#">Finalizar Compra</a>
    `;
    summary.appendChild(summaryHtml);

    // fill resumo-itens
    const resumoItens = summary.querySelector(".resumo-itens");
    getCart().forEach((i) => {
      const row = document.createElement("div");
      row.className = "resumo-linha";
      row.innerHTML = `<span>${i.name} × ${i.qty}</span><span>${formatMoney(
        i.price * i.qty
      )}</span>`;
      resumoItens.appendChild(row);
    });

    // attach listeners
    list
      .querySelectorAll(".qty-btn")
      .forEach((btn) => btn.addEventListener("click", onQtyClick));
    list
      .querySelectorAll(".remove-btn")
      .forEach((btn) => btn.addEventListener("click", onRemove));
  }

  function onQtyClick(e) {
    const id = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action;
    const cart = getCart();
    const item = cart.find((p) => p.id === id);
    if (!item) return;
    if (action === "plus") item.qty++;
    else if (action === "minus") {
      item.qty = Math.max(1, item.qty - 1);
    }
    saveCart(cart);
    renderCart();
  }

  function onRemove(e) {
    const id = e.currentTarget.dataset.id;
    let cart = getCart();
    cart = cart.filter((p) => p.id !== id);
    saveCart(cart);
    renderCart();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderCart();
  });
})();
