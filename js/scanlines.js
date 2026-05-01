/**
 * Página: Visualização de Scanlines
 */

let dadosScanlines = null;
let dadosOpcoes = null;

// Função de busca focada na pasta "data" com depurador de JSON e tolerância a erros de digitação (scalines vs scanlines)
async function buscarJSONRobusto(nomeArquivo) {
  const caminhosPossiveis = [
    `../data/${nomeArquivo}.json`,
    `../../data/${nomeArquivo}.json`,
    `./data/${nomeArquivo}.json`,
    `/data/${nomeArquivo}.json`,
    // Fallbacks para caso o nome do arquivo tenha o erro de digitação comum (scalines)
    `../data/${nomeArquivo.replace('scanlines', 'scalines')}.json`,
    `../../data/${nomeArquivo.replace('scanlines', 'scalines')}.json`
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

  if (!jsonEncontradoText) {
    throw new Error(`O arquivo ${nomeArquivo}.json (ou scalines.json) não foi encontrado na pasta 'data'.`);
  }

  try {
    let jsonCorrigido = jsonEncontradoText.replace(/:\s*NaN/g, ': null');
    jsonCorrigido = jsonCorrigido.replace(/:\s*Infinity/g, ': null');
    jsonCorrigido = jsonCorrigido.replace(/:\s*-Infinity/g, ': null');
    
    return JSON.parse(jsonCorrigido);
  } catch (parseError) {
    console.error(`Falha ao ler o JSON de ${nomeArquivo}:`, jsonEncontradoText.substring(0, 200) + "...");
    throw new Error(`O arquivo foi encontrado, mas o seu conteúdo tem um formato inválido. Erro: ${parseError.message}`);
  }
}

async function inicializarScanlines() {
  console.log('🔄 A inicializar Scanlines...');

  let selectAfl = document.getElementById('afloramento-scanline') || document.querySelectorAll('select')[0];
  let selectCam = document.getElementById('camada-scanline') || document.querySelectorAll('select')[1];

  try {
    try {
      dadosOpcoes = await buscarJSONRobusto('opcoes');
    } catch (e) {
      console.warn("Aviso: opcoes.json falhou. Prosseguindo apenas com scanlines.json.");
      dadosOpcoes = {}; 
    }

    dadosScanlines = await buscarJSONRobusto('scanlines');
    console.log('✅ Dados de Scanlines carregados com sucesso!');

  } catch (erro) {
    console.error('❌ Erro fatal:', erro);
    const container = document.querySelector('.chart-section') || document.body;
    container.innerHTML = `
      <div style="text-align: center; color: #dc2626; padding: 2rem; border: 1px dashed #dc2626; border-radius: 8px; background: white; margin-top: 1rem;">
        <h3>⚠️ Erro no carregamento</h3>
        <p><strong>Detalhe técnico:</strong> ${erro.message}</p>
      </div>`;
    return;
  }

  if (!selectAfl || !selectCam) return;

  selectAfl.innerHTML = '';
  selectCam.innerHTML = '';

  // Preenche afloramentos
  if (dadosOpcoes && dadosOpcoes.afloramentos && Array.isArray(dadosOpcoes.afloramentos)) {
    dadosOpcoes.afloramentos.forEach(afl => {
      selectAfl.appendChild(new Option(afl, afl));
    });
  } else {
    Object.keys(dadosScanlines).forEach(afl => {
      selectAfl.appendChild(new Option(afl, afl));
    });
  }

  // Preenche camadas
  if (dadosOpcoes && dadosOpcoes.camadas && Array.isArray(dadosOpcoes.camadas)) {
    dadosOpcoes.camadas.forEach(cam => {
      selectCam.appendChild(new Option(cam, cam));
    });
  } else {
    // Se não houver opcoes.json, tenta extrair as camadas do primeiro afloramento
    const primeiroAfl = selectAfl.options[0].value;
    if (dadosScanlines[primeiroAfl]) {
       Object.keys(dadosScanlines[primeiroAfl]).forEach(cam => {
          selectCam.appendChild(new Option(cam, cam));
       });
    } else {
       selectCam.appendChild(new Option("Todas", "Todas"));
    }
  }

  selectAfl.addEventListener('change', () => {
    // Atualiza as camadas disponíveis para o afloramento escolhido
    const aflEscolhido = selectAfl.value;
    if (dadosScanlines[aflEscolhido]) {
        selectCam.innerHTML = '';
        Object.keys(dadosScanlines[aflEscolhido]).forEach(cam => {
            selectCam.appendChild(new Option(cam, cam));
        });
    }
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  });

  selectCam.addEventListener('change', () => {
    renderizarScanline(selectAfl.value, selectCam.value, dadosScanlines[selectAfl.value]);
  });

  if (selectAfl.options.length > 0) {
    selectAfl.dispatchEvent(new Event('change'));
  }
}

function renderizarScanline(afloramento, camada, dadosAfloramento) {
  const canvas = document.getElementById('canvas-scanline') || document.querySelector('canvas');
  if (!canvas) return;

  const parentWidth = canvas.parentElement.clientWidth || 800;
  canvas.width = parentWidth;
  canvas.height = 450; // Altura aumentada para melhor visualização

  const ctx = canvas.getContext('2d');
  const padding = 60;
  const height = canvas.height - 2 * padding;
  const width = canvas.width - 2 * padding;

  // Limpar fundo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cabeçalhos
  ctx.fillStyle = '#1a365d';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`Afloramento: ${afloramento || 'Nenhum'}`, padding, padding - 30);
  
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Arial';
  ctx.fillText(`Camada: ${camada || 'Nenhuma'}`, padding + 300, padding - 30);

  if (!dadosAfloramento || !dadosAfloramento[camada]) {
    ctx.fillStyle = '#dc2626';
    ctx.font = 'italic 14px Arial';
    ctx.fillText('Nenhum dado encontrado para esta seleção.', padding, canvas.height / 2);
    return;
  }

  const dadosRenderizar = dadosAfloramento[camada];

  if (dadosRenderizar.fraturas) {
      // 1. Extrair os dados geológicos
      const comprimentoReal = dadosRenderizar.comprimento || 10; // metros
      const espessuraReal = dadosRenderizar.espessura_camada || 5; // metros
      const fraturas = dadosRenderizar.fraturas;

      // 2. Definir a escala de conversão (Metros para Pixels)
      const scaleX = width / comprimentoReal;
      // Para a altura, usamos a espessura da camada para limitar o topo
      const scaleY = height / Math.max(espessuraReal, 1); 

      // 3. Desenhar a Camada (Rocha base)
      const yBaseCamada = padding + height; // Fundo da tela
      const yTopoCamada = yBaseCamada - (espessuraReal * scaleY);
      
      ctx.fillStyle = '#f8fafc'; // Cor de fundo da rocha
      ctx.fillRect(padding, yTopoCamada, comprimentoReal * scaleX, espessuraReal * scaleY);
      
      ctx.strokeStyle = '#cbd5e1'; // Borda da camada
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, yTopoCamada, comprimentoReal * scaleX, espessuraReal * scaleY);

      // 4. Eixo X (Distância)
      ctx.strokeStyle = '#1a365d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, yBaseCamada);
      ctx.lineTo(padding + (comprimentoReal * scaleX), yBaseCamada);
      ctx.stroke();

      // Marcações no Eixo X
      ctx.fillStyle = '#1a365d';
      ctx.font = '12px Arial';
      for(let i = 0; i <= Math.ceil(comprimentoReal); i+= (comprimentoReal > 20 ? 5 : 1)) {
          const xPos = padding + (i * scaleX);
          ctx.beginPath();
          ctx.moveTo(xPos, yBaseCamada);
          ctx.lineTo(xPos, yBaseCamada + 5);
          ctx.stroke();
          ctx.fillText(`${i}m`, xPos - 10, yBaseCamada + 20);
      }

      // 5. Desenhar as Fraturas
      fraturas.forEach(f => {
          const x = padding + (f.espacamento * scaleX);
          const yInicio = yBaseCamada;
          const yFim = yBaseCamada - (f.altura * scaleY);

          ctx.beginPath();
          ctx.moveTo(x, yInicio);
          ctx.lineTo(x, yFim);

          // Cores baseadas na subordinação
          const tipo = (f.frat_set || "").toLowerCase();
          if (tipo.includes("nao subordinada") || tipo.includes("não subordinada")) {
              ctx.strokeStyle = '#dc2626'; // Vermelho forte
              ctx.lineWidth = 3;
          } else if (tipo.includes("subordinada")) {
              ctx.strokeStyle = '#2563eb'; // Azul
              ctx.lineWidth = 1.5;
          } else {
              ctx.strokeStyle = '#16a34a'; // Verde (Não identificada)
              ctx.lineWidth = 1.5;
          }
          ctx.stroke();
      });

      // 6. Legenda Visual
      const legX = padding;
      const legY = canvas.height - 15;
      
      ctx.font = '12px Arial';
      
      // Legenda 1
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(legX, legY - 10, 15, 10);
      ctx.fillStyle = '#333';
      ctx.fillText('Não Subordinada', legX + 20, legY);

      // Legenda 2
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(legX + 130, legY - 10, 15, 10);
      ctx.fillStyle = '#333';
      ctx.fillText('Subordinada', legX + 150, legY);
      
      // Info Geral
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Total de Fraturas: ${fraturas.length} | Comprimento: ${comprimentoReal}m | Espessura: ${espessuraReal}m`, legX + 260, legY);

  } else {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`⚠️ Arquivo lido, mas a estrutura interna do JSON não contém "fraturas".`, padding, canvas.height / 2);
  }
}

document.addEventListener('DOMContentLoaded', inicializarScanlines);
