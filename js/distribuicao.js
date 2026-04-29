<!-- frontend/js/distribuicao.js -->
/**
 * Página: Distribuição Geral de Fraturas
 */

async function inicializarDistribuicao() {
  const dados = await carregarJSON('distribuicao');
  if (!dados) return;

  // Gráfico 1: Fraturas por Afloramento
  const afloramentos = dados.por_afloramento || [];
  if (afloramentos.length > 0) {
    const traceAfls = {
      x: afloramentos.map(d => d.afloramento),
      y: afloramentos.map(d => d.total),
      type: 'bar',
      marker: { color: '#1f77b4' }
    };
    const layoutAfls = {
      title: 'Quantidade de Fraturas por Afloramento',
      xaxis: { title: 'Afloramento' },
      yaxis: { title: 'Total de Fraturas' },
      height: 400,
      margin: { b: 100 }
    };
    Plotly.newPlot('grafico-afloramentos', [traceAfls], layoutAfls, { responsive: true });
  }

  // Gráfico 2: Fraturas por Camada
  const camadas = dados.por_camada || [];
  if (camadas.length > 0) {
    const traceCamadas = {
      x: camadas.map(d => d.camada),
      y: camadas.map(d => d.total),
      type: 'bar',
      marker: { color: '#2ca02c' }
    };
    const layoutCamadas = {
      title: 'Quantidade de Fraturas por Camada',
      xaxis: { title: 'Camada' },
      yaxis: { title: 'Total de Fraturas' },
      height: 400,
      margin: { b: 100 }
    };
    Plotly.newPlot('grafico-camadas', [traceCamadas], layoutCamadas, { responsive: true });
  }
}

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarDistribuicao);
