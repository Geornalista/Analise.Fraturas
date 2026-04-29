<!-- frontend/js/tamanhos.js -->
/**
 * Página: Análise de Tamanhos (Altura da Estrutura)
 */

async function inicializarTamanhos() {
  const opcoes = await carregarJSON('opcoes');
  if (!opcoes) return;

  // Preencher dropdowns
  const selectLito = document.getElementById('litofacies-select');
  const selectCamada = document.getElementById('camada-select');

  if (selectLito && opcoes.litofacies) {
    opcoes.litofacies.forEach(lito => {
      const option = document.createElement('option');
      option.value = lito;
      option.textContent = lito;
      selectLito.appendChild(option);
    });
  }

  if (selectCamada && opcoes.camadas) {
    opcoes.camadas.forEach(cam => {
      const option = document.createElement('option');
      option.value = cam;
      option.textContent = cam;
      selectCamada.appendChild(option);
    });
  }

  // Listeners para mudanças
  if (selectLito) selectLito.addEventListener('change', () => renderizarTamanhos());
  if (selectCamada) selectCamada.addEventListener('change', () => renderizarTamanhos());

  // Renderizar inicial
  renderizarTamanhos();
}

async function renderizarTamanhos(litofacies, camada) {
  mostrarLoading('grafico-tamanhos');

  const selectLito = document.getElementById('litofacies-select');
  const selectCamada = document.getElementById('camada-select');
  const litofacies = selectLito?.value || 'Todas as Litofacies';
  const camada = selectCamada?.value || 'Todas as Camadas';

  const dados = await carregarJSON('tamanhos_por_litofacies');
  if (!dados) {
    esconderLoading('grafico-tamanhos');
    return;
  }

  const valores = dados.valores || [];

  if (valores.length === 0) {
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999;">Sem dados</p>`;
    return;
  }

  const trace = {
    x: valores,
    type: 'histogram',
    nbinsx: 50,
    marker: { color: '#2ca02c', opacity: 0.7 }
  };

  const layout = {
    title: `Distribuição da Altura da Estrutura (${litofacies} - ${camada})`,
    xaxis: { title: 'Altura (cm)' },
    yaxis: { title: 'Frequência' },
    height: 500
  };

  esconderLoading('grafico-tamanhos');
  Plotly.newPlot('grafico-tamanhos', [trace], layout, { responsive: true });
}

document.addEventListener('DOMContentLoaded', inicializarTamanhos);
