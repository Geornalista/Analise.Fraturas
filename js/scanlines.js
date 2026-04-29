// frontend/js/scanlines.js
/**
 * Página: Visualização de Scanlines
 */

async function inicializarScanlines() {
  console.log('🔄 Inicializando Scanlines...');

  // Carrega opcoes.json
  const opcoes = await carregarJSON('opcoes');
  if (!opcoes) {
    console.error('❌ Erro ao carregar opcoes.json');
    return;
  }

  console.log('✅ Opcoes carregadas:', opcoes);

  const selectAfl = document.getElementById('afloramento-scanline');
  const selectCam = document.getElementById('camada-scanline');

  // Preenche afloramentos
  if (opcoes.afloramentos && Array.isArray(opcoes.afloramentos)) {
    opcoes.afloramentos.forEach(afl => {
      const option = document.createElement('option');
      option.value = afl;
      option.textContent = afl;
      selectAfl.appendChild(option);
    });
    console.log('✅ Afloramentos preenchidos:', opcoes.afloramentos.length);
  } else {
    console.error('❌ afloramentos não é um array:', opcoes.afloramentos);
  }

  // Preenche camadas iniciais
  if (opcoes.camadas && Array.isArray(opcoes.camadas)) {
    opcoes.camadas.forEach(cam => {
      const option = document.createElement('option');
      option.value = cam;
      option.textContent = cam;
      selectCam.appendChild(option);
    });
    console.log('✅ Camadas preenchidas:', opcoes.camadas.length);
  } else {
    console.error('❌ camadas não é um array:', opcoes.camadas);
  }

  // Evento ao mudar afloramento
  selectAfl.addEventListener('change', async () => {
    const afl = selectAfl.value;
    console.log('🔄 Afloramento selecionado:', afl);

    // Carrega scanline
    const scanlines = await carregarJSON('scanlines');
    if (scanlines && scanlines[afl]) {
      renderizarScanline(afl, selectCam.value, scanlines[afl]);
    }
  });

  // Evento ao mudar camada
  selectCam.addEventListener('change', async () => {
    const afl = selectAfl.value;
    const scanlines = await carregarJSON('scanlines');
    if (scanlines && scanlines[afl]) {
      renderizarScanline(afl, selectCam.value, scanlines[afl]);
    }
  });

  // Renderiza primeira scanline
  if (opcoes.afloramentos && opcoes.afloramentos.length > 0) {
    selectAfl.value = opcoes.afloramentos[0];
    selectAfl.dispatchEvent(new Event('change'));
  }
}

function renderizarScanline(afloramento, camada, dados) {
  console.log(`📊 Renderizando scanline: ${afloramento} / ${camada}`);

  const canvas = document.getElementById('canvas-scanline');
  if (!canvas) {
    console.error('❌ Canvas não encontrado');
    return;
  }

  const ctx = canvas.getContext('2d');
  const padding = 50;
  const height = canvas.height - 2 * padding;
  const width = canvas.width - 2 * padding;

  // Limpa canvas
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Desenha eixos
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Escala e labels
  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px Arial';
  ctx.fillText(`Afloramento: ${afloramento}`, padding, padding - 20);
  ctx.fillText(`Camada: ${camada}`, padding + 300, padding - 20);

  console.log('✅ Scanline renderizada!');
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', inicializarScanlines);
