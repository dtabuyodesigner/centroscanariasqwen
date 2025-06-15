let schoolData = [];

// Cargar datos desde el JSON
fetch('centros_procesados.json')
  .then(response => response.json())
  .then(data => {
    schoolData = data;
    renderFilters();
    applyFilters();
    initMap();
  })
  .catch(error => {
    console.error("Error al cargar los datos:", error);
    document.getElementById("resultados").innerHTML = "<p>No se pudieron cargar los datos.</p>";
  });

// Función para generar opciones de filtros
function renderFilters() {
  const filterIsla = document.getElementById("filter-isla");
  const filterTipo = document.getElementById("filter-tipo");
  const filterZona = document.getElementById("filter-zona");

  // Limpiar selects antes de rellenar
  filterIsla.innerHTML = '<option value="all">Todas las Islas</option>';
  filterTipo.innerHTML = '<option value="all">Todos los Tipos</option>';
  filterZona.innerHTML = '<option value="all">Todas las Zonas</option>';

  // Rellenar islas
  const islas = [...new Set(schoolData.map(item => item.Isla))];
  islas.forEach(isla => {
    const option = document.createElement("option");
    option.value = isla;
    option.textContent = isla;
    filterIsla.appendChild(option);
  });

  // Rellenar tipos
  const tipos = [...new Set(schoolData.map(item => item.Tipo))];
  tipos.forEach(tipo => {
    const option = document.createElement("option");
    option.value = tipo;
    option.textContent = tipo;
    filterTipo.appendChild(option);
  });

  // Rellenar zonas
  const zonas = [...new Set(schoolData.map(item => item.Zona))];
  zonas.forEach(zona => {
    const option = document.createElement("option");
    option.value = zona;
    option.textContent = zona;
    filterZona.appendChild(option);
  });

  // Añadir eventos a los filtros
  filterIsla.addEventListener("change", applyFilters);
  filterTipo.addEventListener("change", applyFilters);
  filterZona.addEventListener("change", applyFilters);
}

// Función para aplicar filtros
function applyFilters() {
  const selectedIsla = document.getElementById("filter-isla").value;
  const selectedTipo = document.getElementById("filter-tipo").value;
  const selectedZona = document.getElementById("filter-zona").value;
  const searchTerm = document.getElementById("buscador").value.toLowerCase();

  const filtered = schoolData.filter(item =>
    item.Nombre.toLowerCase().includes(searchTerm) ||
    item.Codigo.includes(searchTerm) ||
    (selectedIsla === "all" || item.Isla === selectedIsla) ||
    (selectedTipo === "all" || item.Tipo === selectedTipo) ||
    (selectedZona === "all" || item.Zona === selectedZona)
  );

  renderResults(filtered);
  initMap(filtered);
}

// Función para mostrar resultados
function renderResults(data) {
  const resultadosDiv = document.getElementById("resultados");
  resultadosDiv.innerHTML = "";

  if (data.length === 0) {
    resultadosDiv.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  data.forEach(school => {
    const div = document.createElement("div");
    div.className = "result-item";

    div.innerHTML = `
      <h3>${school.Nombre}</h3>
      <p><strong>Isla:</strong> ${school.Isla}</p>
      <p><strong>Zona:</strong> ${school.Zona}</p>
      <p><strong>Tipo:</strong> ${school.Tipo}</p>
      <p><strong>Aeropuerto:</strong> ${school.Aeropuerto}</p>
      <p><strong>Distancia:</strong> ${school.Distancia_al_Aeropuerto} km</p>
      <a href="https://www.google.com/maps?q=${encodeURIComponent(school.coordenadas)}" target="_blank">Ver en Google Maps</a>
    `;

    resultadosDiv.appendChild(div);
  });
}

// Función para inicializar el mapa
function initMap(data = schoolData) {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 28.4667, lng: -16.2500 } // Centro de Tenerife
  });

  data.forEach(school => {
    try {
      const [lat, lng] = school.coordenadas.split(',').map(Number);
      new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: school.Nombre
      });
    } catch (e) {
      console.warn(`Coordenadas inválidas para ${school.Nombre}:`, school.coordenadas);
    }
  });
}
