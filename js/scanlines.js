/**
 * Página: Visualização de Scanlines
 */

let dadosScanlines = null;
let dadosOpcoes = null;

// Nova função "Super Busca" resistente a erros do GitHub Pages
async function buscarJSONRobusto(nomeArquivo) {
  const caminhosPossiveis = [
    `../data/${nomeArquivo}.json`,
    `../../data/${nomeArquivo}.json`,
    `./data/${nomeArquivo}.json`,
    `/data/${nomeArquivo}.json`
  ];

  for (const caminho of caminhosPossiveis) {
    try {
      const res = await fetch(caminho);
      if (res.ok) {
        const textData = await res.text();
        // Corrige os NaN exportados pelo Python
        const jsonCorrigido = textData.replace(/:\s*NaN/g, ': null');
        return JSON.parse(jsonCorrigido);
      }
    } catch (e) {
        // Silencia erros de rede provisórios
    }
  }
  throw new Error(`O arquivo ${nomeArquivo}.json não foi encontrado na pasta data.`);
}

async function inicializarScanlines() {
  console.log('🔄 A inicializar Scanlines...');

  // Busca inteligente dos dropdowns (mesmo que os IDs mudem no HTML)
  let selectAfl = document.getElementById('afloramento-scanline') || document.querySelectorAll('select')[0];
  let selectCam = document.getElementById('camada-scanline') || document.querySelectorAll('select')[1];

  try {
    // Carrega ambos os arquivos vitais
    dadosOpcoes = await buscarJSONRobusto('opcoes');
    dadosScanlines = await buscarJSONRobusto('scanlines');
    console.log('✅ Opções e Scanlines carregados com sucesso!');

  } catch (erro) {
    console.error('❌ Erro fatal:', erro);
    const erroHtml = `
      <div style="text-align: center; color: #dc2626; padding: 2rem; border: 1px dashed #dc2626; border-radius: 8px; background: white; margin-top: 1rem;">
        <h3>⚠️ Erro ao carregar os dados</h3>
        <p><strong>Detalhe técnico:</strong> ${erro.message}</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 1rem;">
          Verifique se fez o upload dos arquivos <code>opcoes.json</code> e <code>scanlines.json</code> para o seu repositório no GitHub.
        </p>
      </div>`;
    
    // Substitui a área principal pelo erro visual
    const container = document.querySelector('.chart-section') || document.body;
    container.innerHTML = erroHtml;
    return;
  }

  if (!selectAfl || !selectCam) {
    console.warn("Dropdowns não foram encontrados no HTML.");
    return;
  }

  // Limpa as opções placeholder
  selectAfl.innerHTML = '';
  selectCam.innerHTML = '';

  // Preenche afloramentos
  if (dadosOpcoes.afloramentos && Array.isArray(dadosOpcoes.afloramentos)) {
    dadosOpcoes.afloramentos.forEach(afl => {
      const option = document.createElement('option');
      option.value = afl;
      option.textContent = afl;
      selectAfl.appendChild(option);
    });
  } else {
    // Fallback: se 'opcoes' não tiver, tira direto das chaves do scanlines.json
    Object.keys(dadosScanlines).forEach(afl => {
      const option = document.createElement('option');
      option.value = afl;
      option.textContent = afl;
      selectAfl.appendChild(option);
    });
  }

  // Preenche camadas iniciais
  if (dadosOpcoes.camadas && Array.isArray(dadosOpcoes.camadas)) {
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

  // Adiciona eventos (Listeners) para atualizar o gráfico sem ter que buscar o JSON de novo
  selectAfl.addEventListener('change', () => {
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  });

  selectCam.addEventListener('change', () => {
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  });

  // Renderiza a primeira scanline logo na abertura
  if (selectAfl.options.length > 0) {
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  }
}

function renderizarScanline(afloramento, camada, dados) {
  console.log(`📊 A renderizar scanline: ${afloramento} / ${camada}`);

  const canvas = document.getElementById('canvas-scanline') || document.querySelector('canvas');
  
  if (!canvas) {
    console.error('❌ Tag <canvas> não foi encontrada no ficheiro HTML.');
    return;
  }

  // Ajusta dinamicamente a largura do canvas para o tamanho do ecrã do utilizador
  const parentWidth = canvas.parentElement.clientWidth || 800;
  canvas.width = parentWidth;
  canvas.height = 400; // Altura fixa

  const ctx = canvas.getContext('2d');
  const padding = 50;
  const height = canvas.height - 2 * padding;
  const width = canvas.width - 2 * padding;

  // 1. Limpa o fundo (Branco)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Desenha a moldura do gráfico
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(padding, padding, width, height);

  // 3. Desenha os eixos cartesianos principais
  ctx.strokeStyle = '#1a365d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // 4. Configura e desenha os textos Superiores (Afloramento e Camada)
  ctx.fillStyle = '#1a365d';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`Afloramento: ${afloramento || 'Nenhum'}`, padding, padding - 20);
  
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Arial';
  // Ajustado dinamicamente para não sair do ecrã no telemóvel
  const posCamadaX = width > 400 ? padding + 300 : padding; 
  const posCamadaY = width > 400 ? padding - 20 : padding + 15;
  ctx.fillText(`Camada: ${camada || 'Nenhuma'}`, posCamadaX, posCamadaY);

  // Validação: se a combinação escolhida não tiver dados no JSON
  if (!dados) {
    ctx.fillStyle = '#dc2626';
    ctx.font = 'italic 14px Arial';
    ctx.fillText('Nenhum dado de scanline encontrado para esta seleção.', padding + 20, canvas.height / 2);
    return;
  }

  // --- O SEU CÓDIGO DE DESENHO VEM AQUI ---
  // A estrutura base está pronta. Agora pode criar um "for loop" no array `dados`
  // para desenhar as linhas (ctx.lineTo) das suas fraturas ao longo do eixo X.
  
  ctx.fillStyle = '#2ca02c';
  ctx.font = '14px Arial';
  ctx.fillText('A base do gráfico de Scanline está carregada e pronta para desenhar dados!', padding + 20, canvas.height / 2);

  console.log('✅ Scanline desenhada com sucesso no Canvas!');
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', inicializarScanlines);
