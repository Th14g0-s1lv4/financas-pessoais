const API = 'http://localhost:3000/api';

function formatarValor(valor) {
  return (valor ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

async function carregarResumo() {
  const res   = await fetch(`${API}/resumo`);
  const data  = await res.json();

  document.getElementById('saldo').textContent    = formatarValor(data.saldo);
  document.getElementById('receitas').textContent = formatarValor(data.total_receitas);
  document.getElementById('despesas').textContent = formatarValor(data.total_despesas);
}

async function carregarTransacoes(mes = '') {
  const url  = mes ? `${API}/transacoes?mes=${mes}` : `${API}/transacoes`;
  const res  = await fetch(url);
  const list = await res.json();

  const tbody = document.getElementById('lista');

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:#94A3B8; padding: 32px;">
          Nenhuma transação encontrada.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(t => `
    <tr class="${t.tipo}">
      <td>${formatarData(t.data)}</td>
      <td>${t.descricao}</td>
      <td>${t.categoria}</td>
      <td>
        <span class="badge badge-${t.tipo}">
          ${t.tipo === 'receita' ? 'Receita' : 'Despesa'}
        </span>
      </td>
      <td class="valor-${t.tipo}">
        ${t.tipo === 'receita' ? '+' : '-'} ${formatarValor(t.valor)}
      </td>
      <td>
        <button class="btn-deletar" onclick="deletar(${t.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

async function deletar(id) {
  await fetch(`${API}/transacoes/${id}`, { method: 'DELETE' });
  carregarResumo();
  carregarTransacoes(document.getElementById('filtro-mes').value);
}

document.getElementById('btn-adicionar').addEventListener('click', async () => {
  const descricao  = document.getElementById('descricao').value.trim();
  const valor      = parseFloat(document.getElementById('valor').value);
  const tipo       = document.getElementById('tipo').value;
  const categoria  = document.getElementById('categoria').value;
  const data       = document.getElementById('data').value;

  if (!descricao || !valor || !tipo || !categoria || !data) {
    alert('Preencha todos os campos!');
    return;
  }

  await fetch(`${API}/transacoes`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ descricao, valor, tipo, categoria, data }),
  });

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value     = '';
  document.getElementById('tipo').value      = '';
  document.getElementById('categoria').value = '';
  document.getElementById('data').value      = '';

  carregarResumo();
  carregarTransacoes(document.getElementById('filtro-mes').value);
});

document.getElementById('filtro-mes').addEventListener('change', (e) => {
  carregarTransacoes(e.target.value);
});

carregarResumo();
carregarTransacoes();