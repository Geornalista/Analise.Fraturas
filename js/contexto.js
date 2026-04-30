/**
 * Página: Contexto Geológico
 */

// A função já não precisa ser 'async' porque removemos o bloqueio do JSON
function inicializarContexto() {
  
  // Preencher dropdown de imagens
  const selectImagem = document.getElementById('imagem-select');
  
  if (!selectImagem) {
      console.error("ERRO: O dropdown com o ID 'imagem-select' não foi encontrado no seu ficheiro HTML.");
      return;
  }

  // Opções fixas (não precisamos carregar nenhum JSON para isto)
  const imagens = [
    'Esquema Geológico Detalhado',
    'Arcabouço Estrutural',
    'Modelo Conceitual'
  ];

  // Limpar e preencher o dropdown
  selectImagem.innerHTML = '';
  imagens.forEach(img => {
    const option = document.createElement('option');
    option.value = img;
    option.textContent = img;
    selectImagem.appendChild(option);
  });

  // Atualizar a imagem sempre que o utilizador muda a opção
  selectImagem.addEventListener('change', () => mostrarImagemContexto(selectImagem.value));

  // Forçar a exibição da primeira imagem mal a página abre
  mostrarImagemContexto('Esquema Geológico Detalhado');
}

function mostrarImagemContexto(tipoImagem) {
  const imagemEl = document.getElementById('imagem-contexto');
  
  if (!imagemEl) {
      console.error("ERRO: A tag de imagem com ID 'imagem-contexto' não foi encontrada no HTML.");
      return;
  }

  // Mapeamento dos caminhos
  const mapa = {
    'Esquema Geológico Detalhado': '../mapas/MapaGeologico.png',
    'Arcabouço Estrutural':        '../mapas/ArcaboucoEstructural.png',
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

  // 🚨 DETETOR DE ERROS DO GITHUB (Igual à página de Drones)
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
