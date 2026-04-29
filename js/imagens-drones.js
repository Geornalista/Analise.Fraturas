/**
 * Página: Imagens de Drones
 */

async function inicializarImagensDrones() {
  try {
    console.log("A iniciar busca dos dados de imagens...");
    
    // Lista de possíveis caminhos para o JSON no GitHub Pages
    const caminhosPossiveis = [
      '../data/imagens_drones.json',    
      '../../data/imagens_drones.json', 
      './data/imagens_drones.json',     
      '/data/imagens_drones.json'       
    ];

    let imagensGlobais = null;

    // Tenta procurar o ficheiro nos vários caminhos
    for (const caminho of caminhosPossiveis) {
      try {
        const res = await fetch(caminho);
        if (res.ok) {
          imagensGlobais = await res.json();
          break; 
        }
      } catch (e) {
        // Ignora erros de rede aqui para tentar o próximo caminho
      }
    }

    if (!imagensGlobais) {
      throw new Error("Ficheiro imagens_drones.json não encontrado.");
    }

    const selectAfl = document.getElementById('afloramento-select');
    
    if (selectAfl) {
      // Limpa e adiciona a opção padrão
      selectAfl.innerHTML = '<option value="">Selecione um afloramento...</option>';

      // Preenche com as chaves do JSON
      Object.keys(imagensGlobais).forEach(aflNome => {
        const option = document.createElement('option');
        option.value = aflNome;
        option.textContent = aflNome;
        selectAfl.appendChild(option);
      });

      // Adiciona o evento para mudar a imagem quando selecionar
      selectAfl.addEventListener('change', () => mostrarImagemDrone(selectAfl.value, imagensGlobais));
    }

  } catch (erro) {
    console.error("Erro fatal ao carregar os dados:", erro);
  }
}

// Função para atualizar a tag <img> no HTML
function mostrarImagemDrone(aflNome, imagensGlobais) {
  if (!aflNome) return;
  
  const caminhoImagem = imagensGlobais[aflNome];
  
  // Procura a tag de imagem no HTML usando o atributo 'alt' que vi na sua captura de ecrã
  // Se a sua imagem tiver um ID específico (ex: id="imagem-drone"), pode trocar aqui.
  const imgTag = document.querySelector('img[alt="Imagem do Afloramento"]');
  
  if (imgTag && caminhoImagem) {
    // Adicionamos '../' assumindo que as páginas estão na pasta 'pages' 
    // e 'aflos_imagens' está um nível acima
    imgTag.src = `../${caminhoImagem}`;
    imgTag.style.display = 'block'; // Garante que a imagem fica visível
  } else {
    console.warn("Tag de imagem não encontrada para ser atualizada. Verifique se o atributo 'alt' está correto.");
  }
}

document.addEventListener('DOMContentLoaded', inicializarImagensDrones);
