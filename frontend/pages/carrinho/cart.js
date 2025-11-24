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

    // abrir modal ao finalizar compra
    const btnFinalizar = resumo.querySelector('.btn-finalizar');
    if (btnFinalizar) {
      btnFinalizar.addEventListener('click', function (ev) {
        ev.preventDefault();
        abrirModalCheckout();
      });
    }
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

    // listeners do modal (existem no HTML)
    const overlay = document.getElementById('modal-overlay');
    const btnFechar = overlay && overlay.querySelector('.modal-fechar');
    const btnCancelar = overlay && overlay.querySelector('.btn-cancelar');
    const form = document.getElementById('form-checkout');
    const btnFecharSucesso = document.getElementById('btn-fechar-sucesso');

    if (btnFechar) btnFechar.addEventListener('click', fecharModalCheckout);
    if (btnCancelar) btnCancelar.addEventListener('click', fecharModalCheckout);
    if (btnFecharSucesso) btnFecharSucesso.addEventListener('click', function () {
      fecharModalCheckout();
    });
    if (form) form.addEventListener('submit', tratarEnvioCheckout);
  });
})();

/* Funções do modal / checkout */
function abrirModalCheckout() {
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('form-checkout');
  const sucesso = document.getElementById('modal-sucesso');
  if (!overlay || !form) return;
  // reset form e estados
  form.reset();
  form.style.display = '';
  if (sucesso) sucesso.style.display = 'none';
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  // focar no primeiro campo
  const primeiro = form.querySelector('input'); if (primeiro) primeiro.focus();
}

function fecharModalCheckout() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
}

function mostrarSucessoCheckout() {
  const form = document.getElementById('form-checkout');
  const sucesso = document.getElementById('modal-sucesso');
  if (form) form.style.display = 'none';
  if (sucesso) sucesso.style.display = '';
}

function tratarEnvioCheckout(e) {
  e.preventDefault();
  const form = e.currentTarget;
  // validação simples
  const nome = form.querySelector('#nome-cliente').value.trim();
  const rua = form.querySelector('#rua').value.trim();
  const cidade = form.querySelector('#cidade').value.trim();
  const estado = form.querySelector('#estado').value.trim();
  const cep = form.querySelector('#cep').value.trim();
  if (!nome || !rua || !cidade || !estado || !cep) {
    alert('Por favor preencha todos os campos obrigatórios do endereço.');
    return;
  }

  // simula finalização: limpar carrinho, atualizar UI e mostrar sucesso
  try {
    localStorage.setItem('rb_cart', JSON.stringify([]));
  } catch (err) {}
  // atualizar badge e carrinho na página
  try { if (typeof renderizarCarrinho === 'function') renderizarCarrinho(); } catch (err) { }
  try { const badge = document.querySelector('.acoes-topo .badge'); if (badge) { badge.style.display='none'; badge.textContent='0'; } } catch (err) {}

  mostrarSucessoCheckout();
}
