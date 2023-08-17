import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { get } from 'ol/proj.js';
import Overlay from 'ol/Overlay.js';
import XYZ from 'ol/source/XYZ.js';
import WKT from 'ol/format/WKT.js';
import $ from "jquery";


const container = document.getElementById('popup');
const content = document.getElementById('hiddenDiv');
const closer = document.getElementById('closeHiddenDiv');
const closer2 = document.getElementById('closeEditDiv');
const saveParcel = document.getElementsByClassName('bottomButton');
const editDiv = document.getElementById('Editdiv');
const raster = new TileLayer({ source: new OSM(), });
const format = new WKT();
const source = new VectorSource()
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
    center: [0.0, -0.0],
    zoom: 4,
  }),
});
const modify = new Modify({ source: source });
const typeSelect = document.getElementById('type');

const getAllUrl = 'https://localhost:7269/api/parsel/getall';
const getByIdUrl = `https://localhost:7269/api/Parsel/getbyid?parselId=`

function fetchData(url, successCallback, errorCallback) {
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: successCallback,
    error: errorCallback,
  });
}
function getAllParsels() {
  fetchData(getAllUrl,
    function (response) {
      $('#tableBody').empty();
      source.refresh()
      console.log(response)
      for (var i = 0; i < response.length; i++) {
        if (response[i].wkt != null) {
          var parsel = format.readFeature(response[i].wkt, {
            dataProjection: 'EPSG:3857',
            featureProjection: 'EPSG:3857',
          });
          source.addFeature(parsel)
        }
        tabloyaVeriEkle(response[i]);
      }
    },
    function (xhr, status, error) {
      console.error(error);
    }
  );
}
function getParselById(parselId, successCallback, errorCallback) {
  fetchData(getByIdUrl + parselId,
    successCallback,
    errorCallback
  );
}
function tabloyaVeriEkle(data) {
  var tableBody = $('#tableBody');
  var row = $('<tr>');

  row.html(`
    <td>${data.parselId}</td>
    <td>${data.sehir}</td>
    <td>${data.ilce}</td>
    <td>${data.mahalle}</td>
    <td>
      <button class="edit-button">Düzenle</button>
      <button class="delete-button">Sil</button>
    </td>
  `);

  tableBody.append(row);
}

map.addInteraction(modify);

let draw, snap, selectedParselId, selectedParselWkt;
var lastDraw;

getAllParsels()

function addInteractions() {
  draw = new Draw({
    source: source,
    type: typeSelect.value,
  });

  draw.addEventListener("drawend", function (event) {
    hiddenDiv.style.display = 'block';
    lastDraw = event.feature;
    var wkt = format.writeGeometry(event.feature.getGeometry());
    //var transformedGeometry = format.readGeometry(wkt).transform('EPSG:3857', 'EPSG:4326').flatCoordinates
  });

  $(document).on('click', '.edit-button', function () {
    selectedParselId = parseInt($(this).closest('tr').find('td:eq(0)').text());
    editDiv.style.display = "block";
  });


  $(document).on('click', '.bottomButton', function () {
    var sehir = $("#placeholder1 textarea").val();
    var ilce = $("#placeholder2 textarea").val();
    var mahalle = $("#placeholder3 textarea").val();
    var wkt = format.writeGeometry(lastDraw.getGeometry());

    var data = {
      sehir: sehir,
      ilce: ilce,
      mahalle: mahalle,
      wkt: wkt
    };


    let pro = new Promise((resolve, reject) => {
      $.ajax({
        url: 'https://localhost:7269/api/parsel/add',
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
          console.log('Sunucudan gelen cevap:', response);
          resolve(response);
        },
        error: function (error) {
          console.error('Hata oluştu:', error);
          reject(error);
        }
      });
    }).then((res) => {
      getAllParsels()
    },
      (res) => { }
    );
    hiddenDiv.style.display = 'none';
  });

  map.addInteraction(draw);
  snap = new Snap({ source: source });
  map.addInteraction(snap);
}

$(document).on('click', '.bottomButton2', function () {

  getParselById(selectedParselId,
    function (parselData) {
      console.log(parselData, "qwedqweqweqweq")
      selectedParselWkt = parselData.wkt;

    },
    function (xhr, status, error) {
      console.error(error);
    }
  );
  var sehir = $("#placeholder4 textarea").val();
  var ilce = $("#placeholder5 textarea").val();
  var mahalle = $("#placeholder6 textarea").val();

  var data = {
    parselId: selectedParselId,
    sehir: sehir,
    ilce: ilce,
    mahalle: mahalle,
    wkt: selectedParselWkt
  };

  let pro = new Promise((resolve, reject) => {
    $.ajax({
      url: `https://localhost:7269/api/parsel/${selectedParselId}/update`,
      method: 'PUT',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (response) {
        source.refresh()
        console.log('Sunucudan gelen cevap:', response);
        resolve(response);
      },
      error: function (error) {
        reject(error)
        console.log(data)
        console.error('Hata oluştu:', error);
      }
    });
  }).then((res) => {
    getAllParsels()
  },
    (res) => {

    });
  editDiv.style.display = 'none';
});

$(document).on('click', '.delete-button', function () {

  var row = $(this).closest('tr');
  var data = {
    parselId: parseInt(row.find('td:eq(0)').text()),
  };

  let pro = new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://localhost:7269/api/parsel/delete',
      method: 'DELETE',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (response) {
        console.log('Silme işlemi başarılı:', response);
        resolve(response);
      },
      error: function (error) {
        reject(error)
        console.log(data)
        console.error('Hata oluştu:', error);
      }
    });
  }).then((res) => {
    getAllParsels()
  },
    (res) => {

    });
});

closer.onclick = function () {
  source.removeFeature(lastDraw)
  hiddenDiv.style.display = 'none';
  closer.blur();
  return false;
};

closer2.onclick = function () {
  editDiv.style.display = 'none';
  closer.blur();
  return false;
};


typeSelect.onchange = function () {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
};



addInteractions();


