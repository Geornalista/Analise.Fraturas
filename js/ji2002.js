<!-- frontend/js/ji2002.js -->
/**
 * Página: Espessura × Espaçamento (Ji 2002)
 */

async function inicializarJi2002(autor) {
  const dados = await carregarJSON('ji2002');
  if (!dados) return;

  const selectAutor = document.getElementById('autor-select');
  if (selectAutor && dados.autores) {
    const optionTodos = document.createElement('option');
    optionTodos.value = 'Todos os autores';
    optionTodos.textContent = 'Todos os autores';
    selectAutor.appendChild(optionTodos);

    dados.autores.forEach(autor => {
      const option = document.createElement('option');
      option.value = autor;
      option.textContent = autor;
      selectAutor.appendChild(option);
    });
    selectAutor.addEventListener('change', () => renderizarJi2002(selectAutor.value));
  }

  renderizarJi2002('Todos os autores');

  // Mostrar referências
  if (dados.referencias && dados.referencias.length > 0) {
    const refDiv = document.getElementById('referencias-ji2002');
    if (refDiv) {
      let refHtml = '<h4>Referências Bibliográficas:</h4><ul>';
      dados.referencias.forEach(ref => {
        refHtml += `<li>${ref}</li>`;
      });
      refHtml += '</ul>';
      refDiv.innerHTML = refHtml;
    }
  }
}

async function renderizarJi2002(autor) {
  mostrarLoading('grafico-ji2002');

  const dados = await carregarJSON('ji2002');
  if (!dados) {
    esconderLoading('grafico-ji2002');
    return;
  }

  let dadosFiltrados = dados.dados || [];
  if (autor !== 'Todos os autores') {
    dadosFiltrados = dadosFiltrados.filter(d => d.autor === autor);
  }

  if (dadosFiltrados.length === 0) {
    document.getElementById('grafico-ji2002').innerHTML = 
      `<p style="text-align:center; color:#999;">Sem dados para ${autor}</p>`;
    return;
  }

  // Gráfico log-log
  const trace = {
    x: dadosFiltrados.map(d => d.espessura),
    y: dadosFiltrados.map(d => d.espacamento),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 8,
      color: '#ff7f0e',
      opacity: 0.6
    },
    text: dadosFiltrados.map(d => d.autor),
    hovertemplate: '<b>%{text}</b><br>Espessura: %{x:.2f}<br>Espaçamento: %{y:.2f}<extra></extra>'
  };

  const layout = {
    title: `Espessura vs. Espaçamento (escala log-log) - ${autor}`,
    xaxis: {
      title: 'Espessura (m)',
      type: 'log'
    },
    yaxis: {
      title: 'Espaçamento (m)',
      type: 'log'
    },
    height: 600
  };

  esconderLoading('grafico-ji2002');
  Plotly.newPlot('grafico-ji2002', [trace], layout, { responsive: true });
}

document.addEventListener('DOMContentLoaded', inicializarJi2002);
