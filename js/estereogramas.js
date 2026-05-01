/**
 * Página: Estereogramas e Rosetas
 */

let dadosEstereogramas = null;

// Função de busca inteligente resistente aos caminhos do GitHub Pages
async function buscarJSONRobusto(nomeArquivo) {
  const caminhosPossiveis = [
    `../data/${nomeArquivo}.json`,
    `../../data/${nomeArquivo}.json`,
    `./data/${nomeArquivo}.json`,
    `/data/${nomeArquivo}.json`,
    `../js/${nomeArquivo}.json`
  ];

  let jsonEncontradoText = null;

  for (const caminho of caminhosPossiveis) {
    try {
      const res = await fetch(caminho);
      if (res.ok) {
        jsonEncontradoText = await res.text();
        break;
      }
    } catch (e) {
      // Ignora para tentar a próxima rota
    }
  }

  if (!jsonEncontradoText) {
    throw new Error(`O ficheiro ${nomeArquivo}.json não foi encontrado.`);
  }

  try {
    // Limpeza de exportações erráticas do Python (NaN, Infinity, etc)
    let jsonCorrigido = jsonEncontradoText.replace(/:\s*NaN/g, ': null');
    jsonCorrigido = jsonCorrigido.replace(/:\s*Infinity/g, ': null');
    jsonCorrigido = jsonCorrigido.replace(/:\s*-Infinity/g, ': null');
    
    return JSON.parse(jsonCorrigido);
  } catch (parseError) {
    console.error(`Erro ao analisar o JSON:`, parseError);
    throw new Error(`Ficheiro encontrado, mas com formato corrompido: ${parseError.message}`);
  }
}

async function inicializarEstereogramas() {
  console.log("A iniciar carregamento de Estereogramas...");

  const containerImagem = document.getElementById('imagem-estereograma');

  try {
    // Tenta carregar o ficheiro de estereogramas
    dadosEstereogramas = await buscarJSONRobusto('estereogramas');
    console.log("✅ Dados de Estereogramas carregados com sucesso!");
  } catch (erro) {
    console.error("❌ Erro fatal:", erro);
    if (containerImagem) {
      containerImagem.innerHTML = `
        <div style="text-align: center; color: #dc2626; padding: 2rem; border: 1px dashed #dc2626; border-radius: 8px; background: white;">
          <h3>⚠️ Erro no carregamento</h3>
          <p><strong>Detalhe técnico:</strong> ${erro.message}</p>
          <p style="font-size: 0.9em; color: #666; margin-top: 1rem;">
            Verifique se fez o upload do ficheiro <code>estereogramas.json</code> para a pasta <code>data</code> no GitHub.
          </p>
        </div>`;
    }
    return;
  }

  const selectAfl = document.getElementById('afloramento-select');
  const selectCamada = document.getElementById('camada-select');

  if (!selectAfl || !selectCamada) return;

  // 1. Extrai Afloramentos únicos diretamente a partir das chaves do ficheiro JSON
  // Exemplo de chave: "Afloramento 1|Camada A"
  const afloramentosSet = new Set();
  Object.keys(dadosEstereogramas).forEach(chave => {
    const partes = chave.split('|');
    if (partes.length >= 1) {
      afloramentosSet.add(partes[0]);
    }
  });

  // Preenche o Dropdown de Afloramentos
  selectAfl.innerHTML = '';
  Array.from(afloramentosSet).sort().forEach(afl => {
    selectAfl.appendChild(new Option(afl, afl));
  });

  // Adiciona eventos: Ao mudar, atualiza a cascata
  selectAfl.addEventListener('change', atualizarCamadasERenderizar);
  selectCamada.addEventListener('change', renderizarEstereograma);
  
  // Se existir um botão "Gerar", mantém a compatibilidade
  const btnGerar = document.getElementById('btn-gerar-estereograma');
  if (btnGerar) {
    btnGerar.addEventListener('click', renderizarEstereograma);
  }

  // Despoleta o primeiro preenchimento
  if (selectAfl.options.length > 0) {
    atualizarCamadasERenderizar();
  }
}

// Cascata Inteligente: Atualiza as camadas disponíveis consoante o Afloramento escolhido
function atualizarCamadasERenderizar() {
  const selectAfl = document.getElementById('afloramento-select');
  const selectCamada = document.getElementById('camada-select');
  const aflAtual = selectAfl.value;

  if (!selectCamada || !aflAtual) return;

  const camadaAnterior = selectCamada.value;
  const camadasDisponiveis = new Set();

  // Filtra as camadas que pertencem ao afloramento selecionado
  Object.keys(dadosEstereogramas).forEach(chave => {
    const partes = chave.split('|');
    if (partes.length === 2 && partes[0] === aflAtual) {
      camadasDisponiveis.add(partes[1]);
    }
  });

  selectCamada.innerHTML = '';
  
  if (camadasDisponiveis.size === 0) {
    selectCamada.appendChild(new Option("Sem camadas", ""));
  } else {
    Array.from(camadasDisponiveis).sort().forEach(cam => {
      selectCamada.appendChild(new Option(cam, cam));
    });
  }

  // Tenta manter a camada que estava selecionada antes, se existir no novo afloramento
  if (camadasDisponiveis.has(camadaAnterior)) {
    selectCamada.value = camadaAnterior;
  } else if (camadasDisponiveis.size > 0) {
    selectCamada.value = Array.from(camadasDisponiveis).sort()[0];
  }

  // Desenha a imagem assim que a lista for atualizada
  renderizarEstereograma();
}

function renderizarEstereograma() {
  const container = document.getElementById('imagem-estereograma');
  if (!container) return;

  // Lógica de Loading opcional (se as funções existirem noutro script global)
  if (typeof mostrarLoading === 'function') mostrarLoading('imagem-estereograma');

  const selectAfl = document.getElementById('afloramento-select');
  const selectCamada = document.getElementById('camada-select');
  
  const afloramento = selectAfl?.value || '';
  const camada = selectCamada?.value || '';

  const chave = `${afloramento}|${camada}`;
  const dados = dadosEstereogramas[chave];

  if (!dados || !dados.imagem_base64) {
    if (typeof esconderLoading === 'function') esconderLoading('imagem-estereograma');
    container.innerHTML = `
      <div style="padding: 2rem; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center; color: #64748b;">
        <p>Não há imagem de estereograma disponível para a combinação selecionada:</p>
        <p><strong>${afloramento} > ${camada}</strong></p>
      </div>`;
    return;
  }

  // Injeta a imagem Base64 de forma limpa e direta
  if (typeof esconderLoading === 'function') esconderLoading('imagem-estereograma');
  
  container.innerHTML = `
    <img 
      src="data:image/png;base64,${dados.imagem_base64}" 
      alt="Estereograma de ${afloramento} - ${camada}" 
      style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
    >
  `;
}

// Inicializa quando a página HTML terminar de carregar
document.addEventListener('DOMContentLoaded', inicializarEstereogramas);
