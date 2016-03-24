/* global ol */
/* global Windy */

var raster = new ol.layer.Tile({
  source: new ol.source.Stamen({
    layer: 'toner'
  })
});

var osm = new ol.layer.Tile({
  source: new ol.source.OSM({
    layer: 'toner'
  })
});

var map = new ol.Map({
  layers: [raster],
  target: document.getElementById('map'),
  view: new ol.View({
    center: [2000000, -3750000],
    maxZoom: 19,
    zoom: 6
  })
});


var windy;
var canvas;

var canvasFunction = function(extent, resolution, pixelRatio, size, projection) {

  console.log('canvasFunction ' + extent + ' | ' + resolution + ' | ' + pixelRatio + ' | ' + size + ' | ' + projection.getCode() );

  canvas = $('canvas#canvasLayer')[0];
  var context = canvas.getContext('2d');

  //var canvasWidth = size[0],
  //    canvasHeight = size[1];
  
  //canvas.setAttribute('width', canvasWidth);
  //canvas.setAttribute('height', canvasHeight);

  canvas.setAttribute('width', map.getSize()[0]);
  canvas.setAttribute('height', map.getSize()[1]);

  // Canvas extent is different than map extent, so compute delta between 
  // left-top of map and canvas extent.
  var mapExtent = map.getView().calculateExtent(map.getSize());
  var canvasOrigin = map.getPixelFromCoordinate([extent[0], extent[3]]);
  var mapOrigin = map.getPixelFromCoordinate([mapExtent[0], mapExtent[3]]);
  var delta = [mapOrigin[0] - canvasOrigin[0], mapOrigin[1] - canvasOrigin[1]];

  //var point = ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:3857');
  //var pixel = map.getPixelFromCoordinate(point);
  //var cX = pixel[0] + delta[0],
  //    cY = pixel[1] + delta[1];

  return canvas;
};


var canvasLayer = new ol.layer.Image({
  source: new ol.source.ImageCanvas({
    canvasFunction: canvasFunction,
    projection: 'EPSG:3857'
  })
});

map.addLayer(canvasLayer);


$.getJSON('gfs.json', function(gfs) {

      console.log('gfs');

      windy = new Windy({
        canvas: canvas,
        data: gfs
      });
      redraw();
    });

map.getView().on('change:center', redraw);
map.getView().on('change:resolution', redraw);


function redraw() {
  
  console.log('redraw');

  windy.stop();
  
  setTimeout(function() {
    var mapSize = map.getSize();
    var extent = map.getView().calculateExtent(mapSize);
    extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    var bounds = [
        [0,0],
        [mapSize[0], mapSize[1]]
      ]; 
    console.log('redraw windy.start ' + bounds + ' | ' + mapSize + ' | ' + extent);
    windy.start(
      bounds,
      mapSize[0], mapSize[1], 
      [
        [extent[0], extent[1]],
        [extent[2], extent[3]]
      ], [0,0]
      //windy_delta
    );
  }, 500);
}


