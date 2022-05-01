var w = $(window).width();
var h = $(window).height();

var img_w = $(window).width() / 8.0;
var img_h = $(window).height() / 4.0;
var radius = 14;

var map = L.map('mapholder', {
	zoom: 3,
	maxZoom: 19,
	scrollWheelZoom: true,
	zoomControl: false,
	noWrap: true,
	zoomAnimation: true,
	markerZoomAnimation: true,
	maxBoundsViscosity: 0.8,
	maxBounds: [
		[89.9, 220.9],
		[-89.9, -220.9]
	]
}).setView([45, 10]);


L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19,
	bounds: [
		[89.9, 220.9],
		[-89.9, -220.9]
	]
}).addTo(map);

var prevLayerClicked = null;

function onEachFeature(feature, layer) {
  layer.on({

    click: function(e){
			/*
      if (prevLayerClicked !== null) {
          // Reset style
        prevLayerClicked.setStyle({
          weight: 2,
          opacity: 0,
          color: 'fff',
          dashArray: '',
          fillOpacity: 0,
          fillColor: 'fff'
        });
      }
      map.fitBounds(e.target.getBounds());
      var layer = e.target;
      layer.setStyle({
        weight: 1,
        color: '#fff',
        dashArray: '',
        fillOpacity: 0,
        fillColor: 'red'
      });
*/
			map.fitBounds(e.target.getBounds());
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
			provinceName = feature.properties.name
			countryInfo.innerHTML = "";
      countryInfo.insertAdjacentHTML("afterbegin", "<img src=\"swi.png\"><h1>"+provinceName+"</h1><p>Description of statics if needed</p>");
			countryInfo.classList.remove("hide");
			countryInfo.classList.add("show");
			mapholder.classList.remove("show");
			mapholder.classList.add("hide");

			/*
			map.dragging.disable();
			map.touchZoom.disable();
			map.doubleClickZoom.disable();
			map.scrollWheelZoom.disable();
			map.boxZoom.disable();
			map.keyboard.disable();
			if (map.tap) map.tap.disable();
			document.getElementById('mapholder').style.cursor='default';

      prevLayerClicked = layer;
			*/
    }
  });
}

var myStyle = {
  "weight": 2,
  "opacity": 0,
	"fillOpacity": 0
}

geojson = L.geoJson(countries, {
		style: myStyle,
    onEachFeature: onEachFeature
}).addTo(map);


map.setMinZoom(map.getBoundsZoom([[50.9, 160.9], [-50.9, -160.9]]));

var curr_value = null;

$(window).resize(function () {
	if (curr_value) {
		var frame = document.getElementById(curr_value.id);
		var wn = $(window).width();
		var hn = $(window).height();
		frame.width = wn * 0.6;
		frame.height = hn * 0.6;

	}
});

function setUpFrame () {
	var frame = window.frames['frame-' + curr_value.id];
	frame.populate(curr_value);
}

var zoomControl = L.control.zoom({ position: 'topright' }).addTo(map);


// Reset button for map

$(document).ready(function () {
    $('#returnMap').on('click', function () {
        countryInfo.classList.remove("show");
        countryInfo.classList.add("hide");
        mapholder.classList.remove("hide");
        mapholder.classList.add("show");
    });
});
