const STORAGE_KEY = 'body-prime:carrinho';
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const produtos = [
    { id: 'c1', nome: 'Creatina Max Titanium 300g', preco: 89.9, categoria: 'creatina', img: 'imagens/produtos/creatinamax300.jpg' },
    { id: 'c2', nome: 'Creatina Integral Médica 300g', preco: 99.9, categoria: 'creatina', img: 'imagens/produtos/creatinaintegral300.jpg' },
    { id: 'c3', nome: 'Creatina Dux 300g', preco: 109.9, categoria: 'creatina', img: 'imagens/produtos/creatinadux300.jpg' },
    { id: 'p1', nome: 'Pré-treino Insane Clown', preco: 129.0, categoria: 'pre-treino', img: 'imagens/produtos/pretreinodemonslab.jpg' },
    { id: 'p2', nome: 'Pré-treino Epic 300g', preco: 179.0, categoria: 'pre-treino', img: 'imagens/produtos/epic.webp' },
    { id: 'p3', nome: 'Pré-treino Nuclear Rush 300g', preco: 179.0, categoria: 'pre-treino', img: 'imagens/produtos/pretreinobodyaction.jpg' },
    { id: 'w1', nome: 'Whey BodyAction Isolado 900g', preco: 149.9, categoria: 'whey', img: 'imagens/produtos/wheybodyaction900.jpg' },
    { id: 'w2', nome: 'Whey Integral Médica', preco: 119.9, categoria: 'whey', img: 'imagens/produtos/wheyintegral900.jpg' },
    { id: 'w3', nome: 'Whey Isolado Dux', preco: 199.9, categoria: 'whey', img: 'imagens/produtos/wheydux900.jpg' },
    { id: 't1', nome: 'Hot Growth', preco: 79.9, categoria: 'termogenico', img: 'imagens/produtos/hot.jpg' },
    { id: 't2', nome: 'Therma Integral', preco: 89.9, categoria: 'termogenico', img: 'imagens/produtos/thermogenicointegral.png' },
    { id: 't3', nome: 'Fire Black', preco: 64.9, categoria: 'termogenico', img: 'imagens/produtos/fireblack.webp' },
    { id: 'o1', nome: 'Coqueteleira', preco: 19.9, categoria: 'outros', img: 'imagens/produtos/coqteleira.jpg' },
    { id: 'o2', nome: 'Strap', preco: 34.9, categoria: 'outros', img: 'imagens/produtos/strap.jpg' },
    { id: 'o3', nome: 'Munhequeira', preco: 39.9, categoria: 'outros', img: 'imagens/produtos/munhequeira.jpg' }
];

const jurosParcelas = {
    1: 0.0,
    2: 0.0609,
    3: 0.0701,
    4: 0.0791,
    5: 0.088,
    6: 0.0967,
    7: 0.1259,
    8: 0.1342,
    9: 0.1425,
    10: 0.1506,
    11: 0.1587,
    12: 0.1666
};

let carrinho = [];
let resumoCarrinho = { total: 0, quantidade: 0 };
const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
const cardsProdutos = new Map();
const elementos = {};

document.addEventListener('DOMContentLoaded', () => {
    registrarElementosBase();
    inicializarCatalogo();
    restaurarCarrinhoDoStorage();
    atualizarCarrinho();
    configurarBusca();
    configurarFormulario();
    configurarAcoesCarrinho();
    configurarBotaoFlutuante();
    configurarCepLookup();
});

function registrarElementosBase() {
    elementos.listaCarrinho = document.getElementById('lista-carrinho');
    elementos.total = document.getElementById('total');
    elementos.carrinhoVazio = document.getElementById('carrinho-vazio');
    elementos.parcelas = document.getElementById('parcelas');
    elementos.botaoLimparCarrinho = document.getElementById('limpar-carrinho');
    elementos.formulario = document.getElementById('formulario');
    elementos.botaoFinalizar = document.getElementById('finalizar-pedido');
    elementos.campoBusca = document.getElementById('busca-produtos');
    elementos.botaoLimparBusca = document.getElementById('limpar-busca');
    elementos.mensagemSemResultados = document.getElementById('mensagem-sem-resultados');
    elementos.botaoFlutuante = document.getElementById('botao-carrinho-flutuante');
    elementos.secoesCategorias = Array.from(document.querySelectorAll('.categoria'));
    elementos.campoCep = document.getElementById('cep');
    elementos.campoRua = document.getElementById('rua');
    elementos.campoNumero = document.getElementById('numero');
    elementos.campoComplemento = document.getElementById('complemento');
    elementos.campoTipoEndereco = document.getElementById('tipo-endereco');
    elementos.campoNome = document.getElementById('nome');
}

function inicializarCatalogo() {
    produtos.forEach((produto) => {
        const container = document.getElementById(`produtos-${produto.categoria}`);
        if (!container) return;

        const card = criarCardProduto(produto);
        container.appendChild(card);
        cardsProdutos.set(produto.id, card);
        atualizarCardProduto(produto.id);
    });
}

function criarCardProduto(produto) {
    const card = document.createElement('article');
    card.className = 'produto';
    card.dataset.produtoId = produto.id;

    const imagem = document.createElement('img');
    imagem.src = produto.img;
    imagem.alt = produto.nome;

    const titulo = document.createElement('h3');
    titulo.textContent = produto.nome;

    const preco = document.createElement('p');
    preco.textContent = formatadorMoeda.format(produto.preco);

    const botoes = document.createElement('div');
    botoes.className = 'botoes-qtd';

    card.append(imagem, titulo, preco, botoes);
    return card;
}

function adicionarAoCarrinho(id) {
    const produto = produtosPorId.get(id);
    if (!produto) return;

    const itemExistente = carrinho.find((item) => item.id === id);
    if (itemExistente) {
        itemExistente.qtd += 1;
    } else {
        carrinho.push({ ...produto, qtd: 1 });
    }

    atualizarCarrinho();
    atualizarCardProduto(id);
}

function alterarQtd(id, delta) {
    const item = carrinho.find((produto) => produto.id === id);
    if (!item) return;

    item.qtd += delta;
    if (item.qtd <= 0) {
        removerItem(id);
        return;
    }

    atualizarCarrinho();
    atualizarCardProduto(id);
}

function removerItem(id) {
    carrinho = carrinho.filter((produto) => produto.id !== id);
    atualizarCarrinho();
    atualizarCardProduto(id);
}

function limparCarrinho() {
    if (carrinho.length === 0) return;
    carrinho = [];
    atualizarCarrinho();
    atualizarTodosOsCards();
}

function atualizarCarrinho() {
    const { total, quantidade } = renderizarCarrinho();
    resumoCarrinho = { total, quantidade };

    elementos.total.textContent = `Total: ${formatadorMoeda.format(total)}`;
    elementos.carrinhoVazio.hidden = quantidade > 0;

    preencherParcelas(total);
    atualizarDisponibilidadeParcelamento(total);
    atualizarBotaoFlutuante(total, quantidade);
    salvarCarrinho();
}

function renderizarCarrinho() {
    elementos.listaCarrinho.innerHTML = '';

    let total = 0;
    let quantidade = 0;

    carrinho.forEach((item) => {
        total += item.preco * item.qtd;
        quantidade += item.qtd;

        const li = document.createElement('li');
        li.dataset.produtoId = item.id;

        const info = document.createElement('div');
        info.className = 'item-info';

        const titulo = document.createElement('strong');
        titulo.textContent = item.nome;

        const subtotal = document.createElement('span');
        const precoUnitario = formatadorMoeda.format(item.preco);
        const subtotalFormatado = formatadorMoeda.format(item.preco * item.qtd);
        subtotal.textContent = `${item.qtd} × ${precoUnitario} = ${subtotalFormatado}`;

        info.append(titulo, subtotal);

        const acoes = document.createElement('div');
        acoes.className = 'item-acoes';

        const botaoDiminuir = criarBotaoCarrinho('−', () => alterarQtd(item.id, -1), 'Diminuir quantidade');
        const quantidadeAtual = document.createElement('span');
        quantidadeAtual.className = 'quantidade';
        quantidadeAtual.textContent = item.qtd;
        const botaoAumentar = criarBotaoCarrinho('+', () => alterarQtd(item.id, 1), 'Aumentar quantidade');
        const botaoRemover = criarBotaoCarrinho('Remover', () => removerItem(item.id), 'Remover item', 'remover-item');

        acoes.append(botaoDiminuir, quantidadeAtual, botaoAumentar, botaoRemover);
        li.append(info, acoes);
        elementos.listaCarrinho.appendChild(li);
    });

    elementos.carrinhoVazio.hidden = carrinho.length > 0;

    return { total, quantidade };
}

function criarBotaoCarrinho(texto, callback, ariaLabel, classeExtra) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = texto;
    if (ariaLabel) botao.setAttribute('aria-label', ariaLabel);
    if (classeExtra) botao.classList.add(classeExtra);
    botao.addEventListener('click', callback);
    return botao;
}

function preencherParcelas(total) {
    const select = elementos.parcelas;
    const valorAtual = select.value;
    select.innerHTML = '<option value="">Selecione...</option>';

    for (let i = 1; i <= 12; i += 1) {
        const juros = jurosParcelas[i] ?? 0;
        const totalComJuros = total * (1 + juros);
        const valorParcela = totalComJuros / i;

        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = `${i}x de ${formatadorMoeda.format(valorParcela)} (Total: ${formatadorMoeda.format(totalComJuros)})`;
        if (valorAtual === option.value) {
            option.selected = true;
        }
        select.appendChild(option);
    }

    if (!select.value || select.value === '') {
        select.value = '1';
    }
}

function atualizarDisponibilidadeParcelamento(total) {
    const pagamentoSelecionado = document.querySelector("input[name='pagamento']:checked");
    const podeParcelar = pagamentoSelecionado?.value === 'Crédito' && total > 0;

    elementos.parcelas.disabled = !podeParcelar;

    if (!podeParcelar) {
        elementos.parcelas.value = '1';
    } else if (!elementos.parcelas.value) {
        elementos.parcelas.value = '1';
    }
}

function atualizarBotaoFlutuante(total, quantidade) {
    if (!elementos.botaoFlutuante) return;

    if (quantidade === 0) {
        elementos.botaoFlutuante.hidden = true;
        return;
    }

    elementos.botaoFlutuante.hidden = false;
    const detalhes = elementos.botaoFlutuante.querySelector('.detalhes');
    if (detalhes) {
        detalhes.textContent = `${quantidade} ${quantidade === 1 ? 'item' : 'itens'} • ${formatadorMoeda.format(total)}`;
    }
}

function atualizarCardProduto(id) {
    const card = cardsProdutos.get(id);
    if (!card) return;

    const botoes = card.querySelector('.botoes-qtd');
    if (!botoes) return;

    botoes.innerHTML = '';

    const item = carrinho.find((produto) => produto.id === id);
    if (!item) {
        const botaoAdicionar = document.createElement('button');
        botaoAdicionar.type = 'button';
        botaoAdicionar.textContent = 'Adicionar';
        botaoAdicionar.addEventListener('click', () => adicionarAoCarrinho(id));
        botoes.appendChild(botaoAdicionar);
        return;
    }

    const botaoDiminuir = document.createElement('button');
    botaoDiminuir.type = 'button';
    botaoDiminuir.textContent = '−';
    botaoDiminuir.className = 'botao-quantidade';
    botaoDiminuir.addEventListener('click', () => alterarQtd(id, -1));

    const quantidadeAtual = document.createElement('span');
    quantidadeAtual.textContent = item.qtd;

    const botaoAumentar = document.createElement('button');
    botaoAumentar.type = 'button';
    botaoAumentar.textContent = '+';
    botaoAumentar.className = 'botao-quantidade';
    botaoAumentar.addEventListener('click', () => alterarQtd(id, 1));

    botoes.append(botaoDiminuir, quantidadeAtual, botaoAumentar);
}

function atualizarTodosOsCards() {
    produtos.forEach((produto) => atualizarCardProduto(produto.id));
}

function salvarCarrinho() {
    try {
        const dados = carrinho.map(({ id, qtd }) => ({ id, qtd }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch (erro) {
        console.error('Não foi possível salvar o carrinho:', erro);
    }
}

function restaurarCarrinhoDoStorage() {
    try {
        const dados = localStorage.getItem(STORAGE_KEY);
        if (!dados) return;

        const itens = JSON.parse(dados);
        carrinho = itens
            .map(({ id, qtd }) => {
                const produto = produtosPorId.get(id);
                if (!produto) return null;
                return { ...produto, qtd: Number(qtd) || 0 };
            })
            .filter((item) => item && item.qtd > 0);

        atualizarTodosOsCards();
    } catch (erro) {
        console.error('Não foi possível restaurar o carrinho:', erro);
    }
}

function configurarBusca() {
    if (!elementos.campoBusca) return;

    elementos.campoBusca.addEventListener('input', () => {
        aplicarFiltro(elementos.campoBusca.value);
    });

    if (elementos.botaoLimparBusca) {
        elementos.botaoLimparBusca.addEventListener('click', () => {
            elementos.campoBusca.value = '';
            aplicarFiltro('');
            elementos.campoBusca.focus();
        });
    }
}

function aplicarFiltro(termo) {
    const termoNormalizado = normalizarTexto(termo);
    let encontrouAlgum = false;

    cardsProdutos.forEach((card, id) => {
        const produto = produtosPorId.get(id);
        if (!produto) return;

        const textoBusca = normalizarTexto(`${produto.nome} ${produto.categoria}`);
        const corresponde = termoNormalizado === '' || textoBusca.includes(termoNormalizado);
        card.style.display = corresponde ? '' : 'none';
        if (corresponde) {
            encontrouAlgum = true;
        }
    });

    atualizarVisibilidadeCategorias();
    if (elementos.mensagemSemResultados) {
        elementos.mensagemSemResultados.hidden = encontrouAlgum || termoNormalizado === '';
    }
}

function atualizarVisibilidadeCategorias() {
    elementos.secoesCategorias.forEach((secao) => {
        const produtosVisiveis = Array.from(secao.querySelectorAll('.produto')).some((card) => card.style.display !== 'none');
        secao.classList.toggle('oculta', !produtosVisiveis);
    });
}

function configurarFormulario() {
    if (!elementos.formulario) return;

    elementos.botaoFinalizar?.addEventListener('click', enviarPedido);
    const radiosPagamento = elementos.formulario.querySelectorAll("input[name='pagamento']");
    radiosPagamento.forEach((radio) => {
        radio.addEventListener('change', () => atualizarDisponibilidadeParcelamento(resumoCarrinho.total));
    });
}

function configurarAcoesCarrinho() {
    elementos.botaoLimparCarrinho?.addEventListener('click', limparCarrinho);
}

function configurarBotaoFlutuante() {
    elementos.botaoFlutuante?.addEventListener('click', () => {
        document.getElementById('sacola')?.scrollIntoView({ behavior: 'smooth' });
    });
}

function configurarCepLookup() {
    if (!elementos.campoCep) return;

    elementos.campoCep.addEventListener('blur', () => {
        const cep = elementos.campoCep.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            elementos.campoRua.value = '';
            return;
        }

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then((resposta) => resposta.json())
            .then((dados) => {
                if (dados.erro) {
                    alert('CEP não encontrado.');
                    elementos.campoRua.value = '';
                    return;
                }

                if (dados.localidade && dados.localidade !== 'Natal') {
                    alert('Desculpe, no momento entregamos apenas em Natal/RN.');
                    elementos.campoRua.value = '';
                    return;
                }

                elementos.campoRua.value = dados.logradouro || '';
            })
            .catch(() => {
                alert('Não foi possível consultar o CEP agora. Tente novamente mais tarde.');
            });
    });
}

function enviarPedido() {
    if (carrinho.length === 0) {
        alert('Adicione produtos à sacola antes de continuar.');
        return;
    }

    const nome = elementos.campoNome?.value.trim();
    const rua = elementos.campoRua?.value.trim();
    const cep = elementos.campoCep?.value.trim();
    const numero = elementos.campoNumero?.value.trim();
    const complemento = elementos.campoComplemento?.value.trim();
    const tipo = elementos.campoTipoEndereco?.value;
    const pagamentoSelecionado = document.querySelector("input[name='pagamento']:checked");
    const pagamento = pagamentoSelecionado?.value;

    if (!nome || !rua || !numero || !complemento || !tipo || !pagamento) {
        alert('Preencha todos os campos obrigatórios para continuar.');
        return;
    }

    let parcelas = 1;
    if (!elementos.parcelas.disabled) {
        parcelas = Number(elementos.parcelas.value);
        if (!parcelas) {
            alert('Selecione uma opção de parcelamento.');
            return;
        }
    }

    const total = resumoCarrinho.total;
    const juros = jurosParcelas[parcelas] ?? 0;
    const totalComJuros = total * (1 + juros);
    const valorParcela = totalComJuros / parcelas;

    let mensagem = `✨ *Bem-vindo à Body Prime Suplementos!* ✨\n`;
    mensagem += 'Seu pedido foi iniciado com sucesso! 🛒\n';
    mensagem += '────────────────────────────\n';
    mensagem += '📦 *Itens do Carrinho:*\n';

    carrinho.forEach((item) => {
        mensagem += `• ${item.qtd}x ${item.nome} — ${formatadorMoeda.format(item.preco * item.qtd)}\n`;
    });

    mensagem += '────────────────────────────\n';
    mensagem += '💰 *Pagamento:*\n';
    mensagem += `Forma: ${pagamento}\n`;
    mensagem += `Parcelamento: ${parcelas}x de ${formatadorMoeda.format(valorParcela)}\n`;
    mensagem += `Total com juros (se houver): ${formatadorMoeda.format(totalComJuros)}\n`;
    mensagem += `Total sem juros: ${formatadorMoeda.format(total)}\n`;

    mensagem += '────────────────────────────\n';
    mensagem += '🏠 *Endereço para entrega:*\n';
    mensagem += `${rua}, ${numero} - ${complemento}\n`;
    mensagem += `CEP: ${cep}\n`;
    mensagem += `Tipo: ${tipo}\n`;

    mensagem += `👤 Nome: ${nome}\n`;
    mensagem += '────────────────────────────\n';
    mensagem += '🚚 *Em breve você receberá o valor do frete!*\n';
    mensagem += '⏳ O prazo de entrega é de até 20 minutos após confirmação do pagamento.\n';
    mensagem += `\nAgradecemos pela preferência! 💪\n`;
    mensagem += `\nNão apague essa mensagem, ${nome}`;

    const url = `https://wa.me/5584991926432?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}
