/* Javascript by Geri Rosenberg, 2019 */

/* global $, L */

// calculate the radius of each proportional symbol
function calcPropRadius(attValue) {

  // scale factor to adjust symbol size evenly
  var scaleFactor = 30;

  // area based on attribute value and scale factor
  var area = Number(attValue) / scaleFactor;

  // radius calculated based on area
  var radius = Math.sqrt(area/Math.PI);

  return radius;
};

// function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes) {

  // assign the current attribute based on the first index of the attributes array
  const year = attributes[0];

  // create marker options
  var options = {
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };

  // for each feature, determine its value for the selected attribute
  var attValue = feature.properties[year];

  // give each feature's circle marker a radius based on its attribute value
  options.radius = calcPropRadius(attValue);

  // create circle marker layer
  var layer = L.circleMarker(latlng, options);

  // add formatted attribute to popup content string
  var popupContent = "<p><b>County:</b> " + feature.properties.COUNTY + "<p><b>Acres burned in " + year + ":</b> " + feature.properties[year] + "</p>";

  // bind the popup to the circle marker
  layer.bindPopup(popupContent, {
    offset: new L.Point(0, -options.radius),
    closeButton: true
  });

  // event listeners to open popup on hover
  layer.on({
    // mouseover: function() {
    //   // highlight it
    // },
    // mouseout: function() {
    //   // back to normal
    // }

    click: function() {
      this.openPopup();
    }
  });

  // return the circle marker to the L.geoJson pointToLayer option
  return layer;
};

// add circle markers for point features to the map
function createPropSymbols(data, map, attributes) {

  // create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return pointToLayer(feature, latlng, attributes);
    }
  }).addTo(map);
};

// create slider widget
function createSequenceControls(map, attributes) {
  // create range input element (slider)
  $('#panel').append('<input class="range-slider" type="range">');

  // set slider attributes
  $('.range-slider').attr({
    max: 8,
    min: 0,
    value: 0,
    step: 1
  })

  // add skip buttons
  $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
  $('#panel').append('<button class="skip" id="forward">Skip</button>');
  $('#reverse').html('<img src="img/arrow_reverse.png">');
  $('#forward').html('<img src="img/arrow_forward.png">');

  // add filter buttons
  $('#panel').append('<p><button class="filter" id="display-all">Display all</button></p>')
  $('#panel').append('<p><button class="filter" id="larger-than-100">Larger than 100</button></p>')
  $('#panel').append('<p><button class="filter" id="larger-than-500">Larger than 500</button></p>')
  $('#panel').append('<p><button class="filter" id="larger-than-1000">Larger than 1000</button></p>')

  // click listener for skip/reverse buttons
  $('.skip').click(function() {
    // get the old index value
    var index = $('.range-slider').val();

    // increment or decrement depending on button clicked
    if ($(this).attr('id') === 'forward') {
      index++;

      // if past the last attribute, wrap around to first attribute
      index = index > 8 ? 0 : index;
    } else if ($(this).attr('id') === 'reverse') {
      index--;

      // if past the first attribute, wrap around to last attribute
      index = index < 0 ? 8 : index;
    };

    // update slider
    $('.range-slider').val(index);

    // clear filter
    clearFilter(map);

    // pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
  });

  // input listener for slider
  $('.range-slider').on('input', function() {

    // get the new index value
    var index = $(this).val();

    // pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
  });

  // click listener for filter buttons
    $('#display-all').click(function() {
      clearFilter(map);
    });

    $('#larger-than-100').click(function() {
      const index = $('.range-slider').val();
      filterByAcre(map, 100, attributes[index]);
    });

    $('#larger-than-500').click(function() {
      const index = $('.range-slider').val();
      filterByAcre(map, 500, attributes[index]);
    });

    $('#larger-than-1000').click(function() {
      const index = $('.range-slider').val();
      filterByAcre(map, 1000, attributes[index]);
    });

};

// build an attributes array from the data
function processData(data) {

  // empty array to hold attributes
  var attributes = [];

  // properties of the first feature in the dataset
  var properties = data.features[0].properties;

  // push each attribute name into attributes array
  for (var attribute in properties) {

    // only take attributes with acre values
    if (attribute.indexOf("20") > -1) {
      attributes.push(attribute);
    };
  };

  return attributes;

};

// resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute) {
  map.eachLayer(function(layer) {
    if (layer.feature && typeof(layer.feature.properties[attribute]) !== 'undefined') {
      
      // access feature properties
      var props = layer.feature.properties;

      // update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);

      layer.setRadius(radius);

      // add formatted attribute to panel content string
      var popupContent = "<p><b>County:</b> " + props.COUNTY + "</p>" + "<p><b>Acres burned in " + attribute + ":</b> " + props[attribute] + "</p>";

      // replace the layer popup
      layer.bindPopup(popupContent, {
        offset: new L.Point(0, -radius)
      });
    };
  });
};

// filter out data smaller than 500 acres
function filterByAcre(map, acreage, attribute) {
  map.eachLayer(function(layer) {
    if (layer.feature) {
      let props = layer.feature.properties;

        // filter out fires smaller than 500
        if (props[attribute] <= acreage) {
          console.log(`hiding ${props.COUNTY} for year ${attribute}`)
          layer.getElement().style.display = 'none';
        } else {
          layer.getElement().style.display = 'inline';
        };
    }
  });
};

// clear filter when changing years
function clearFilter(map) {
  console.log("Clearing");
  map.eachLayer(function(layer) {
    if (layer.feature) {
      layer.getElement().style.display = 'inline';
    };
  });
}

// Import GeoJSON data
function getData(map) {
  // load the data
  $.ajax("http://localhost:8000/js/firedata.geojson",
    {
      dataType: "json",
      success: function(response) {

        // create an attributes array
        var attributes = processData(response);

        // call function to create proportional symbols
        createPropSymbols(response, map, attributes);
        createSequenceControls(map, attributes);
      }
    });
};