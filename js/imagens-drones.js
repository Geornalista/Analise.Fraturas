/**
 * Página: Imagens de Drones
 */

async function inicializarImagensDrones() {
  // Apanha o dropdown automaticamente
  let selectAfl = document.getElementById('afloramento-select');
  if (!selectAfl) selectAfl = document.querySelector('select');
  if (!selectAfl) return;

  selectAfl.innerHTML = '<option value="">A carregar afloramentos...</option>';

  try {
    const caminhosPossiveis = [
      '../data/imagens_drones.json',    
      '../../data/imagens_drones.json', 
      './data/imagens_drones.json',     
      '/data/imagens_drones.json'
    ];

    let imagensGlobais = null;
    let response = null;

    for (const caminho of caminhosPossiveis) {
      try {
        const res = await fetch(caminho);
        if (res.ok) {
          response = res;
          break; 
        }
      } catch (e) {}
    }

    if (!response) throw new Error("Ficheiro JSON não encontrado.");

    imagensGlobais = await response.json();

    selectAfl.innerHTML = '<option value="">Selecione um afloramento...</option>';

    Object.keys(imagensGlobais).forEach(aflNome => {
      const option = document.createElement('option');
      option.value = aflNome;
      option.textContent = aflNome;
      selectAfl.appendChild(option);
    });

    selectAfl.addEventListener('change', () => mostrarImagemDrone(selectAfl.value, imagensGlobais));

    // Mostra automaticamente a primeira imagem (posição 1, porque a 0 é o "Selecione...")
    if (selectAfl.options.length > 1) {
      selectAfl.selectedIndex = 1; 
      mostrarImagemDrone(selectAfl.value, imagensGlobais);
    }

  } catch (erro) {
    selectAfl.innerHTML = `<option value="">⚠️ Erro: ${erro.message}</option>`;
  }
}

// Função atualizada e com foco direto no erro do GitHub Pages
function mostrarImagemDrone(aflNome, imagensGlobais) {
  if (!aflNome) return;
  
  const caminhoRelativo = imagensGlobais[aflNome];
  const imgTag = document.querySelector('img[alt="Imagem do Afloramento"]') || document.querySelector('.container img') || document.querySelector('main img');
  
  if (imgTag && caminhoRelativo) {
    // Com a estrutura de pastas fornecida, este caminho é o único correto:
    const caminhoExato = `../${caminhoRelativo}`;
    
    // Limpa erros anteriores antes de tentar carregar nova imagem
    imgTag.style.border = "none";
    imgTag.style.padding = "0";
    
    imgTag.src = caminhoExato;
    imgTag.style.display = 'block'; 

    // 🚨 DETETOR DE ERROS DO GITHUB: Se a imagem não for encontrada, este evento dispara
    imgTag.onerror = function() {
      console.error(`Erro 404: O GitHub não conseguiu carregar a imagem em: ${imgTag.src}`);
      imgTag.alt = `⚠️ Erro: Ficheiro não encontrado! Verifique se as maiúsculas/minúsculas da imagem batem certo com o JSON.`;
      
      // Coloca uma borda vermelha e fundo para chamar a atenção ao erro
      imgTag.style.border = "2px dashed #dc2626";
      imgTag.style.padding = "20px";
      imgTag.style.backgroundColor = "#fee2e2";
    };
    
    // Se a imagem carregar bem, garante que fica bonita e sem os avisos de erro
    imgTag.onload = function() {
      imgTag.alt = `Imagem de ${aflNome}`;
      imgTag.style.border = "none";
      imgTag.style.padding = "0";
      imgTag.style.backgroundColor = "transparent";
    };

  }
}

document.addEventListener('DOMContentLoaded', inicializarImagensDrones);
