import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { get } from 'ol/proj.js';
import Overlay from 'ol/Overlay.js';
import XYZ from 'ol/source/XYZ.js';
import { toLonLat } from 'ol/proj.js';
import { toStringHDMS } from 'ol/coordinate.js';


const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('closeHiddenDiv');

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource();
const vector = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': '#ffcc33',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
});

const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});


const key = 'JVrrevZtydJvT8n7GeKr';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Limit multi-world panning to one world east and west of the real world.
// Geometry coordinates have to be within that range.
const extent = get('EPSG:3857').getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];
const map = new Map({
  layers: [new TileLayer({
    source: new XYZ({
      attributions: attributions,
      url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + key,
      tileSize: 512,
    }),
  }), raster, vector],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});



const modify = new Modify({ source: source });
map.addInteraction(modify);

let draw, snap; // global so we can remove them later
const typeSelect = document.getElementById('type');


function addInteractions() {
  draw = new Draw({
    source: source,
    type: typeSelect.value,
  });

  draw.addEventListener("drawend", function (event) {
    hiddenDiv.style.display = 'block';

  });



  map.addInteraction(draw);
  snap = new Snap({ source: source });
  map.addInteraction(snap);
}

closer.onclick = function () {
  hiddenDiv.style.display = 'none';
  closer.blur();
  return false;
};


typeSelect.onchange = function () {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
};



addInteractions();


