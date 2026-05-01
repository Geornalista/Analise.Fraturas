/**
 * Página: Visualização de Scanlines
 */

let dadosScanlines = null;
let dadosOpcoes = null;

// Função de busca focada exclusivamente na pasta "data" com depurador de JSON
async function buscarJSONRobusto(nomeArquivo) {
  const caminhosPossiveis = [
    `../data/${nomeArquivo}.json`,
    `../../data/${nomeArquivo}.json`,
    `./data/${nomeArquivo}.json`,
    `/data/${nomeArquivo}.json`
  ];

  let jsonEncontradoText = null;
  let caminhoSucesso = null;

  for (const caminho of caminhosPossiveis) {
    try {
      const res = await fetch(caminho);
      if (res.ok) {
        jsonEncontradoText = await res.text();
        caminhoSucesso = caminho;
        break;
      }
    } catch (e) {
        // Silencia erros de rede provisórios
    }
  }

  // 1. Verifica se encontrou o arquivo
  if (!jsonEncontradoText) {
    throw new Error(`O arquivo ${nomeArquivo}.json não foi encontrado na pasta 'data'.`);
  }

  // 2. Tenta converter o texto para JSON lidando com "sujeiras" do Python
  try {
    let jsonCorrigido = jsonEncontradoText.replace(/:\s*NaN/g, ': null');
    jsonCorrigido = jsonCorrigido.replace(/:\s*Infinity/g, ': null');
    jsonCorrigido = jsonCorrigido.replace(/:\s*-Infinity/g, ': null');
    
    return JSON.parse(jsonCorrigido);
  } catch (parseError) {
    console.error(`Falha ao ler o JSON de ${nomeArquivo}:`, jsonEncontradoText.substring(0, 200) + "...");
    throw new Error(`O arquivo ${nomeArquivo}.json foi encontrado em '${caminhoSucesso}', mas o seu conteúdo está com formato inválido. Erro do sistema: ${parseError.message}`);
  }
}

async function inicializarScanlines() {
  console.log('🔄 A inicializar Scanlines...');

  let selectAfl = document.getElementById('afloramento-scanline') || document.querySelectorAll('select')[0];
  let selectCam = document.getElementById('camada-scanline') || document.querySelectorAll('select')[1];

  try {
    // Tenta carregar os dois arquivos
    try {
      dadosOpcoes = await buscarJSONRobusto('opcoes');
    } catch (e) {
      console.warn("Aviso: opcoes.json falhou. Prosseguindo apenas com scanlines.json. Erro: " + e.message);
      dadosOpcoes = {}; 
    }

    dadosScanlines = await buscarJSONRobusto('scanlines');
    console.log('✅ Dados de Scanlines carregados com sucesso!');

  } catch (erro) {
    console.error('❌ Erro fatal:', erro);
    const erroHtml = `
      <div style="text-align: center; color: #dc2626; padding: 2rem; border: 1px dashed #dc2626; border-radius: 8px; background: white; margin-top: 1rem;">
        <h3>⚠️ Erro no carregamento</h3>
        <p><strong>Detalhe técnico:</strong> ${erro.message}</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 1rem;">
          Se o erro disser que o formato é inválido, verifique o Console (F12) para ver a parte do arquivo que está corrompida.
        </p>
      </div>`;
    
    const container = document.querySelector('.chart-section') || document.body;
    container.innerHTML = erroHtml;
    return;
  }

  if (!selectAfl || !selectCam) return;

  selectAfl.innerHTML = '';
  selectCam.innerHTML = '';

  // Preenche afloramentos
  if (dadosOpcoes && dadosOpcoes.afloramentos && Array.isArray(dadosOpcoes.afloramentos)) {
    dadosOpcoes.afloramentos.forEach(afl => {
      const option = document.createElement('option');
      option.value = afl;
      option.textContent = afl;
      selectAfl.appendChild(option);
    });
  } else {
    Object.keys(dadosScanlines).forEach(afl => {
      const option = document.createElement('option');
      option.value = afl;
      option.textContent = afl;
      selectAfl.appendChild(option);
    });
  }

  // Preenche camadas
  if (dadosOpcoes && dadosOpcoes.camadas && Array.isArray(dadosOpcoes.camadas)) {
    dadosOpcoes.camadas.forEach(cam => {
      const option = document.createElement('option');
      option.value = cam;
      option.textContent = cam;
      selectCam.appendChild(option);
    });
  } else {
    const option = document.createElement('option');
    option.value = "Todas";
    option.textContent = "Todas as Camadas";
    selectCam.appendChild(option);
  }

  // Eventos de mudança
  selectAfl.addEventListener('change', () => {
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  });

  selectCam.addEventListener('change', () => {
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  });

  // Render inicial
  if (selectAfl.options.length > 0) {
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  }
}

function renderizarScanline(afloramento, camada, dadosAfloramento) {
  const canvas = document.getElementById('canvas-scanline') || document.querySelector('canvas');
  if (!canvas) return;

  const parentWidth = canvas.parentElement.clientWidth || 800;
  canvas.width = parentWidth;
  canvas.height = 400;

  const ctx = canvas.getContext('2d');
  const padding = 50;
  const height = canvas.height - 2 * padding;
  const width = canvas.width - 2 * padding;

  // Fundo e moldura
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(padding, padding, width, height);

  ctx.strokeStyle = '#1a365d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Cabeçalhos
  ctx.fillStyle = '#1a365d';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`Afloramento: ${afloramento || 'Nenhum'}`, padding, padding - 20);
  
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Arial';
  const posCamadaX = width > 400 ? padding + 300 : padding; 
  const posCamadaY = width > 400 ? padding - 20 : padding + 15;
  ctx.fillText(`Camada: ${camada || 'Nenhuma'}`, posCamadaX, posCamadaY);

  if (!dadosAfloramento) {
    ctx.fillStyle = '#dc2626';
    ctx.font = 'italic 14px Arial';
    ctx.fillText('Nenhum dado encontrado para o afloramento selecionado.', padding + 20, canvas.height / 2);
    return;
  }

  let dadosRenderizar = dadosAfloramento;
  if (dadosAfloramento[camada]) {
      dadosRenderizar = dadosAfloramento[camada];
  }

  // DIAGNÓSTICO
  ctx.fillStyle = '#2ca02c';
  ctx.font = 'bold 14px Arial';
  
  if (Array.isArray(dadosRenderizar)) {
      ctx.fillText(`✅ Sucesso! JSON encontrado na pasta DATA. Existem ${dadosRenderizar.length} fraturas aqui.`, padding + 20, canvas.height / 2 - 20);
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(`(Os dados estão prontos. Podemos desenhar as linhas no passo seguinte!)`, padding + 20, canvas.height / 2 + 10);
  } else if (typeof dadosRenderizar === 'object') {
      const chaves = Object.keys(dadosRenderizar).slice(0, 5).join(', ');
      ctx.fillText(`✅ Sucesso! JSON carregado na pasta DATA (Formato Objeto).`, padding + 20, canvas.height / 2 - 20);
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(`Encontrei as chaves: ${chaves}...`, padding + 20, canvas.height / 2 + 10);
  } else {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`⚠️ Arquivo lido, mas o formato é inesperado.`, padding + 20, canvas.height / 2);
  }
}

document.addEventListener('DOMContentLoaded', inicializarScanlines);
