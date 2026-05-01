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
    // Lógica para Gráfico 1: Fraturas por Afloramento
    // ==========================================
    const afloramentos = dados.por_afloramento || [];
    const containerAflsId = 'grafico-afloramentos';
    const containerAfls = document.getElementById(containerAflsId);
    
    if (afloramentos.length > 0 && containerAfls) {
      const dadosAfls = {
        labels: afloramentos.map(d => d.afloramento),
        values: afloramentos.map(d => d.total)
      };
      criarControleGrafico(containerAflsId, dadosAfls, 'Quantidade de Fraturas por Afloramento', '#1f77b4', 'Afloramento');
    } else if (containerAfls) {
      containerAfls.innerHTML = '<p style="text-align:center; color:#999;">Sem dados de afloramentos disponíveis.</p>';
    }

    // ==========================================
    // Lógica para Gráfico 2: Fraturas por Camada
    // ==========================================
    const camadas = dados.por_camada || [];
    const containerCamadasId = 'grafico-camadas';
    const containerCamadas = document.getElementById(containerCamadasId);

    if (camadas.length > 0 && containerCamadas) {
      const dadosCamadas = {
        labels: camadas.map(d => d.camada),
        values: camadas.map(d => d.total)
      };
      criarControleGrafico(containerCamadasId, dadosCamadas, 'Quantidade de Fraturas por Camada', '#2ca02c', 'Camada');
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

/**
 * Função auxiliar que injeta o seletor (Dropdown) e renderiza o gráfico inicial
 */
function criarControleGrafico(containerId, dadosObj, titulo, corBarra, labelEixoX) {
  const container = document.getElementById(containerId);
  
  // 1. Cria a div com os controles
  const controlesDiv = document.createElement('div');
  controlesDiv.style.marginBottom = '15px';
  controlesDiv.style.textAlign = 'right';

  const label = document.createElement('label');
  label.textContent = 'Tipo de Gráfico: ';
  label.style.fontWeight = 'bold';
  label.style.marginRight = '10px';
  label.style.color = '#1a365d';

  const select = document.createElement('select');
  select.style.padding = '6px';
  select.style.borderRadius = '4px';
  select.style.border = '1px solid #cbd5e1';
  select.style.cursor = 'pointer';

  const optBar = document.createElement('option');
  optBar.value = 'bar';
  optBar.textContent = 'Gráfico de Barras';

  const optPie = document.createElement('option');
  optPie.value = 'pie';
  optPie.textContent = 'Gráfico de Pizza';

  select.appendChild(optBar);
  select.appendChild(optPie);

  controlesDiv.appendChild(label);
  controlesDiv.appendChild(select);

  // Insere os controles logo antes da div do gráfico
  container.parentNode.insertBefore(controlesDiv, container);

  // 2. Renderiza o gráfico inicial (Barras)
  renderizarPlotly(containerId, 'bar', dadosObj, titulo, corBarra, labelEixoX);

  // 3. Adiciona o evento para mudar o tipo de gráfico
  select.addEventListener('change', (e) => {
    const tipo = e.target.value;
    renderizarPlotly(containerId, tipo, dadosObj, titulo, corBarra, labelEixoX);
  });
}

/**
 * Função auxiliar para desenhar o gráfico com base no tipo escolhido
 */
function renderizarPlotly(containerId, tipo, dadosObj, titulo, corBarra, labelEixoX) {
  let trace;
  let layout;

  if (tipo === 'bar') {
    trace = {
      x: dadosObj.labels,
      y: dadosObj.values,
      type: 'bar',
      marker: { color: corBarra }
    };
    layout = {
      title: titulo,
      xaxis: { title: labelEixoX },
      yaxis: { title: 'Total de Fraturas' },
      height: 400,
      margin: { b: 100 }
    };
  } else if (tipo === 'pie') {
    trace = {
      labels: dadosObj.labels,
      values: dadosObj.values,
      type: 'pie',
      hoverinfo: 'label+percent+value',
      textinfo: 'percent', // Mostra apenas a percentagem na fatia para não poluir
      marker: {
        // Deixa o Plotly usar a sua paleta de cores padrão para pizza
      }
    };
    layout = {
      title: titulo,
      height: 450,
      margin: { t: 50, b: 50, l: 20, r: 20 }
    };
  }

  // Limpa o container e plota
  document.getElementById(containerId).innerHTML = '';
  Plotly.newPlot(containerId, [trace], layout, { responsive: true });
}

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', inicializarDistribuicao);
