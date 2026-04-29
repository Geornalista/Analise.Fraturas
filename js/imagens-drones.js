<!-- frontend/js/imagens-drones.js -->
/**
 * Página: Imagens de Drones
 */

async function inicializarImagensDrones() {
  const imagens = await carregarJSON('imagens_drones');
  if (!imagens) return;

  const selectAfl = document.getElementById('afloramento-select');
  if (selectAfl) {
    Object.keys(imagens).forEach(aflNome => {
      const option = document.createElement('option');
      option.value = aflNome;
      option.textContent = aflNome;
      selectAfl.appendChild(option);
    });
    selectAfl.addEventListener('change', () => mostrarImagemDrone(selectAfl.value, imagens));
  }

  if (Object.keys(imagens).length > 0) {
    const primeiro = Object.keys(imagens)[0];
    mostrarImagemDrone(primeiro, imagens);
  }
}
