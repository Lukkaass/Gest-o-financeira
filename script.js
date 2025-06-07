const form = document.getElementById("financeForm");
const recordsDiv = document.getElementById("records");
const saldoDiv = document.getElementById("saldo");
const filtroMes = document.getElementById("filtroMes");
const ctx = document.getElementById("graficoFinanceiro").getContext("2d");

let registros = JSON.parse(localStorage.getItem("registros")) || [];
let grafico;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const subtipo = document.getElementById("subtipo").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;
  const conta = document.getElementById("conta").value;
  const recorrencia = document.getElementById("recorrencia").value;
  const data = document.getElementById("data").value;

  const registro = {
    tipo, subtipo, descricao, valor, categoria, conta, recorrencia, data
  };

  registros.push(registro);
  localStorage.setItem("registros", JSON.stringify(registros));
  atualizarTela();
  form.reset();
});

filtroMes.addEventListener("change", atualizarTela);

function atualizarTela() {
  recordsDiv.innerHTML = "";
  let saldoTemp = 0;
  const receitas = [];
  const despesas = [];
  const datas = [];

  const mesSelecionado = filtroMes.value;
  const filtrados = registros.filter(r => !mesSelecionado || r.data.startsWith(mesSelecionado));

  filtrados.forEach((r, index) => {
    recordsDiv.innerHTML += `
      <div class="record">
        <strong>${r.tipo} ${r.subtipo}</strong>: R$ ${r.valor.toFixed(2)} — ${r.descricao} <br/>
        <em>Categoria:</em> ${r.categoria} | <em>Conta:</em> ${r.conta} | <em>Recorrência:</em> ${r.recorrencia} | <em>Data:</em> ${r.data}
        <br/><button onclick="removerRegistro(${index})" class="remover">Remover</button>
      </div>
    `;
    if (r.tipo === "Receita") saldoTemp += r.valor;
    else saldoTemp -= r.valor;

    datas.push(r.data);
    receitas.push(r.tipo === "Receita" ? r.valor : 0);
    despesas.push(r.tipo !== "Receita" ? r.valor : 0);
  });

  saldoDiv.innerText = `Saldo Atual: R$ ${saldoTemp.toFixed(2)}`;
  atualizarGrafico(datas, receitas, despesas);
}

function removerRegistro(index) {
  const mesSelecionado = filtroMes.value;
  const filtrados = registros.filter(r => !mesSelecionado || r.data.startsWith(mesSelecionado));
  const itemRemovido = filtrados[index];

  const posicaoOriginal = registros.findIndex(r =>
    r.tipo === itemRemovido.tipo &&
    r.subtipo === itemRemovido.subtipo &&
    r.descricao === itemRemovido.descricao &&
    r.valor === itemRemovido.valor &&
    r.data === itemRemovido.data
  );

  if (posicaoOriginal !== -1) {
    registros.splice(posicaoOriginal, 1);
    localStorage.setItem("registros", JSON.stringify(registros));
    atualizarTela();
  }
}

function atualizarGrafico(labels, dadosReceita, dadosDespesa) {
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: dadosReceita,
          backgroundColor: '#238636'
        },
        {
          label: 'Despesas/Custos',
          data: dadosDespesa,
          backgroundColor: '#da3633'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Fluxo Financeiro' }
      }
    }
  });
}

// Inicializa ao carregar a página
atualizarTela();