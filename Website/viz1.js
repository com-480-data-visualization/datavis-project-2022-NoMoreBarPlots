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
			countryName = feature.properties.name;

			addTitle(countryName);
			if (document.getElementById("slidecontainer")) {document.getElementById("slidecontainer").remove();}
			let x = {
			    min: 0,
			    max: 0
			};
			GetTimeSlider(countryName, x);
			setTimeout(function(){
				addInput(x.min, x.max)
				let Date = document.getElementById("myRange").value;
				SankeyChart__(countryName, Date)
			}, 500);

			legend.classList.remove("hide");
			legend.classList.add("show");
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

var zoomControl = L.control.zoom({ position: 'topright' }).addTo(map);


// Reset button for map

$(document).ready(function () {
    $('#returnMap').on('click', function () {
        countryInfo.classList.remove("show");
        countryInfo.classList.add("hide");
        mapholder.classList.remove("hide");
        mapholder.classList.add("show");
				legend.classList.remove("show");
				legend.classList.add("hide");
				let targetedDiv = document.getElementById("countryInfo");
				targetedDiv.innerHTML = "";
				document.getElementById("slidecontainer").remove();
				map.setZoom(3);
    });
});


// Hide map instruction

$(document).ready(function () {
    $('#hideInstruction').on('click', function () {
        mapInstruction.classList.add("hide");
    });
});
