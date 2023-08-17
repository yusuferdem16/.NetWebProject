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
const modalOverlay = document.getElementById('modalOverlay');
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
      <button class="wktEdit-button">Edit</button>
      <button class="confirm-button" style="display: none;">Confirm</button>
      <button class="cancel-button" style="display: none;">Cancel</button>
    </td>
  `);

  tableBody.append(row);
}

function ClearFields() {
  $("#placeholder1 textarea").val("");
  $("#placeholder2 textarea").val("");
  $("#placeholder3 textarea").val("");
  $("#placeholder4 textarea").val("");
  $("#placeholder5 textarea").val("");
  $("#placeholder6 textarea").val("");
}

function fillFields(sehir, ilce, mahalle) {
  $("#placeholder4 textarea").val(`${sehir}`);
  $("#placeholder5 textarea").val(`${ilce}`);
  $("#placeholder6 textarea").val(`${mahalle}`);
}
function disableInteractions() {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  map.removeInteraction(modify);
}
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
    modalOverlay.style.display = 'block';
    lastDraw = event.feature;
    var wkt = format.writeGeometry(event.feature.getGeometry());
    //var transformedGeometry = format.readGeometry(wkt).transform('EPSG:3857', 'EPSG:4326').flatCoordinates
  });
  let sehir, ilce, mahalle;
  $(document).on('click', '.edit-button', function () {
    selectedParselId = parseInt($(this).closest('tr').find('td:eq(0)').text());
    sehir = $(this).closest('tr').find('td:eq(1)').text();
    ilce = $(this).closest('tr').find('td:eq(2)').text();
    mahalle = $(this).closest('tr').find('td:eq(3)').text();
    fillFields(sehir, ilce, mahalle);
    editDiv.style.display = "block";
    modalOverlay.style.display = 'block';
  });

  map.addInteraction(draw);
  snap = new Snap({ source: source });
  map.addInteraction(snap);
}
$(document).on('click', '.bottomButton', function () {
  modalOverlay.style.display = 'none';
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
        console.log(data);
        debugger
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
  ClearFields()
});
let feature, editParsel;
$(document).on('click', '.wktEdit-button', function () {
  $('.confirm-button, .cancel-button').hide();
  var row = $(this).closest('tr');
  row.find('.cancel-button').show();
  selectedParselId = parseInt($(this).closest('tr').find('td:eq(0)').text());
  var dataEdit;
  source.clear();
  getParselById(selectedParselId,
    function (parselData) {
      editParsel = format.readFeature(parselData.wkt, {
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857',
      })
      source.addFeature(editParsel);
      modify.on('modifyend', function (e) {
        row.find('.confirm-button').show();
        feature = e.features.getArray()[0];
        selectedParselWkt = feature;
        dataEdit = {
          parselId: selectedParselId,
          sehir: parselData.sehir,
          ilce: parselData.ilce,
          mahalle: parselData.mahalle,
          wkt: new WKT().writeFeature(selectedParselWkt)
        }
      });
      map.addInteraction(modify);

    },
    function (xhr, status, error) {
      console.error(error);
    }
  );

  $('.confirm-button').on('click', function () {
    source.refresh();
    map.removeInteraction(modify);


    let pro = new Promise((resolve, reject) => {
      $.ajax({
        url: `https://localhost:7269/api/parsel/${selectedParselId}/update`,
        method: 'PUT',
        data: JSON.stringify(dataEdit),
        contentType: 'application/json',
        success: function (response) {
          source.refresh()
          resolve(response);
        },
        error: function (error) {
          reject(error)
          console.error('Hata oluştu:', error);
        }
      });
    }).then((res) => {
      getAllParsels()
    },
      (res) => {

      });

  });
  $('.cancel-button').on('click', function () {
    map.removeInteraction(modify);
    var row = $(this).closest('tr');
    row.find('.confirm-button, .cancel-button').hide();
    getAllParsels();
  });

});
$(document).on('click', '.bottomButton2', function () {
  modalOverlay.style.display = 'none';

  getParselById(selectedParselId,
    function (parselData) {
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
        resolve(response);
      },
      error: function (error) {
        reject(error)
        console.error('Hata oluştu:', error);
      }
    });
  }).then((res) => {
    getAllParsels()
  },
    (res) => {

    });
  editDiv.style.display = 'none';
  ClearFields()
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
        resolve(response);
      },
      error: function (error) {
        reject(error)
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
  modalOverlay.style.display = 'none';
  closer.blur();
  return false;
};

closer2.onclick = function () {
  editDiv.style.display = 'none';
  modalOverlay.style.display = 'none';
  closer.blur();
  return false;
};


typeSelect.onchange = function () {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
};



addInteractions();


