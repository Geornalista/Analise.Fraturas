<!-- frontend/js/p21.js -->
/**
 * Página: P21 por Camada
 */

async function inicializarP21() {
  // Carregar opções
  const opcoes = await carregarJSON('opcoes');
  if (!opcoes) return;

  // Preencher dropdown de afloramentos
  const selectAfl = document.getElementById('afloramento-select');
  if (selectAfl && opcoes.afloramentos) {
    opcoes.afloramentos.forEach(afl => {
      const option = document.createElement('option');
      option.value = afl;
      option.textContent = afl;
      selectAfl.appendChild(option);
    });
    selectAfl.addEventListener('change', () => renderizarP21(selectAfl.value));
  }

  // Renderizar com primeiro afloramento
  if (opcoes.afloramentos && opcoes.afloramentos.length > 0) {
    renderizarP21(opcoes.afloramentos[0]);
  }
}

async function renderizarP21(afloramento) {
  mostrarLoading('grafico-p21');

  const dados = await carregarJSON('p21_por_camada');
  if (!dados) {
    esconderLoading('grafico-p21');
    return;
  }

  // Filtrar por afloramento
  const p21_afl = dados.filter(d => d.afloramento === afloramento);

  if (p21_afl.length === 0) {
    document.getElementById('grafico-p21').innerHTML = 
      `<p style="text-align:center; color:#999;">Sem dados para ${afloramento}</p>`;
    return;
  }

  // Ordenar por P21 decrescente
  p21_afl.sort((a, b) => b.p21 - a.p21);

  const trace = {
    x: p21_afl.map(d => d.camada),
    y: p21_afl.map(d => d.p21),
    type: 'bar',
    marker: { color: '#ff7f0e' }
  };

  const layout = {
    title: `P21 por Camada - ${afloramento}`,
    xaxis: { title: 'Camada' },
    yaxis: { title: 'P21 (m/m²)' },
    height: 500,
    margin: { b: 120 }
  };

  esconderLoading('grafico-p21');
  Plotly.newPlot('grafico-p21', [trace], layout, { responsive: true });
}

document.addEventListener('DOMContentLoaded', inicializarP21);
