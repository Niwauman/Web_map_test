// Инициализируем карту
const map = new maplibregl.Map({
  container: 'map',
//  style: "https://raw.githubusercontent.com/gtitov/basemaps/refs/heads/master/positron-nolabels.json",
   style: {
   "version": 8,
   "sources": {},
   "layers": []
 },
  center: [51, 0],
  zoom: 4
});

map.on('load', () => {
        // Выполняется после загрузки карты
    
    map.addLayer({
       id: 'background',
       type: 'background',
       paint: {
       'background-color': 'lightblue'
       }
   })
    // Добавление источника данных
    map.addSource('countries', {
        type: 'geojson',
        data: './data/countries.geojson',
        attribution: 'Natural Earth'
    })

    // Добавление слоя
    map.addLayer({
        id: 'countries-layer',
        type: 'fill',
        source: 'countries',
        paint: {
            'fill-color': ['match', ['get', 'MAPCOLOR7'], 1, 'red', 'lightgray']
        }
    })
    // Выполняется после загрузки карты
    map.addSource('rivers', {
        type: 'geojson',
        data: './data/rivers.geojson'
    })

    map.addLayer({
        id: 'rivers-layer',
        type: 'line',
        source: 'rivers',
        paint: {
            'line-color': '#82e1f1'
        }
    })

    map.addSource('lakes', {
        type: 'geojson',
        data: './data/lakes.geojson'
    })

    map.addLayer({
        id: 'lakes-layer',
        type: 'fill',
        source: 'lakes',
        paint: {
            'fill-color': 'lightblue',
            'fill-outline-color': '#00BFFF'
        }
    })

    map.addSource('cities', {
        type: 'geojson',
        data: './data/cities.geojson'
    })
    map.addLayer({
        id: 'cities-layer',
        type: 'circle',
        source: 'cities',
        paint: {
            'circle-color': 'rgb(23, 55, 240)',
            'circle-radius': 10
        },
        filter: ['>', ['get', 'POP_MAX'], 1000000]

    })

    map.on('mouseenter', 'cities-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'cities-layer', () => {
        map.getCanvas().style.cursor = ''
    })

    map.on('click', ['cities-layer'], (e) => {
        // console.log(e)
        // console.log(e.features)
        new maplibregl.Popup() // создадим попап
            .setLngLat(e.features[0].geometry.coordinates) // установим на координатах объекта
            .setHTML(e.features[0].properties.NAME) // заполним  текстом из атрибута с именем объекта
            .addTo(map); // добавим на карту
    })
})