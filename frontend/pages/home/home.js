/* Home page cart logic (localStorage) */
(() => {
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

  function getCount() {
    return getCart().reduce((s, i) => s + (i.qty || 0), 0);
  }

  function updateBadge() {
    const badge = document.querySelector(".acoes-topo .badge");
    if (!badge) return;
    const count = getCount();
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    updateBadge();
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateBadge();
    document.querySelectorAll(".btn-adicionar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const el = e.currentTarget;
        const prod = {
          id: el.dataset.id,
          name: el.dataset.name,
          price: parseFloat(el.dataset.price),
        };
        addToCart(prod);
        btn.textContent = "Adicionado ✓";
        setTimeout(() => (btn.textContent = "Adicionar ao Carrinho"), 900);
      });
    });
  });
})();
