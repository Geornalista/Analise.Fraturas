/**
 * Página: Análise de Tamanhos (Altura da Estrutura)
 */

let dadosGlobais = null;

async function inicializarTamanhos() {
  try {
    console.log("Iniciando busca dos dados...");
    
    // Lista de possíveis caminhos para o novo JSON
    // Coloquei opções com e sem acento para evitar erros no GitHub Pages
    const caminhosPossiveis = [
      '../data/tamanhos_por_litofácies.json',    
      '../../data/tamanhos_por_litofácies.json', 
      '../data/tamanhos_por_litofacies.json',    // Sem acento (fallback)
      './data/tamanhos_por_litofácies.json',     
      '/data/tamanhos_por_litofácies.json'       
    ];

    let response = null;
    let caminhoSucesso = '';

    for (const caminho of caminhosPossiveis) {
      try {
        console.log(`Tentando buscar em: ${caminho}`);
        const res = await fetch(caminho);
        if (res.ok) {
          response = res;
          caminhoSucesso = caminho;
          break; 
        }
      } catch (e) {
        // Ignora erros de rede aqui para tentar o próximo caminho
      }
    }

    if (response) {
      const textData = await response.text();
      
      // Continua corrigindo o problema dos 'NaN' gerados pelo Python
      const jsonCorrigido = textData.replace(/:\s*NaN/g, ': null');
      
      dadosGlobais = JSON.parse(jsonCorrigido);
      console.log(`Sucesso! Arquivo encontrado em: ${caminhoSucesso}`);
    } else {
      throw new Error("Nenhum dos caminhos testados retornou o arquivo tamanhos_por_litofácies.json. Verifique o nome do arquivo na pasta 'data'.");
    }

  } catch (erro) {
    console.error("Erro fatal ao carregar os dados:", erro);
    
    document.getElementById('grafico-tamanhos').innerHTML = `
      <div style="text-align: center; color: #dc2626; padding: 2rem; border: 1px dashed #dc2626; border-radius: 8px;">
        <h3>⚠️ Erro ao carregar os dados</h3>
        <p><strong>Detalhe técnico:</strong> ${erro.message}</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 1rem;">
          Abra o "Console" apertando F12 para ver mais detalhes.
        </p>
      </div>`;
    return;
  }

  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');

  if (dadosGlobais) {
    // Usamos 'Set' para armazenar apenas valores únicos (sem repetição)
    const litofaciesSet = new Set();
    const camadasSet = new Set();

    // Extrai as litofácies e camadas separadas pelo |
    Object.keys(dadosGlobais).forEach(chave => {
      const partes = chave.split('|');
      if (partes.length === 2) {
        litofaciesSet.add(partes[0]);
        camadasSet.add(partes[1]);
      }
    });

    // Preenche o dropdown de Litofácies
    if (selectLito) {
      selectLito.innerHTML = '';
      Array.from(litofaciesSet).sort().forEach(lito => {
        const option = document.createElement('option');
        option.value = lito;
        option.textContent = lito;
        selectLito.appendChild(option);
      });
      // Deixa "Todas as Litofacies" como padrão se existir
      if (litofaciesSet.has('Todas as Litofacies')) {
        selectLito.value = 'Todas as Litofacies';
      }
    }

    // Preenche o dropdown de Camadas
    if (selectCamada) {
      selectCamada.innerHTML = '';
      Array.from(camadasSet).sort().forEach(cam => {
        const option = document.createElement('option');
        option.value = cam;
        option.textContent = cam;
        selectCamada.appendChild(option);
      });
      selectCamada.disabled = false;
      // Deixa "Todas as Camadas" como padrão se existir
      if (camadasSet.has('Todas as Camadas')) {
        selectCamada.value = 'Todas as Camadas';
      }
    }
  }

  // Adiciona os eventos de mudança
  if (selectLito) selectLito.addEventListener('change', renderizarTamanhos);
  if (selectCamada) selectCamada.addEventListener('change', renderizarTamanhos);

  // Renderiza o gráfico inicial
  renderizarTamanhos();
}

function renderizarTamanhos() {
  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');
  
  const litofacies = selectLito?.value;
  const camada = selectCamada?.value;

  if (!litofacies || !camada) {
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999; margin-top: 2rem;">Selecione a litofácies e a camada acima para visualizar o gráfico.</p>`;
    return;
  }

  // Reconstrói a chave no formato "Litofacies|Camada"
  const chave = `${litofacies}|${camada}`;
  const dados = dadosGlobais[chave];

  // Verifica se a combinação existe ou se o JSON retornou o campo "erro"
  if (!dados || dados.erro) {
    const msgErro = dados?.erro || 'Sem dados para esta combinação exata.';
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999; margin-top: 2rem;">${msgErro}</p>`;
    return;
  }

  const valores = dados.valores || [];

  if (valores.length === 0) {
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999; margin-top: 2rem;">Sem dados numéricos suficientes para gerar o gráfico</p>`;
    return;
  }

  if (typeof mostrarLoading === 'function') mostrarLoading('grafico-tamanhos');

  const trace = {
    x: valores,
    type: 'histogram',
    nbinsx: 30,
    marker: { color: '#1a365d', opacity: 0.8 },
    name: litofacies
  };

  const layout = {
    title: `Distribuição da Altura da Estrutura (${litofacies} - ${camada})`,
    xaxis: { title: 'Altura (cm)' },
    yaxis: { title: 'Frequência' },
    height: 500,
    margin: { t: 50, l: 50, r: 20, b: 50 }
  };

  document.getElementById('grafico-tamanhos').innerHTML = '';
  Plotly.newPlot('grafico-tamanhos', [trace], layout, { responsive: true });
  
  if (typeof esconderLoading === 'function') esconderLoading('grafico-tamanhos');
}

document.addEventListener('DOMContentLoaded', inicializarTamanhos);
