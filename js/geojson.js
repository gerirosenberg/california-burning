/* Map of GeoJSON data from firedata.geojson */

// function to instantiate the Leaflet map
function createMap () {
    // create the map
    var mymap = window.L.map('mapid').setView([37.9, -121.422], 6);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoiZ2VyaXJvc2VuYmVyZyIsImEiOiJja253NXpqcHYwcGFkMm9wamEwMGl2cjNxIn0.J643PPI1CW63_rGTTBeZdg'
            }).addTo(mymap);

        // call getData function
        getData(mymap);
};

$(document).ready(createMap);