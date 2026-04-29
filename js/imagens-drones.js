/**
 * Página: Imagens de Drones
 */

async function inicializarImagensDrones() {
  // 1. Tenta procurar pelo ID, se falhar, apanha o primeiro <select> da página automaticamente
  let selectAfl = document.getElementById('afloramento-select');
  if (!selectAfl) {
    selectAfl = document.querySelector('select');
  }

  if (!selectAfl) {
    console.error("ERRO: Nenhum dropdown (<select>) foi encontrado na página HTML.");
    alert("Erro crítico: Nenhum menu dropdown (<select>) foi encontrado no seu HTML.");
    return;
  }

  // 2. Colocar uma mensagem de feedback visual inicial
  selectAfl.innerHTML = '<option value="">A carregar afloramentos...</option>';

  try {
    console.log("A iniciar busca dos dados de imagens...");
    
    // Lista de possíveis caminhos
    const caminhosPossiveis = [
      '../data/imagens_drones.json',    
      '../../data/imagens_drones.json', 
      './data/imagens_drones.json',     
      '/data/imagens_drones.json',
      '../data/imagens-drones.json'
    ];

    let imagensGlobais = null;
    let response = null;

    // Tenta procurar o ficheiro nos vários caminhos
    for (const caminho of caminhosPossiveis) {
      try {
        const res = await fetch(caminho);
        if (res.ok) {
          response = res;
          break; 
        }
      } catch (e) {
        // Ignora erros de rede aqui para tentar o próximo caminho
      }
    }

    if (!response) {
      throw new Error("Ficheiro JSON não encontrado na pasta data.");
    }

    imagensGlobais = await response.json();

    // Limpa a mensagem de carregamento e preenche com os dados reais
    selectAfl.innerHTML = '<option value="">Selecione um afloramento...</option>';

    Object.keys(imagensGlobais).forEach(aflNome => {
      const option = document.createElement('option');
      option.value = aflNome;
      option.textContent = aflNome;
      selectAfl.appendChild(option);
    });

    // Adiciona o evento para mudar a imagem quando selecionar
    selectAfl.addEventListener('change', () => mostrarImagemDrone(selectAfl.value, imagensGlobais));

  } catch (erro) {
    console.error("Erro fatal ao carregar os dados:", erro);
    // Coloca o erro DIRETAMENTE no dropdown para visualização
    selectAfl.innerHTML = `<option value="">⚠️ Erro: ${erro.message}</option>`;
  }
}

// Função para atualizar a tag <img> no HTML
function mostrarImagemDrone(aflNome, imagensGlobais) {
  if (!aflNome) return;
  
  const caminhoImagem = imagensGlobais[aflNome];
  
  // Procura a imagem de várias formas possíveis (alt text genérico ou apenas uma imagem principal)
  const imgTag = document.querySelector('img[alt="Imagem do Afloramento"]') || document.querySelector('.container img') || document.querySelector('main img');
  
  if (imgTag && caminhoImagem) {
    // Adicionamos '../' assumindo que as páginas estão na pasta 'pages' 
    imgTag.src = `../${caminhoImagem}`;
    imgTag.style.display = 'block'; 
  } else {
    // Se não encontrar a tag da imagem, avisa, mas não quebra o dropdown
    console.warn("A tag da <img> não foi encontrada no HTML para exibir a foto. Verifique se existe um <img> na sua página imagens_drones.html");
  }
}

document.addEventListener('DOMContentLoaded', inicializarImagensDrones);
