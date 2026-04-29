/**
 * Página: Análise de Tamanhos (Altura da Estrutura)
 */

let dadosGlobais = null;

async function inicializarTamanhos() {
  try {
    console.log("Iniciando busca dos dados...");
    
    // Lista de possíveis caminhos para o JSON dependendo da estrutura do seu GitHub Pages
    const caminhosPossiveis = [
      '../data/tamanhos.json',    // Se "data" e "pages" estiverem no mesmo nível
      '../../data/tamanhos.json', // Se houver um nível extra de pastas
      './data/tamanhos.json',     // Se "data" estiver dentro da mesma pasta do HTML
      '/data/tamanhos.json'       // Caminho absoluto na raiz do repositório
    ];

    let response = null;
    let caminhoSucesso = '';

    // Removido o teste com carregarJSON() porque a função padrão falha
    // ao tentar fazer o parse de um arquivo JSON que contém a palavra "NaN".
    // Vamos fazer a requisição manualmente para consertar o texto antes.

    for (const caminho of caminhosPossiveis) {
      try {
        console.log(`Tentando buscar em: ${caminho}`);
        const res = await fetch(caminho);
        if (res.ok) {
          response = res;
          caminhoSucesso = caminho;
          break; // Sai do loop assim que encontrar o arquivo com sucesso
        }
      } catch (e) {
        // Ignora erros de rede aqui para tentar o próximo caminho
      }
    }

    if (response) {
      // 1. Lemos o arquivo como texto bruto em vez de tentar ler como JSON direto
      const textData = await response.text();
      
      // 2. CORREÇÃO DO ERRO DA IMAGEM: 
      // Substituímos o "NaN" inválido no formato JSON pelo valor "null" aceitável.
      const jsonCorrigido = textData.replace(/:\s*NaN/g, ': null');
      
      // 3. Agora sim, convertemos o texto corrigido para um Objeto JavaScript
      dadosGlobais = JSON.parse(jsonCorrigido);
      console.log(`Sucesso! Arquivo encontrado em: ${caminhoSucesso}`);
    } else {
      throw new Error("Nenhum dos caminhos testados retornou o arquivo tamanhos.json. Verifique se a pasta 'data' foi enviada pro GitHub.");
    }

  } catch (erro) {
    console.error("Erro fatal ao carregar os dados:", erro);
    
    // Mostra o erro na tela
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

  // Restante do código original (Preenchimento dos Selects e Gráfico)
  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');

  if (selectLito && dadosGlobais) {
    const litofaciesDisponiveis = Object.keys(dadosGlobais);
    
    selectLito.innerHTML = '<option value="">Selecione uma Litofácies...</option>';

    litofaciesDisponiveis.forEach(lito => {
      const option = document.createElement('option');
      option.value = lito;
      option.textContent = lito;
      selectLito.appendChild(option);
    });
  }

  if (selectCamada) {
    selectCamada.innerHTML = '';
    const option = document.createElement('option');
    option.value = 'Todas as Camadas';
    option.textContent = 'Todas as Camadas';
    selectCamada.appendChild(option);
    selectCamada.disabled = true;
  }

  if (selectLito) selectLito.addEventListener('change', renderizarTamanhos);
  if (selectCamada) selectCamada.addEventListener('change', renderizarTamanhos);

  renderizarTamanhos();
}

function renderizarTamanhos() {
  const selectLito = document.getElementById('litofacies-tamanhos');
  const selectCamada = document.getElementById('camada-tamanhos');
  
  const litofacies = selectLito?.value;
  const camada = selectCamada?.value || 'Todas as Camadas';

  if (!litofacies) {
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999; margin-top: 2rem;">Selecione uma litofácies acima para visualizar o gráfico.</p>`;
    return;
  }

  if (!dadosGlobais || !dadosGlobais[litofacies]) {
    document.getElementById('grafico-tamanhos').innerHTML = 
      `<p style="text-align:center; color:#999; margin-top: 2rem;">Sem dados para esta seleção</p>`;
    return;
  }

  const valores = dadosGlobais[litofacies].valores || [];

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
    title: `Distribuição da Altura da Estrutura (${litofacies})`,
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
