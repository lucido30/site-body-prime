// 🛒 Carrinho e produtos
let carrinho = [];

// Exemplo inicial de produtos
const produtos = [
    { id: "c1", nome: "Creatina Max Titanium 300g", preco: 89.9, categoria: "creatina", img: "imagens/produtos/creatinamax300.jpg" },
    { id: "c2", nome: "Creatina Integral medica 300g", preco: 99.9, categoria: "creatina", img: "/imagens/produtos/creatinaintegral300.jpg" },
    { id: "c3", nome: "Creatina dux 300g", preco: 109.9, categoria: "creatina", img: "/imagens/produtos/creatinadux300.jpg" },
    { id: "p1", nome: "Pré-treino Insane clown", preco: 129.00, categoria: "pre-treino", img: "/imagens/produtos/pretreinodemonslab.jpg" },
    { id: "p2", nome: "Pré-treino epic 300g", preco: 179.00, categoria: "pre-treino", img: "/imagens/produtos/epic.webp" },
    { id: "p3", nome: "Pré-treino nuclear rush 300g", preco: 179.00, categoria: "pre-treino", img: "/imagens/produtos/pretreinobodyaction.jpg" },
    { id: "w1", nome: "Whey bodyaction isolado 900g", preco: 149.9, categoria: "whey", img: "/imagens/produtos/wheybodyaction900.jpg" },
    { id: "w2", nome: "Whey integral medica", preco: 119.9, categoria: "whey", img: "/imagens/produtos/wheyintegral900.jpg" },
    { id: "w3", nome: "Whey isolado dux", preco: 199.9, categoria: "whey", img: "/imagens/produtos/wheydux900.jpg" },
    { id: "t1", nome: "hot growth", preco: 79.9, categoria: "termogenico", img: "/imagens/produtos/hot.jpg" },
    { id: "t2", nome: "therma integral", preco: 89.9, categoria: "termogenico", img: "/imagens/produtos/thermogenicointegral.png" },
    { id: "t3", nome: "Fire black", preco: 64.9, categoria: "termogenico", img: "/imagens/produtos/fireblack.webp" },
    { id: "o1", nome: "coqteleira", preco: 19.9, categoria: "outros", img: "/imagens/produtos/coqteleira.jpg" },
    { id: "o2", nome: "strap", preco: 34.9, categoria: "outros", img: "/imagens/produtos/strap.jpg" },
    { id: "03", nome: "munhequeira", preco: 39.9, categoria: "outros", img: "/imagens/produtos/munhequeira.jpg" }
];

// Tabela de juros por parcela
const jurosParcelas = {
    1: 0.000,
    2: 0.0609,
    3: 0.0701,
    4: 0.0791,
    5: 0.0880,
    6: 0.0967,
    7: 0.1259,
    8: 0.1342,
    9: 0.1425,
    10: 0.1506,
    11: 0.1587,
    12: 0.1666
};

// Inicializa o catálogo
window.onload = () => {
    produtos.forEach(p => adicionarProdutoNaCategoria(p));
    atualizarParcelas(0); // mostra todas as parcelas logo de início
};

function adicionarProdutoNaCategoria(produto) {
    const secao = document.getElementById(`produtos-${produto.categoria}`);

    const div = document.createElement("div");
    div.className = "produto";
    div.id = `card-${produto.id}`;
    div.innerHTML = `
    <img src="${produto.img}" alt="${produto.nome}">
    <h3>${produto.nome}</h3>
    <p>R$ ${produto.preco.toFixed(2)}</p>
    <div class="botoes-qtd" id="botoes-${produto.id}">
      <button onclick="adicionarAoCarrinho('${produto.id}')">Adicionar</button>
    </div>
  `;

    secao.appendChild(div);
}

function adicionarAoCarrinho(id) {
    const produto = produtos.find(p => p.id === id);
    const item = carrinho.find(p => p.id === id);

    if (item) {
        item.qtd++;
    } else {
        carrinho.push({ ...produto, qtd: 1 });
    }
    atualizarCarrinho();
    atualizarQuantidadeNoCard(id);
}

function alterarQtd(id, delta) {
    const item = carrinho.find(p => p.id === id);
    if (!item) return;

    item.qtd += delta;
    if (item.qtd <= 0) {
        carrinho = carrinho.filter(p => p.id !== id);
        restaurarBotaoCard(id);
    }
    atualizarCarrinho();
    atualizarQuantidadeNoCard(id);
}

function atualizarQuantidadeNoCard(id) {
    const item = carrinho.find(p => p.id === id);
    const botoes = document.getElementById(`botoes-${id}`);

    if (item) {
        botoes.innerHTML = `
      <button onclick="alterarQtd('${id}', -1)">-</button>
      <span>${item.qtd}</span>
      <button onclick="alterarQtd('${id}', 1)">+</button>
    `;
    } else {
        botoes.innerHTML = `<button onclick="adicionarAoCarrinho('${id}')">Adicionar</button>`;
    }
}

function restaurarBotaoCard(id) {
    const botoes = document.getElementById(`botoes-${id}`);
    botoes.innerHTML = `<button onclick="adicionarAoCarrinho('${id}')">Adicionar</button>`;
}

function atualizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach(item => {
        total += item.preco * item.qtd;
        const li = document.createElement("li");
        li.innerHTML = `
      ${item.nome} - R$ ${(item.preco * item.qtd).toFixed(2)}
      <button onclick="alterarQtd('${item.id}', -1)">-</button>
      <span>${item.qtd}</span>
      <button onclick="alterarQtd('${item.id}', 1)">+</button>
    `;
        lista.appendChild(li);
    });

    document.getElementById("total").textContent = `Total: R$ ${total.toFixed(2)}`;
    atualizarParcelas(total);
}

function atualizarParcelas(total) {
    const select = document.getElementById("parcelas");
    select.innerHTML = "<option value=''>Selecione...</option>";
    for (let i = 1; i <= 12; i++) {
        const juros = jurosParcelas[i];
        const totalComJuros = total * (1 + juros);
        const parcela = totalComJuros / i;
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${i}x de R$ ${parcela.toFixed(2)} (Total: R$ ${totalComJuros.toFixed(2)})`;
        select.appendChild(option);
    }
}

// 📦 Preenchimento automático via CEP
const cepInput = document.getElementById("cep");
cepInput.addEventListener("blur", () => {
    const cep = cepInput.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
            if (data.localidade !== "Natal") {
                alert("Desculpe, só entregamos em Natal/RN.");
                document.getElementById("rua").value = "";
            } else {
                document.getElementById("rua").value = data.logradouro;
            }
        });
});

// 📲 Enviar para o WhatsApp
function enviarPedido() {
    const nome = document.getElementById("nome").value;
    const rua = document.getElementById("rua").value;
    const cep = document.getElementById("cep").value;
    const numero = document.getElementById("numero").value;
    const complemento = document.getElementById("complemento").value;
    const tipo = document.getElementById("tipo-endereco").value;
    const pagamento = document.querySelector("input[name='pagamento']:checked").value;
    const parcelas = document.getElementById("parcelas").value;

    if (!nome || !rua || !numero || !complemento || !tipo || !pagamento || carrinho.length === 0) {
        alert("Preencha todos os campos e adicione produtos ao carrinho.");
        return;
    }

    let total = carrinho.reduce((sum, item) => sum + item.preco * item.qtd, 0);
    const juros = jurosParcelas[parcelas];
    const totalComJuros = total * (1 + juros);
    const valorParcela = totalComJuros / parcelas;

    let msg = `✨ *Bem-vindo à Body Prime Suplementos!* ✨\n`;
    msg += `Seu pedido foi iniciado com sucesso! 🛒\n`;
    msg += `────────────────────────────\n`;

    msg += `📦 *Itens do Carrinho:*\n`;
    carrinho.forEach(item => {
        msg += `• ${item.qtd}x ${item.nome} — R$ ${(item.preco * item.qtd).toFixed(2)}\n`;
    });

    msg += `────────────────────────────\n`;
    msg += `💰 *Pagamento:*\n`;
    msg += `Forma: ${pagamento}\n`;
    msg += `Parcelamento: ${parcelas}x de R$ ${valorParcela.toFixed(2)}\n`;
    msg += `Total com juros (se tiver): R$ ${totalComJuros.toFixed(2)}\n`;
    msg += `Total sem juros: R$ ${total.toFixed(2)}\n`;

    msg += `────────────────────────────\n`;
    msg += `🏠 *Endereço para entrega:*\n`;
    msg += `${rua}, ${numero} - ${complemento}\n`;
    msg += `CEP: ${cep}\n`;
    msg += `Tipo: ${tipo}\n`;

    msg += `👤 Nome: ${nome}\n`;
    msg += `────────────────────────────\n`;

    msg += `🚚 *Em breve você receberá o valor do frete!*\n`;
    msg += `⏳ O prazo de entrega é de até 30 minutos após confirmação do pagamento.\n`;
    msg += `\nAgradecemos pela preferência! 💪`;
    msg += `\nNão apague essa mensagem, ${nome}`;

    const url = `https://wa.me/5584991926432?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

