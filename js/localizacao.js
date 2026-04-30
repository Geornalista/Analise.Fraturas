/**
 * Página: Localização dos Afloramentos
 */

// Variável global para armazenar os dados do GeoJSON
let geojsonData = null;

async function inicializarMapa() {
    const statusDiv = document.getElementById('status-dados');
    let df = null; // Nosso "DataFrame" em formato array de objetos

    try {
        // Caminhos possíveis para procurar o arquivo CSV
        const caminhosCSV = [
            '../mapas/Puntos2024.csv',
            '../../mapas/Puntos2024.csv'
        ];

        let csvText = null;

        // Tenta buscar o CSV nas pastas prováveis
        for (const caminho of caminhosCSV) {
            try {
                const res = await fetch(caminho);
                if (res.ok) {
                    csvText = await res.text();
                    break;
                }
            } catch (e) {}
        }

        if (csvText) {
            df = parseCSV(csvText);
            statusDiv.innerHTML = `✅ <strong>Dados carregados:</strong> Foram encontrados ${df.length} pontos no ficheiro CSV.`;
        } else {
            throw new Error("CSV não encontrado");
        }

    } catch (erro) {
        console.warn("CSV não encontrado. Carregando dados de exemplo.");
        statusDiv.innerHTML = `⚠️ <strong>Aviso:</strong> Ficheiro <code>Puntos2024.csv</code> não encontrado. A utilizar dados de exemplo.`;
        
        // Dados de exemplo (fallback) conforme o código Python
        df = [
            { X: -65.356744, Y: -25.288183, Z: 0, Name: 'Exemplo Ponto 1' },
            { X: -65.384466, Y: -25.277952, Z: 0, Name: 'Exemplo Ponto 2' },
            { X: -65.285448, Y: -25.294585, Z: 960.72, Name: 'Exemplo Ponto 3' }
        ];
    }

    renderizarMapa(df);
}

// Função para desenhar o mapa Leaflet
function renderizarMapa(df) {
    if (!df || df.length === 0) return;

    // Calcular o centro (média das latitudes e longitudes)
    const latitudes = df.map(row => parseFloat(row.Y)).filter(y => !isNaN(y));
    const longitudes = df.map(row => parseFloat(row.X)).filter(x => !isNaN(x));
    
    const centerLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const centerLon = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    // Inicializar o mapa (Equivalente ao folium.Map)
    const map = L.map('mapa-localizacao').setView([centerLat, centerLon], 11);

    // Camada de Satélite da Esri (Tiles="Esri.WorldImagery")
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    // Agrupamento de Marcadores (Equivalente ao MarkerCluster)
    const markerCluster = L.markerClusterGroup();

    // Ícone verde (Equivalente ao color='green' do Folium)
    const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Array para guardar as features do GeoJSON
    const features = [];

    // Adiciona os marcadores e prepara os dados do GeoJSON
    df.forEach(row => {
        const lat = parseFloat(row.Y);
        const lon = parseFloat(row.X);
        const name = row.Name || 'Ponto Desconhecido';
        const z = row.Z !== undefined && row.Z !== "" ? parseFloat(row.Z) : null;

        if (isNaN(lat) || isNaN(lon)) return; // Ignora linhas vazias/inválidas

        // Construir o Popup (balão de informação)
        let popupHtml = `<b>${name}</b><br>Latitude (Y): ${lat.toFixed(6)}<br>Longitude (X): ${lon.toFixed(6)}<br>`;
        if (z !== null && !isNaN(z)) {
            popupHtml += `Altitude (Z): ${z}<br>`;
        }

        // Criar Marcador
        const marker = L.marker([lat, lon], { icon: greenIcon });
        marker.bindPopup(popupHtml);
        markerCluster.addLayer(marker);

        // Preparar feature para GeoJSON
        const properties = { Name: name, X: lon, Y: lat };
        if (z !== null && !isNaN(z)) properties.Z = z;

        features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lon, lat] // GeoJSON é [longitude, latitude]
            },
            properties: properties
        });
    });

    // Adiciona os agrupamentos ao mapa
    map.addLayer(markerCluster);
    
    // Ajustar o zoom para mostrar todos os pontos
    const bounds = L.latLngBounds(df.map(row => [parseFloat(row.Y), parseFloat(row.X)]));
    map.fitBounds(bounds, { padding: [30, 30] });

    // Salvar GeoJSON globalmente para o botão de download
    geojsonData = {
        type: "FeatureCollection",
        features: features
    };

    // Configurar o botão de Download
    const btnDownload = document.getElementById('btn-download-geojson');
    if (btnDownload) {
        btnDownload.addEventListener('click', baixarGeoJSON);
    }
}

// Função para baixar o GeoJSON gerado
function baixarGeoJSON() {
    if (!geojsonData) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojsonData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "meus_dados_afloramentos.geojson");
    document.body.appendChild(downloadAnchorNode); // obrigatório para Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Função simples para interpretar o CSV (Leitura)
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    // Assume separador vírgula (se o seu CSV usar ponto e vírgula, troque ',' por ';')
    const separador = text.includes(';') ? ';' : ','; 
    const headers = lines[0].split(separador).map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separador);
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : null;
        });
        data.push(obj);
    }
    return data;
}

document.addEventListener('DOMContentLoaded', inicializarMapa);
