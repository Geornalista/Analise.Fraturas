<!-- frontend/js/estereogramas.js -->
/**
 * Página: Estereogramas e Rosetas
 */

async function inicializarEstereogramas() {
  const opcoes = await carregarJSON('opcoes');
  if (!opcoes) return;

  // Preencher dropdown de afloramentos
  const selectAfl = document.getElementById('afloramento-select');
  if (selectAfl && opcoes.afloramentos) {
    opcoes.afloramentos.forEach(afl => {
      const option = document.createElement('option');
      option.value = afl;
      option.textContent = afl;
      selectAfl.appendChild(option);
    });
    selectAfl.addEventListener('change', atualizarCamadasEstereograma);
  }

  // Botão gerar
  const btnGerar = document.getElementById('btn-gerar-estereograma');
  if (btnGerar) {
    btnGerar.addEventListener('click', renderizarEstereograma);
  }

  // Atualizar camadas inicial
  if (opcoes.afloramentos && opcoes.afloramentos.length > 0) {
    atualizarCamadasEstereograma();
  }
}

async function atualizarCamadasEstereograma() {
  const selectAfl = document.getElementById('afloramento-select');
  const selectCamada = document.getElementById('camada-select');
  const afloramento = selectAfl?.value || 'Todos';

  const opcoes = await carregarJSON('opcoes');
  if (!opcoes) return;

  // Limpar e preencher camadas
  selectCamada.innerHTML = '';
  (opcoes.camadas || []).forEach(cam => {
    const option = document.createElement('option');
    option.value = cam;
    option.textContent = cam;
    selectCamada.appendChild(option);
  });
}

async function renderizarEstereograma() {
  mostrarLoading('imagem-estereograma');

  const selectAfl = document.getElementById('afloramento-select');
  const selectCamada = document.getElementById('camada-select');
  const afloramento = selectAfl?.value || 'Todos';
  const camada = selectCamada?.value || 'Todas as Camadas';

  const chave = `${afloramento}|${camada}`;
  const dados = await carregarJSON('estereogramas');

  if (!dados || !dados[chave]) {
    document.getElementById('imagem-estereograma').innerHTML = 
      `<p style="text-align:center; color:red;">Erro ao carregar estereograma</p>`;
    return;
  }

  const estereograma = dados[chave];
  if (estereograma.imagem_base64) {
    const img = document.querySelector('#imagem-estereograma img');
    if (img) {
      img.src = `data:image/png;base64,${estereograma.imagem_base64}`;
    }
  }

  esconderLoading('imagem-estereograma');
}

document.addEventListener('DOMContentLoaded', inicializarEstereogramas);
