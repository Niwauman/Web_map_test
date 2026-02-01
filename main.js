const map = new maplibregl.Map({
  container: 'map',
  style: "https://raw.githubusercontent.com/gtitov/basemaps/refs/heads/master/positron-nolabels.json",
  center: [51, 0],
  zoom: 4,
  hash: true
});

map.on("load", () => {
  fetch("https://docs.google.com/spreadsheets/d/1aCLo9AgS5oeVshffC1-LYMF2shR-wp-4H87X_1j84oI/export?format=csv")
    .then((response) => response.text())
    .then((csv) => {
      // console.log(csv)
      const rows = Papa.parse(csv, { header: true })
      // console.log(rows)
      const geojsonFeatures = rows.data.map((row) => {
        return {
          type: "Feature",
          properties: row,
          geometry: {
            type: "Point",
            coordinates: [row.lon, row.lat]
          }
        }
      })

      const geojson = {
        type: "FeatureCollection",
        features: geojsonFeatures
      }

      map.addSource("vacancies", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterRadius: 20
      })

      map.addLayer({
        id: "clusters",
        source: "vacancies",
        type: "circle",
        paint: {
          "circle-color": "#7EC8E3",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#FFFFFF",
          "circle-radius": [
            "step", ["get", "point_count"],
            12,
            3,
            20,
            6,
            30
          ]
        }
      })

      map.addLayer({
        id: "cluster-labels",
        type: "symbol",
        source: "vacancies",
        layout: {
          "text-field": ["get", "point_count"],
          "text-size": 10
        }
      })

      geojson.features.map((f) => {
        document.getElementById("list-all").innerHTML += `<div class="list-item">
                <h4>${f.properties["Название"]}</h4>
                <a href="#" onclick="map.flyTo({ center: [${f.geometry.coordinates}], zoom: 800})">Показать ближе</a>
                </div><hr>`
      })

      map.on("moveend", () => {
        const features = map.queryRenderedFeatures({ layers: ["clusters"] })
        document.getElementById("list-selected").innerHTML = "<h2>Сейчас на карте</h2>"

        features.map(f => {
          if (f.properties.cluster) {
            map.getSource("vacancies").getClusterLeaves(
              clusterId = f.properties.cluster_id,
              limit = f.properties.point_count,
              offset = 0
            )
              .then((clusterFeatures) => {
                clusterFeatures.map((feature) => document.getElementById("list-selected")
                  .innerHTML += `<div class="list-item">
                                <h4>${feature.properties["Название"]}</h4>
                                <a>Адрес: ${feature.properties["Адрес"]}</a>
                                </div><hr>`)
              })
          } else {
            document.getElementById("list-selected")
              .innerHTML += `<div class="list-item">
                                <h4>${f.properties["Название"]}</h4>
                                <a>Адрес: ${f.properties["Адрес"]}</a>
                                </div><hr>`
          }
        })
      })
    })

    
  map.on("click", "clusters", function (e) {
    map.flyTo({ center: e.lngLat, zoom: 8 });
  })

  map.on("mouseenter", "clusters", function () {
    map.getCanvas().style.cursor = "pointer";
  })


  map.on("mouseleave", "clusters", function () {
    map.getCanvas().style.cursor = "";
  })
})