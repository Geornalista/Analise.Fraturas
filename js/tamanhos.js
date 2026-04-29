/**
 * Página: Análise de Tamanhos (Altura da Estrutura)
 */

let dadosGlobais = null;

async function inicializarTamanhos() {
  try {
    console.log("Iniciando busca dos dados...");
    
    // Lista de possíveis caminhos para o novo JSON
    const caminhosPossiveis = [
      '../data/tamanhos_por_litofácies.json',    
      '../../data/tamanhos_por_litofácies.json', 
      '../data/tamanhos_por_litofacies.json',
      './data/tamanhos_por_litofácies.json',     
      '/data/tamanhos_por_litofácies.json'       
    ];

    let response = null;

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

    if (response) {
      const textData = await response.text();
      // Continua corrigindo o problema dos 'NaN' gerados pelo Python
      const jsonCorrigido = textData.replace(/:\s*NaN/g, ': null');
      dadosGlobais = JSON.parse(jsonCorrigido);
    } else {
      throw new Error("Arquivo JSON não encontrado.");
    }

  } catch (erro) {
    console.error("Erro fatal ao carregar os dados:", erro);
    document.getElementById('grafico-tamanhos').innerHTML = `
      <div style="text-align: center; color: #dc2626; padding: 2rem; border: 1px dashed #dc2626; border-radius: 8px;">
        <h3>⚠️ Erro ao carregar os dados</h3>
        <p><strong>Detalhe técnico:</strong> ${erro.message}</p>
      </div>`;
    return;
  }

  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');

  if (dadosGlobais && selectLito) {
    const litofaciesSet = new Set();

    // Extrai apenas as Litofácies que tenham pelo menos uma camada com dados válidos
    Object.keys(dadosGlobais).forEach(chave => {
      const partes = chave.split('|');
      if (partes.length === 2) {
        const dados = dadosGlobais[chave];
        if (dados && !dados.erro && dados.valores && dados.valores.length > 0) {
          litofaciesSet.add(partes[0]);
        }
      }
    });

    // Preenche o dropdown principal (Litofácies)
    selectLito.innerHTML = '';
    Array.from(litofaciesSet).sort().forEach(lito => {
      const option = document.createElement('option');
      option.value = lito;
      option.textContent = lito;
      selectLito.appendChild(option);
    });

    if (litofaciesSet.has('Todas as Litofacies')) {
      selectLito.value = 'Todas as Litofacies';
    }

    // Quando o usuário trocar a Litofácies, atualizamos o dropdown de Camadas
    selectLito.addEventListener('change', atualizarCamadasERenderizar);
    if (selectCamada) {
      selectCamada.addEventListener('change', renderizarTamanhos);
    }

    // Faz o primeiro preenchimento das camadas com a Litofácies padrão
    atualizarCamadasERenderizar();
  }
}

// Nova função que cria a cascata Inteligente
function atualizarCamadasERenderizar() {
  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');
  const litoAtual = selectLito.value;

  if (!selectCamada || !litoAtual) return;

  const camadaAnterior = selectCamada.value;
  const camadasDisponiveis = new Set();

  // Filtra as camadas que correspondem à litofácies atual e que possuem dados
  Object.keys(dadosGlobais).forEach(chave => {
    const partes = chave.split('|');
    if (partes.length === 2 && partes[0] === litoAtual) {
      const dados = dadosGlobais[chave];
      if (dados && !dados.erro && dados.valores && dados.valores.length > 0) {
        camadasDisponiveis.add(partes[1]);
      }
    }
  });

  selectCamada.innerHTML = '';
  Array.from(camadasDisponiveis).sort().forEach(cam => {
    const opt = document.createElement('option');
    opt.value = cam;
    opt.textContent = cam;
    selectCamada.appendChild(opt);
  });

  // Tenta restaurar a escolha de camada anterior. Se não conseguir, usa o padrão.
  if (camadasDisponiveis.has(camadaAnterior)) {
    selectCamada.value = camadaAnterior;
  } else if (camadasDisponiveis.has('Todas as Camadas')) {
    selectCamada.value = 'Todas as Camadas';
  } else if (camadasDisponiveis.size > 0) {
    selectCamada.value = Array.from(camadasDisponiveis).sort()[0];
  }

  // Com a camada atualizada, chama o Plotly
  renderizarTamanhos();
}

function renderizarTamanhos() {
  if (typeof mostrarLoading === 'function') mostrarLoading('grafico-tamanhos');

  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');
  const litofacies = selectLito?.value;
  const camada = selectCamada?.value;
  const container = document.getElementById('grafico-tamanhos');

  if (!litofacies || !camada) {
    if (typeof esconderLoading === 'function') esconderLoading('grafico-tamanhos');
    container.innerHTML = `<p style="text-align:center; color:#999; margin-top: 2rem;">Selecione opções válidas.</p>`;
    return;
  }

  const chave = `${litofacies}|${camada}`;
  const dados = dadosGlobais[chave];

  if (!dados || dados.erro || !dados.valores || dados.valores.length === 0) {
    if (typeof esconderLoading === 'function') esconderLoading('grafico-tamanhos');
    const msgErro = dados?.erro || 'Sem dados numéricos suficientes para gerar o gráfico.';
    container.innerHTML = `<p style="text-align:center; color:#999; margin-top: 2rem;">${msgErro}</p>`;
    return;
  }

  const valores = dados.valores;

  const trace = {
    x: valores,
    type: 'histogram',
    nbinsx: 30,
    marker: { color: '#1a365d', opacity: 0.8 },
    name: litofacies
  };

  const layout = {
    title: `Distribuição da Altura (${litofacies} - ${camada})`,
    xaxis: { title: 'Altura (cm)' },
    yaxis: { title: 'Frequência' },
    height: 500,
    margin: { t: 50, l: 50, r: 20, b: 50 }
  };

  // EXTREMAMENTE IMPORTANTE: O loading deve ser escondido ANTES do Plotly desenhar.
  // Se o container estiver com "display: none" na hora do desenho, o gráfico não aparece!
  if (typeof esconderLoading === 'function') esconderLoading('grafico-tamanhos');

  Plotly.newPlot('grafico-tamanhos', [trace], layout, { responsive: true });
}

document.addEventListener('DOMContentLoaded', inicializarTamanhos);
