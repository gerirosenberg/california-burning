/* Map of GeoJSON data from firedata.geojson */

// function to instantiate the Leaflet map
function createMap () {
    // create the map
    var mymap = window.L.map('mapid').setView([37.9, -121.422], 6);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZ2VyaXJvc2VuYmVyZyIsImEiOiJja253NXpqcHYwcGFkMm9wamEwMGl2cjNxIn0.J643PPI1CW63_rGTTBeZdg'
            }).addTo(mymap);

        // call getData function
        getData(mymap);
};

$(document).ready(createMap);