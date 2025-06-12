const map = L.map('map').setView([-15.78, -47.93], 4);
  let pontos = [];
  let marcadores = [];
  let linhas = [];

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  map.on('click', function(e) {
    const tipoViagem = document.getElementById('tipoViagem').value;
    const limitePontos = tipoViagem === 'direta' ? 2 : 4;

    if (pontos.length >= limitePontos) {
      return;
    }

    const { lat, lng } = e.latlng;
    pontos.push([lat, lng]);

    const marcador = L.marker([lat, lng]).addTo(map);
    let label = 'Ponto';
    if (pontos.length === 1) label = 'Origem';
    else if (pontos.length === limitePontos) label = 'Destino';
    else label = `Parada ${pontos.length - 1}`;
    marcador.bindPopup(label).openPopup();
    marcadores.push(marcador);
  });

  function toRad(valor) {
    return valor * Math.PI / 180;
  }

  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calcular() {
    const tipoAviao = document.getElementById('tipoAviao').value;
    const velocidadeMedia = tipoAviao === 'particular' ? 600 : 850;

    if (pontos.length < 2) {
      document.getElementById('resultado').innerText = "Selecione pelo menos origem e destino.";
      return;
    }

    let distanciaTotal = 0;

    linhas.forEach(l => map.removeLayer(l));
    linhas = [];

    for (let i = 0; i < pontos.length - 1; i++) {
      const [lat1, lon1] = pontos[i];
      const [lat2, lon2] = pontos[i + 1];
      distanciaTotal += calcularDistancia(lat1, lon1, lat2, lon2);

      const linha = L.polyline([pontos[i], pontos[i + 1]], { color: 'blue', weight: 4 }).addTo(map);
      linhas.push(linha);
    }

    const tempoHoras = distanciaTotal / velocidadeMedia;
    const horas = Math.floor(tempoHoras);
    const minutos = Math.round((tempoHoras - horas) * 60);

    document.getElementById('resultado').innerText =
      `Tipo de avião: ${tipoAviao === 'particular' ? 'Particular (~600 km/h)' : 'Comercial (~850 km/h)'}
Velocidade média: ${velocidadeMedia} km/h
Distância total: ${distanciaTotal.toFixed(2)} km
Tempo estimado: ${horas}h ${minutos}min`;
  }

  function resetar() {
    pontos = [];
    marcadores.forEach(m => map.removeLayer(m));
    linhas.forEach(l => map.removeLayer(l));
    marcadores = [];
    linhas = [];
    document.getElementById('resultado').innerText = '';
  }