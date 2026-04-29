// frontend/js/config.js
const CONFIG = {
  DATA_PATH: './data',  // ← Caminho relativo para GitHub Pages
  USE_LOCAL_JSON: true,
};

async function carregarJSON(arquivo) {
  try {
    const response = await fetch(`${CONFIG.DATA_PATH}/${arquivo}.json`);
    if (!response.ok) throw new Error(`Erro ao carregar ${arquivo}`);
    return await response.json();
  } catch (erro) {
    console.error(`Erro carregando ${arquivo}:`, erro);
    return null;
  }
}

function mostrarLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = '<p style="text-align:center; color:#999;">Carregando...</p>';
}

function esconderLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = '';
}
