/**
 * Página: Distribuição Geral de Fraturas
 */

async function inicializarDistribuicao() {
  try {
    console.log("Iniciando busca dos dados de distribuição...");
    
    // Lista de possíveis caminhos para o JSON dependendo da estrutura do GitHub Pages
    const caminhosPossiveis = [
      '../data/distribuicao.json',
      '../../data/distribuicao.json',
      './data/distribuicao.json',
      '/data/distribuicao.json'
    ];

    let response = null;

    // Tenta procurar o arquivo nos vários caminhos
    for (const caminho of caminhosPossiveis) {
      try {
        const res = await fetch(caminho);
        if (res.ok) {
          response = res;
          break; 
        }
      } catch (e) {
        // Ignora erros de rede aqui para tentar o próximo caminho
      }
    }

    if (!response) {
      throw new Error("Arquivo distribuicao.json não encontrado.");
    }

    const textData = await response.text();
    // Limpa eventuais 'NaN' que o Python possa ter exportado
    const jsonCorrigido = textData.replace(/:\s*NaN/g, ': null');
    const dados = JSON.parse(jsonCorrigido);

    // ==========================================
    // Gráfico 1: Fraturas por Afloramento
    // ==========================================
    const afloramentos = dados.por_afloramento || [];
    const containerAfls = document.getElementById('grafico-afloramentos');
    
    if (afloramentos.length > 0 && containerAfls) {
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
      
      containerAfls.innerHTML = '';
      Plotly.newPlot('grafico-afloramentos', [traceAfls], layoutAfls, { responsive: true });
    } else if (containerAfls) {
      containerAfls.innerHTML = '<p style="text-align:center; color:#999;">Sem dados de afloramentos disponíveis.</p>';
    }

    // ==========================================
    // Gráfico 2: Fraturas por Camada
    // ==========================================
    const camadas = dados.por_camada || [];
    const containerCamadas = document.getElementById('grafico-camadas');

    if (camadas.length > 0 && containerCamadas) {
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
        margin: { b: 100 } // Margem inferior maior para não cortar nomes grandes
      };
      
      containerCamadas.innerHTML = '';
      Plotly.newPlot('grafico-camadas', [traceCamadas], layoutCamadas, { responsive: true });
    } else if (containerCamadas) {
      containerCamadas.innerHTML = '<p style="text-align:center; color:#999;">Sem dados de camadas disponíveis.</p>';
    }

  } catch (erro) {
    console.error("Erro fatal ao carregar os dados:", erro);
    const erroHtml = `
      <div style="text-align: center; color: #dc2626; padding: 2rem; border: 1px dashed #dc2626; border-radius: 8px;">
        <h3>⚠️ Erro ao carregar os dados</h3>
        <p><strong>Detalhe técnico:</strong> ${erro.message}</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 1rem;">
          Verifique se o arquivo <code>distribuicao.json</code> existe na pasta <code>data</code> no GitHub e se as letras maiúsculas/minúsculas estão corretas.
        </p>
      </div>`;
    
    document.getElementById('grafico-afloramentos').innerHTML = erroHtml;
    document.getElementById('grafico-camadas').innerHTML = '';
  }
}

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarDistribuicao);
