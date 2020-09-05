var map = d3.select('#map');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

//
var nodeFeatures = []

// Create leaflet map with Atlanta as its central point
var nykLatLng = new L.LatLng(40.7128, -74.0060); // lat - lon
var myMap = L.map('map').setView(nykLatLng, 11);

// Crete a tile layer on which other shapes and viz are being drawn
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    minZoom: 3,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoibm5uaWdodGluZ2FsZSIsImEiOiJjazJucjVjdGEwMnB6M21uemh1bTRjbHE2In0.zXLlVq-XgY4NSeTagtGFrQ'
}).addTo(myMap);

// A function that pops up longtitude and latitude when clicking on the map
//var popup = L.popup();


//lat, lgt >>> x , y
function get_xy(latitude, longitude, grid_size = 0.04){
    const d1 = 111; //km
    let lat = latitude - o_lat;
    let y = lat / grid_size * d1;

    let d2 = 2 * Math.PI * R / 360 * Math.cos(latitude);
    let lon = longitude - o_lon;
    let x = lon * d2 / grid_size;
    return [x, y];
};

function onMapClick(e) {
    console.log('123');
    var latlng = myMap.mouseEventToLatLng(e.originalEvent);
    let xy = get_xy(latlng.lat, latlng.lng);
    console.log(latlng.lat + ', ' + latlng.lng);
    console.log(xy);

    fetch('http://localhost:3000/data', {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({lat: latlng.lat + "", lng: latlng.lng})
        })
      .then( 
          response => response.json() 
        )
      .then( 
          // more code to do something
          json => console.log(json) 
        )
      .catch( 
          error => console.error('error:', error) 
    );
}

// register click
myMap.on('click', onMapClick);


// Placeholders for powergrid nodes
var svgLayer = L.svg();
svgLayer.addTo(myMap);

var svg = d3.select('#map').select('svg');
var nodeLinkG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');


o_lat = 40.474226;
o_lon = -74.229163;
R = 6373;

// helper function for calculate lat, lon from x, y, grid_size = 0.04 -> pickup, grid_size = 1.25 -> dropoff
function calcLat(y, grid_size) {
    var d = 111;
    var lat = y / d * grid_size;
    var latitude = o_lat + lat;
    return latitude;
}

function calcLon(x, latitude, grid_size) {
    var d = 2 * 3.1415926 * R / 360 * Math.cos(latitude);
    var lon = x / d * grid_size;
    longitude = o_lon + lon;
    return longitude;

}


// The function that draws routes on the map
function drawNodeTraces(traceData) { //[{pickupID: , 2:0 , 3:1, ......}]
    // first preprocess the lat, lon for the origin
    var originX = parseFloat(traceData[0].pickupID.split(".")[0]);
    var originY = parseFloat(traceData[0].pickupID.split(".")[1]);

    var tempLat = calcLat(originY, 0.04);
    var tempLon = calcLon(originX, tempLat, 0.04);

    var origin = [{lat: tempLat, lon: tempLon}];
    console.log(origin);
    // then preprocess the data for drop off location
    // PLACE HOLDER!!!


    // draw origin
    nodeLinkG.selectAll('circle')
        .data(origin)
        .enter()
        .append('circle')
        .style('fill', 'red')
        .style('fill-opacity', 0.6)
        .attr('r', 5);

    myMap.on('zoomend', updateLayers);
    updateLayers();
}



function updateLayers() {
    nodeLinkG.selectAll('circle')
        .attr('cx', function(d){
            
            // fetch('http://localhost:3000/data', {
            //     method: 'post',
            //     headers: {
            //         'Accept': 'application/json, text/plain, */*',
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({a: 7, str: 'Some string: &=&'})
            //     })
            //   .then( 
            //       response => response.json() 
            //     )
            //   .then( 
            //       // more code to do something
            //       json => console.log(json) 
            //     )
            //   .catch( 
            //       error => console.error('error:', error) 
            // );

            console.log(d.lon);
            console.log(d.lat);


            return myMap.latLngToLayerPoint(L.latLng(d.lat, d.lon)).x})
        .attr('cy', function(d){return myMap.latLngToLayerPoint(L.latLng(d.lat, d.lon)).y});
}

// test
drawNodeTraces([{pickupID: "1.000329"}]);
