// admin.js - lógica de abas e renderização simples de dados (exemplos)
document.addEventListener('DOMContentLoaded', ()=>{
	const tabs = Array.from(document.querySelectorAll('.tab'))
	const sections = {
		clientes: document.getElementById('clientesSection'),
		produtos: document.getElementById('produtosSection'),
		pedidos: document.getElementById('pedidosSection')
	}

	tabs.forEach(tab=>{
		tab.addEventListener('click', ()=>{
			tabs.forEach(t=>t.classList.remove('active'))
			tab.classList.add('active')
			const target = tab.dataset.target
			Object.keys(sections).forEach(k=>{
				if(k===target) sections[k].classList.remove('hidden')
				else sections[k].classList.add('hidden')
			})
		})
	})

	// Dados de exemplo
	const clientes = [
		{id:1,nome:'Dudu Liria',email:'dudu@gmail.com',tipo:'Admin',pedidos:0},
		{id:2,nome:'Mariana Costa',email:'mari@example.com',tipo:'Cliente',pedidos:2}
	]

	const produtos = [
		{id:1,nome:'Camiseta Básica Branca',categoria:'Camisetas',preco:59.9,imagem:'https://via.placeholder.com/60?text=T'},
		{id:2,nome:'Calça Jeans Azul',categoria:'Calças',preco:189.9,imagem:'https://via.placeholder.com/60?text=J'},
		{id:3,nome:'Jaqueta de Couro Preta',categoria:'Jaquetas',preco:349.9,imagem:'https://via.placeholder.com/60?text=JQ'}
	]

	const pedidos = [
		{id:101,cliente:'Mariana Costa',itens:3,total:399.7,status:'Pendente',data:'2025-11-20'},
	]

	// Render functions
	function formatCurrency(v){
		return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
	}

	function renderClientes(){
		const tbody = document.querySelector('#clientesTable tbody')
		tbody.innerHTML = ''
		clientes.forEach(c=>{
			const tr = document.createElement('tr')
			tr.innerHTML = `
				<td>${c.nome}</td>
				<td>${c.email}</td>
				<td><span class="type-badge">${c.tipo}</span></td>
				<td><span class="badge">${c.pedidos} pedidos</span></td>
				<td class="actions">
					<button class="action-btn">✏️</button>
					<button class="action-btn delete">🗑️</button>
				</td>
			`
			tbody.appendChild(tr)
		})
	}

	function renderProdutos(){
		const tbody = document.querySelector('#produtosTable tbody')
		tbody.innerHTML = ''
		produtos.forEach(p=>{
			const tr = document.createElement('tr')
			tr.innerHTML = `
				<td><img class="img-thumb" src="${p.imagem}" alt="${p.nome}"/></td>
				<td>${p.nome}</td>
				<td><span class="badge">${p.categoria}</span></td>
				<td><strong>${formatCurrency(p.preco)}</strong></td>
				<td class="actions">
					<button class="action-btn">✏️</button>
					<button class="action-btn delete">🗑️</button>
				</td>
			`
			tbody.appendChild(tr)
		})
	}

	function renderPedidos(){
		const tbody = document.querySelector('#pedidosTable tbody')
		tbody.innerHTML = ''
		if(pedidos.length===0){
			const tr = document.createElement('tr')
			tr.innerHTML = '<td colspan="7" style="text-align:center;padding:28px;color:#8b8b8b">Nenhum pedido registrado</td>'
			tbody.appendChild(tr)
			return
		}
		pedidos.forEach(p=>{
			const tr = document.createElement('tr')
			tr.innerHTML = `
				<td>#${p.id}</td>
				<td>${p.cliente}</td>
				<td>${p.itens}</td>
				<td>${formatCurrency(p.total)}</td>
				<td><span class="badge">${p.status}</span></td>
				<td>${p.data}</td>
				<td class="actions"><button class="action-btn">Detalhes</button></td>
			`
			tbody.appendChild(tr)
		})
	}

	// attach simple handlers
	document.getElementById('novoCliente').addEventListener('click', ()=>alert('Ação: criar novo cliente (a implementar)'))
	document.getElementById('novoProduto').addEventListener('click', ()=>alert('Ação: criar novo produto (a implementar)'))

	// initial render
	renderClientes()
	renderProdutos()
	renderPedidos()
})
