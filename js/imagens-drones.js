/**
 * Página: Imagens de Drones
 */

async function inicializarImagensDrones() {
  const selectAfl = document.getElementById('afloramento-select');

  // 1. Verificar se o dropdown existe no HTML
  if (!selectAfl) {
    console.error("ERRO: O dropdown com ID 'afloramento-select' não foi encontrado na página HTML.");
    // Um alerta apenas para ter a certeza absoluta de que o problema é o ID do HTML
    alert("Erro: O dropdown 'afloramento-select' não foi encontrado. Verifique se o <select> no seu HTML tem este ID exato.");
    return;
  }

  // 2. Colocar uma mensagem de feedback visual inicial
  selectAfl.innerHTML = '<option value="">A carregar afloramentos...</option>';

  try {
    console.log("A iniciar busca dos dados de imagens...");
    
    // Lista de possíveis caminhos (adicionei a versão com hífen caso haja um erro de digitação no repositório)
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
    // 3. Coloca o erro DIRETAMENTE no dropdown para visualização imediata
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
    alert("O dropdown funcionou, mas a tag da <img> não foi encontrada no HTML para exibir a foto.");
  }
}

document.addEventListener('DOMContentLoaded', inicializarImagensDrones);
