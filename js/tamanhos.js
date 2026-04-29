/**
 * Página: Análise de Tamanhos (Altura da Estrutura)
 */

let dadosGlobais = null;

async function inicializarTamanhos() {
  try {
    // Busca o arquivo JSON na pasta data (ajuste o caminho se necessário)
    // Se você já tem uma função carregarJSON('tamanhos.json') no config.js, você pode usá-la aqui.
    const response = await fetch('../data/tamanhos.json');
    if (!response.ok) throw new Error('Falha ao carregar o JSON');
    dadosGlobais = await response.json();
  } catch (erro) {
    console.error("Erro ao carregar os dados:", erro);
    document.getElementById('grafico-tamanhos').innerHTML = '<p>Erro ao carregar dados.</p>';
    return;
  }

  // 1. Usar os IDs corretos que estão no arquivo HTML
  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');

  // 2. Preencher dropdown de Litofácies com as chaves do próprio JSON
  if (selectLito && dadosGlobais) {
    const litofaciesDisponiveis = Object.keys(dadosGlobais);
    
    litofaciesDisponiveis.forEach(lito => {
      const option = document.createElement('option');
      option.value = lito;
      option.textContent = lito;
      selectLito.appendChild(option);
    });
  }

  // 3. Preencher o dropdown de camada (o JSON atual não separa por camada, 
  // então vamos adicionar uma opção geral e desabilitá-lo por enquanto)
  if (selectCamada) {
    const option = document.createElement('option');
    option.value = 'Todas as Camadas';
    option.textContent = 'Todas as Camadas';
    selectCamada.appendChild(option);
    selectCamada.disabled = true; // Desabilita para não confundir o usuário
  }

  // Listeners para atualizar o gráfico ao mudar as opções
  if (selectLito) selectLito.addEventListener('change', renderizarTamanhos);
  if (selectCamada) selectCamada.addEventListener('change', renderizarTamanhos);

  // Renderizar o gráfico inicial
  renderizarTamanhos();
}

function renderizarTamanhos() {
  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');
  
  const litofacies = selectLito?.value || 'Todas as Litofacies';
  const camada = selectCamada?.value || 'Todas as Camadas';

  // Verifica se a litofácies existe no JSON
  if (!dadosGlobais || !dadosGlobais[litofacies]) {
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999;">Sem dados para esta seleção</p>`;
    return;
  }

  // Pega o array de "valores" de dentro da litofácies escolhida
  const valores = dadosGlobais[litofacies].valores || [];

  if (valores.length === 0) {
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999;">Sem dados suficientes</p>`;
    return;
  }

  // Configuração do Gráfico Plotly
  const trace = {
    x: valores,
    type: 'histogram',
    nbinsx: 30, // Quantidade de barras
    marker: { color: '#1a365d', opacity: 0.8 }, // Cor ajustada para combinar com o layout
    name: litofacies
  };

  const layout = {
    title: `Distribuição da Altura da Estrutura (${litofacies})`,
    xaxis: { title: 'Altura (cm)' },
    yaxis: { title: 'Frequência' },
    height: 500,
    margin: { t: 50, l: 50, r: 20, b: 50 }
  };

  // Limpa o container antes de plotar
  document.getElementById('grafico-tamanhos').innerHTML = '';
  Plotly.newPlot('grafico-tamanhos', [trace], layout, { responsive: true });
}

// Inicia o script quando a página terminar de carregar
document.addEventListener('DOMContentLoaded', inicializarTamanhos);
