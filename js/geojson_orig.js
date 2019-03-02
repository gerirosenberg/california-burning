/* Map of GeoJSON data from MegaCities.geojson */

// function to instantiate the Leaflet map
function createMap () {
    // create the map
    var mymap = window.L.map('mapid').setView([20, 0], 2);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZ2VyaXJvc2VuYmVyZyIsImEiOiJjamxuMmRqbHQxZWd0M2tteG1hNWY0aHhrIn0.yZNyPxQAxm-UbQrCb4F2Rw'
            }).addTo(mymap);

        // call getData function
        getData(mymap);
};

// function to attach popups to each mapped feature
function onEachFeature (feature, layer) {
    // no property named popupContect; instead create html string with all properties
    console.log(feature)
    var popupContent = "";
    if (feature.properties) { 
        // loop to add feature property names and values to html string
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

// function to retrieve the data and place it on the map
function getData (map) {
    // load the data
    $.ajax("https://gist.githubusercontent.com/gerirosenberg/0eaa4f055da3ec9451ade34aff624641/raw/e62d97fb0dbb04bd24eaeadc5448fe79462d3e17/MegaCities.geojson", {
        dataType: "json",
        success: function(response){

            // create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            // create a Leaflet GeoJSON layer and add it to the map
            console.log("works")
            L.geoJson(response, {
                onEachFeature: onEachFeature
            }).addTo(map);
        }
    });
};

$(document).ready(createMap);