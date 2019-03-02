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
    fillColor: "#DC143C",
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

  createPopup(feature.properties, year, layer, options.radius);

  // event listeners to open popup on hover
  layer.on({
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
  var SequenceControl = L.Control.extend({
    options: {
      position: 'bottomleft'
    },
    onAdd: function(map) {
      // create the control container div with a particular class name
      var container = L.DomUtil.create('div', 'sequence-control-container');

      // create range input element (slider)
      $(container).append('<input class="range-slider" type="range">');

      // create skip buttons
      $(container).append('<button class="skip" id="reverse">Reverse</button>');
      $(container).append('<button class="skip" id="forward">Skip</button>');

      // kill any mouse event listeners on the map
      $(container).on('dblclick', function(e) {
        L.DomEvent.stopPropagation(e);
      });

      $(container).on('mousedown', function(e) {
        map.dragging.disable();
      });

      $(container).on('mouseup', function(e) {
        map.dragging.enable();
      });

      return container;
    }
  });

  map.addControl(new SequenceControl());

  // set slider attributes
  $('.range-slider').attr({
    max: 8,
    min: 0,
    value: 0, 
    step: 1
  })

  // add images of skip buttons
  $('#reverse').html('<img src="img/arrow_reverse.png">');
  $('#forward').html('<img src="img/arrow_forward.png">');

  // // add filter buttons
  // $('#above-map').append('<p><button class="filter" id="display-all">Display all</button></p>')
  // $('#above-map').append('<p><button class="filter" id="larger-than-100">Larger than 100</button></p>')
  // $('#above-map').append('<p><button class="filter" id="larger-than-500">Larger than 500</button></p>')
  // $('#above-map').append('<p><button class="filter" id="larger-than-1000">Larger than 1000</button></p>')
  // $('#above-map').append('<p><button class="filter" id="larger-than-5000">Larger than 5000</button></p>')

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

    // update year
    var year = attributes[index];

    // change legend with click
    updateLegend(map, year);
  });

  // input listener for slider
  $('.range-slider').on('input', function() {

    // get the new index value
    var index = $(this).val();

    // pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);

    // update year
    var year = attributes[index];

    // change legend with click
    updateLegend(map, year);
  });

  // click listener for filter buttons
  // reset
  $('#display-all').click(function() {
    clearFilter(map);
  });

  // anything larger than 100 acres
  $('#larger-than-100').click(function() {
    const index = $('.range-slider').val();
    filterByAcre(map, 100, attributes[index]);
  });

  // anything larger than 500 acres
  $('#larger-than-500').click(function() {
    const index = $('.range-slider').val();
    filterByAcre(map, 500, attributes[index]);
  });


  // anything larger than 1000 acres
  $('#larger-than-1000').click(function() {
    const index = $('.range-slider').val();
    filterByAcre(map, 1000, attributes[index]);
  });

  // anything larger than 5000 acres
  $('#larger-than-5000').click(function() {
    const index = $('.range-slider').val();
    filterByAcre(map, 5000, attributes[index]);
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

      createPopup(props, attribute, layer, radius);
    };
  });
};

//function to create the legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            // add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            // start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            // array of circle names to base loop on
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            // loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string

                svg += '<circle class="legend-circle" id="' + circle + '" fill="#DC143C" fill-opacity="0.9" stroke="#000000" cx="30"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';

            };

            // close svg string
            svg += "</svg>";
            // add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};

function roundNumber(inNumber) {
  return (Math.round(inNumber/1000) * 1000);
}

// calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
  //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = roundNumber(attributeValue);
            };
        };
    });

    //set mean
    var mean = roundNumber((max) / 2);


    // return values as an object
    return {
        max: max,
        mean: mean,
        min: 1000
    };
};


// update the legend with new attribute
function updateLegend(map, attribute){
  //create content for legend
  var year = attribute;

  var content = "<h2>Acres burned in " + year + "</h2>";

  // replace legend content
  $('#temporal-legend').html(content);

  // get the max, mean, and min values as an object
  var circleValues = getCircleValues(map, attribute);

  for (var key in circleValues){
    // get the radius
    var radius = calcPropRadius(circleValues[key]);

    //Step 3: assign the cy and r attributes
    $('#'+key).attr({
        cy: 59 - radius,
        r: radius
    });

    // add legend text
    $('#'+key+'-text').text(circleValues[key] + " acres");

  }; 
};


// create popups
function createPopup(properties, attribute, layer, radius) {
  // add formatted attribute to panel content string
  var popupContent = "<p><b>County:</b> " + properties.COUNTY + "</p>" + "<p><b>Acres burned in " + attribute + ":</b> " + properties[attribute] + "</p>";

  // replace the layer popup
  layer.bindPopup(popupContent, {
    offset: new L.Point(0, -radius)
  });
}

// filter out data by acreage of fires
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
  $.ajax("./js/firedata.geojson",
    {
      dataType: "json",
      success: function(response) {

        // create an attributes array
        var attributes = processData(response);

        // call function to create proportional symbols
        createPropSymbols(response, map, attributes);

        // create sequence controls
        createSequenceControls(map, attributes);

        // build initial legend
        createLegend(map, attributes);
      }
    });
};