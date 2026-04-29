// frontend/js/contexto.js
/**
 * Página: Contexto Geológico
 */

async function inicializarContexto() {
  const opcoes = await carregarJSON('opcoes');
  if (!opcoes) return;

  // Preencher dropdown de imagens
  const selectImagem = document.getElementById('imagem-select');
  if (selectImagem) {
    const imagens = [
      'Esquema Geológico Detalhado',
      'Arcabouço Estrutural',
      'Modelo Conceitual'
    ];

    imagens.forEach(img => {
      const option = document.createElement('option');
      option.value = img;
      option.textContent = img;
      selectImagem.appendChild(option);
    });

    selectImagem.addEventListener('change', () => mostrarImagemContexto(selectImagem.value));
  }

  // Mostrar primeira imagem
  mostrarImagemContexto('Esquema Geológico Detalhado');
}

function mostrarImagemContexto(tipoImagem) {
  const imagemEl = document.getElementById('imagem-contexto');
  if (!imagemEl) return;

  const mapa = {
    'Esquema Geológico Detalhado': '../static/mapas/MapaGeologico.png',
    'Arcabouço Estrutural':        '../static/mapas/ArcaboucoEstructural.png',
    'Modelo Conceitual':           '../static/mapas/ModeloConceitual.png'
  };

  const src = mapa[tipoImagem] || '../static/mapas/MapaGeologico.png';
  imagemEl.src = src;
  imagemEl.alt = tipoImagem;
}

document.addEventListener('DOMContentLoaded', inicializarContexto);
