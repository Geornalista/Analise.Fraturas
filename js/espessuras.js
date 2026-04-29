// frontend/js/espessuras.js
/**
 * Página: Espessura da Camada vs. Abertura Média
 */

async function inicializarEspessuras() {
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
    selectLito.addEventListener('change', () => renderizarEspessuras(selectLito.value));
  }

  // Renderizar com primeira litofácies
  if (opcoes.litofacies && opcoes.litofacies.length > 0) {
    renderizarEspessuras(opcoes.litofacies[0]);
  }
}

async function renderizarEspessuras(litofacies) {
  mostrarLoading('grafico-espessura-abertura');

  const dados = await carregarJSON('espessura-abertura');
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
    return;
  }

  // Agrupar por classe de espessura
  const grupos = {};
  dadosFiltrados.forEach(d => {
    const classe = d.classe_espessura || 'Sem classe';
    if (!grupos[classe]) {
      grupos[classe] = [];
    }
    grupos[classe].push(d.abertura_media);
  });

  // Criar boxplots para cada classe
  const traces = Object.keys(grupos).map(classe => ({
    y: grupos[classe],
    name: classe,
    type: 'box',
    boxmean: 'sd'
  }));

  const layout = {
    title: `Boxplot — Espessura da Camada vs. Abertura Média (${litofacies})`,
    yaxis: {
      title: 'Abertura Média (mm)',
      zeroline: false
    },
    xaxis: {
      title: 'Classe de Espessura'
    },
    height: 500
  };

  esconderLoading('grafico-espessura-abertura');
  Plotly.newPlot('grafico-espessura-abertura', traces, layout, { responsive: true });
}

document.addEventListener('DOMContentLoaded', inicializarEspessuras);
