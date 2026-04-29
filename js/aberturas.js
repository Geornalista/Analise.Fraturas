<!-- frontend/js/aberturas.js -->
/**
 * Página: Análise de Aberturas
 */

async function inicializarAberturas() {
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
  }

  // Botão gerar gráfico
  const btnGerar = document.getElementById('btn-gerar-aberturas');
  if (btnGerar) {
    btnGerar.addEventListener('click', () => {
      const litofacies = selectLito.value;
      renderizarAberturas(litofacies);
    });
  }

  // Renderizar com primeira litofácies
  if (opcoes.litofacies && opcoes.litofacies.length > 0) {
    renderizarAberturas(opcoes.litofacies[0]);
  }
}

async function renderizarAberturas(litofacies,camada) {
  mostrarLoading('grafico-aberturas');

  const dados = await carregarJSON('aberturas_por_litofacies');
  if (!dados) {
    esconderLoading('grafico-aberturas');
    return;
  }

  // Filtrar por litofácies
  let valores = [];
  if (litofacies === 'Todas as Litofacies') {
    valores = dados.histograma?.valores || [];
  } else if (litofacies === 'LMC+LMT+MUD') {
    // Assumindo que o JSON já tem isso separado
    valores = dados.histograma?.valores || [];
  } else {
    valores = dados.histograma?.valores || [];
  }

  if (valores.length === 0) {
    document.getElementById('grafico-aberturas').innerHTML = 
      `<p style="text-align:center; color:#999;">Sem dados para ${litofacies}</p>`;
    return;
  }

  // Criar histograma com KDE
  const trace = {
    x: valores,
    type: 'histogram',
    nbinsx: 50,
    name: 'Frequência',
    marker: { color: '#17becf', opacity: 0.7 }
  };

  const layout = {
    title: `Distribuição da Abertura Média (${litofacies})`,
    xaxis: { title: 'Abertura média (mm)' },
    yaxis: { title: 'Frequência' },
    height: 500,
    barmode: 'overlay'
  };

  esconderLoading('grafico-aberturas');
  Plotly.newPlot('grafico-aberturas', [trace], layout, { responsive: true });

  // Mostrar estatísticas
  if (dados.stats_filtrados) {
    const stats = dados.stats_filtrados;
    const statsHtml = `
      <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
        <h4>Estatísticas (Dados Filtrados)</h4>
        <p><strong>Média:</strong> ${stats.media?.toFixed(2) || 'N/A'} mm</p>
        <p><strong>Mediana:</strong> ${stats.mediana?.toFixed(2) || 'N/A'} mm</p>
        <p><strong>Desvio Padrão:</strong> ${stats.std?.toFixed(2) || 'N/A'} mm</p>
        <p><strong>N de dados:</strong> ${stats.n || 0}</p>
      </div>
    `;
    document.getElementById('stats-aberturas').innerHTML = statsHtml;
  }
}

document.addEventListener('DOMContentLoaded', inicializarAberturas);
