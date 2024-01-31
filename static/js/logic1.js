let newYorkCoords = [40.73, -74.0059];
let mapZoomLevel = 12;

// Bonus Part

// Create the createBonusMarkers function.
function createBonusMarkers(response) {
    // Pull the "stations" property from response.data.
    let stations = response.data.stations;
  
    // Perform a second API call to get station status.
    d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_status.json").then(function (statusResponse) {
      // Pull the "stations" property from statusResponse.data.
      let stationStatus = statusResponse.data.stations;
  
      // Initialize layer groups for different station statuses.
      let comingSoonGroup = L.layerGroup();
      let emptyStationsGroup = L.layerGroup();
      let outOfOrderGroup = L.layerGroup();
      let lowStationsGroup = L.layerGroup();
      let healthyStationsGroup = L.layerGroup();
  
      // Loop through the stations array for bonus markers.
      for (let i = 0; i < stations.length; i++) {
        let station = stations[i];
  
        // Find the corresponding status for the current station.
        let currentStatus = stationStatus.find(status => status.station_id === station.station_id);
  
        // For each station, create a bonus marker.
        let bonusBikeMarker = L.marker([station.lat, station.lon])
          .bindPopup(`<strong>${station.name}</strong><br>Capacity: ${station.capacity}<br>Available Bikes: ${currentStatus.num_bikes_available}`);
  
        // Add the bonus marker to the corresponding layer group based on station status.
        if (!currentStatus.is_installed) {
          comingSoonGroup.addLayer(bonusBikeMarker);
        } else if (currentStatus.num_bikes_available === 0) {
          emptyStationsGroup.addLayer(bonusBikeMarker);
        } else if (!currentStatus.is_renting) {
          outOfOrderGroup.addLayer(bonusBikeMarker);
        } else if (currentStatus.num_bikes_available < 5) {
          lowStationsGroup.addLayer(bonusBikeMarker);
        } else {
          healthyStationsGroup.addLayer(bonusBikeMarker);
        }
      }
  
      // Create a layer control with different groups for bonus markers.
      createBonusMap(comingSoonGroup, emptyStationsGroup, outOfOrderGroup, lowStationsGroup, healthyStationsGroup);
    });
  }
  
  // Create the createBonusMap function.
  function createBonusMap(comingSoonGroup, emptyStationsGroup, outOfOrderGroup, lowStationsGroup, healthyStationsGroup) {
    // Create the tile layer that will be the background of our map.
    let lightmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Map data &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });
  
    // Create a baseMaps object to hold the lightmap layer.
    let baseMaps = {
      "Light Map": lightmap
    };
  
    // Create an overlayMaps object to hold different bonus groups.
    let overlayMaps = {
      "Coming Soon": comingSoonGroup,
      "Empty Stations": emptyStationsGroup,
      "Out of Order": outOfOrderGroup,
      "Low Stations": lowStationsGroup,
      "Healthy Stations": healthyStationsGroup
    };
  
    // Create the map object with options.
    let map = L.map("map-id", {
      center: newYorkCoords,
      zoom: mapZoomLevel,
      layers: [lightmap, comingSoonGroup, emptyStationsGroup, outOfOrderGroup, lowStationsGroup, healthyStationsGroup]
    });
  
    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps).addTo(map);
  }
  
  // Perform an API call to the Citi Bike API to get the station information. Call createBonusMarkers when it completes.
  d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json").then(createBonusMarkers);
  