// frontend/js/espessura-abertura.js
/**
 * Página: Espessura da Camada vs. Abertura Média
 */

async function inicializarEspessuraAbertura() {
  const opcoes = await carregarJSON('opcoes');
  if (!opcoes) return;

  // Preencher dropdown de litofácies
  const selectLito = document.getElementById('litofacies-select');
  if (selectLito && opcoes.litofacies) {
    opcoes.litofacies.forEach(lito => {
      const option = document.createElement('option');
      option.value = lito;
      option.textContent = lito;
      selectLito.appendChild(option);
    });
    selectLito.addEventListener('change', () => renderizarEspessuraAbertura(selectLito.value));
  }

  // Renderizar com primeira litofácies
  if (opcoes.litofacies && opcoes.litofacies.length > 0) {
    renderizarEspessuraAbertura(opcoes.litofacies[0]);
  }
}

async function renderizarEspessuraAbertura(litofacies) {
  mostrarLoading('grafico-espessura-abertura');

  const dados = await carregarJSON('espessura_abertura');
  if (!dados) {
    esconderLoading('grafico-espessura-abertura');
    return;
  }

  let dadosFiltrados = dados.dados || [];
  if (litofacies !== 'Todas as Litofacies') {
    dadosFiltrados = dadosFiltrados.filter(d => d.litofacies === litofacies);
  }

  if (dadosFiltrados.length === 0) {
    document.getElementById('grafico-espessura-abertura').innerHTML = 
      `<p style="text-align:center; color:#999;">Sem dados para ${litofacies}</p>`;
    esconderLoading('grafico-espessura-abertura');
    return;
  }

  // Agrupar por litofácies para o boxplot
  const grupos = {};
  dadosFiltrados.forEach(d => {
    if (!grupos[d.litofacies]) {
      grupos[d.litofacies] = [];
    }
    grupos[d.litofacies].push(d.abertura_media);
  });

  // Criar traces para cada litofácies
  const traces = Object.keys(grupos).map(lito => ({
    y: grupos[lito],
    name: lito,
    type: 'box',
    boxmean: 'sd'
  }));

  const layout = {
    title: `Espessura da Camada vs. Abertura Média - ${litofacies}`,
    yaxis: {
      title: 'Abertura Média (mm)'
    },
    height: 500
  };

  esconderLoading('grafico-espessura-abertura');
  Plotly.newPlot('grafico-espessura-abertura', traces, layout, { responsive: true });
}

document.addEventListener('DOMContentLoaded', inicializarEspessuraAbertura);
