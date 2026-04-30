/**
 * Página: Contexto Geológico
 */

function inicializarContexto() {
  
  // 1. Busca inteligente do dropdown
  let selectImagem = document.getElementById('imagem-select');
  if (!selectImagem) {
    // Se não achar o ID, procura o primeiro select dentro da área principal da página
    selectImagem = document.querySelector('main select') || document.querySelector('.container select');
  }
  
  if (!selectImagem) {
      console.error("ERRO: O dropdown (<select>) não foi encontrado no HTML.");
      alert("Erro crítico: Nenhum menu dropdown (<select>) foi encontrado na sua página de Contexto Geológico.");
      return;
  }

  const imagens = [
    'Esquema Geológico Detalhado',
    'Arcabouço Estrutural',
    'Modelo Conceitual'
  ];

  selectImagem.innerHTML = '';
  imagens.forEach(img => {
    const option = document.createElement('option');
    option.value = img;
    option.textContent = img;
    selectImagem.appendChild(option);
  });

  selectImagem.addEventListener('change', () => mostrarImagemContexto(selectImagem.value));

  mostrarImagemContexto('Esquema Geológico Detalhado');
}

function mostrarImagemContexto(tipoImagem) {
  
  // 2. Busca inteligente da imagem (ignorando possíveis logos no header)
  let imagemEl = document.getElementById('imagem-contexto');
  if (!imagemEl) {
    imagemEl = document.querySelector('main img') || document.querySelector('.chart-section img') || document.querySelector('.container img');
  }
  
  if (!imagemEl) {
      console.error("ERRO: A tag de imagem não foi encontrada no HTML.");
      alert("Erro: A tag <img> onde o mapa deveria aparecer não foi encontrada na sua página.");
      return;
  }

  // Mapeamento dos caminhos
  const mapa = {
    'Esquema Geológico Detalhado': '../mapas/MapaGeologico.png',
    'Arcabouço Estrutural':        '../mapas/ArcaboucoEstrutural.png',
    'Modelo Conceitual':           '../mapas/ModeloConceitual.png'
  };

  const caminhoExato = mapa[tipoImagem] || '../mapas/MapaGeologico.png';

  // Remove estilos de erro de tentativas anteriores
  imagemEl.style.border = "none";
  imagemEl.style.padding = "0";
  imagemEl.style.backgroundColor = "transparent";

  // Aplica a nova imagem
  imagemEl.src = caminhoExato;
  imagemEl.alt = tipoImagem;
  imagemEl.style.display = 'block';

  // 🚨 DETETOR DE ERROS DO GITHUB
  imagemEl.onerror = function() {
    console.error(`Erro 404: O GitHub não conseguiu carregar a imagem em: ${imagemEl.src}`);
    imagemEl.alt = `⚠️ Erro: Imagem não encontrada! Verifique se a pasta 'static' ou 'mapas' e o ficheiro estão no GitHub e se as letras maiúsculas batem certo.`;
    
    // Coloca a borda vermelha para chamar a atenção
    imagemEl.style.border = "2px dashed #dc2626";
    imagemEl.style.padding = "20px";
    imagemEl.style.backgroundColor = "#fee2e2";
  };
}

document.addEventListener('DOMContentLoaded', inicializarContexto);
