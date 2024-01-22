var map = L.map('map', {zoomControl: false}).setView([13.74, 100.50], 6);

var googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attributions: '&copy; <a href="https://www.google.co.th/maps/">Google</a>'
}).addTo(map);
var googleTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    attributions: '&copy; <a href="https://www.google.co.th/maps/">Google</a>'
});
var cartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 
    contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
});

var th_pote_rice = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/food4res/wms?", {
    layers: 'food4res:th_pote_rice',
    format: 'image/png',
    attribution: '&copy; <a href="https://mapedia.co.th/">MAPEDIA</a>',
    transparent: true,
}).addTo(map);

var landuse52 = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/food4res/wms?", {
    layers: 'food4res:landuse52',
    format: 'image/png',
    attribution: '&copy; <a href="https://mapedia.co.th/">MAPEDIA</a>',
    transparent: true,
}).addTo(map);

var provinces = L.layerGroup().addTo(map); //สร้างตัวแปลสำหรับเก็บเลเยอร์ จังหวัด
var nsl_layer = L.layerGroup().addTo(map); //สร้างตัวแปลสำหรับเก็บเลเยอร์ การใช้ประโยชน์ที่ดิน
var bokdin_layer = L.layerGroup().addTo(map); //สร้างตัวแปลสำหรับเก็บเลเยอร์ ตำแหน่งบอกดิน

var baseMaps = {
    "CartoDB_DarkMatter": cartoDB_DarkMatter,
    "Google Hybrid": googleHybrid,
    "Google Terrain": googleTerrain
};
var overlayMaps = {
    'th_pote_rice': th_pote_rice,
    'landuse52': landuse52,
    'th_province': provinces,
    'nsl_layer': nsl_layer,
    'bokdin_layer': bokdin_layer,
};
L.control.layers(baseMaps, overlayMaps).addTo(map);

L.control.zoom({
    position: 'topright'
}).addTo(map);

var provices_data = []; //สร้างตัวแปลสำหรับเก็บข้อมูลจังหวัด
function get_provinces() {
    $.getJSON(`https://ogc.mapedia.co.th/api/v2/province/list`, function (data) {
        provices_data = data.result;
        console.log(provices_data);
        var geoJsonLayers = []; 
        var option_province = '<option value="ทั้งหมด">ทั้งหมด</option>'
        provices_data.forEach((e,i) => {
            option_province += '<option value="' + e.jsonb_build_object.properties.pv_th + '">' + 
            e.jsonb_build_object.properties.pv_th + '</option>'

            var geojson = L.geoJson(e.jsonb_build_object.geometry).addTo(provinces)
            geoJsonLayers.push(geojson);

            if(provices_data.length==i+1){
                var provinceBounds = L.featureGroup(geoJsonLayers);
                
                if (geoJsonLayers.length > 0) {
                const groupBounds = provinceBounds.getBounds();
                map.fitBounds(groupBounds, { maxZoom: 14 });
                }
            }
        });
        document.getElementById("list_province").innerHTML = option_province
    })
}
get_provinces();


function submit_filter() {
    provinces.clearLayers();
    nsl_layer.clearLayers();
    bokdin_layer.clearLayers();

    var selectProvince = $("#list_province").val();
    if(selectProvince==='ทั้งหมด'){
        get_provinces();
    }else{
        var province = provices_data.find((e) => e.jsonb_build_object.properties.pv_th === selectProvince);
        var geojson = L.geoJson(province.jsonb_build_object.geometry).addTo(provinces)
        map.fitBounds(geojson.getBounds(), { maxZoom: 14 });

        $.getJSON("nsl.geojson", function (data) {
            var nsl = data.features.filter((e) => e.properties.PROVINCE === selectProvince);
            console.log(nsl);

            if(nsl.length>0){
                var nslLayers = {
                    "type":"FeatureCollection",
                    "features":nsl
                };
                L.geoJson(nslLayers,{color: 'red'}).addTo(nsl_layer)
            }
        })
        $.getJSON("bokdin.geojson", function (data) {
            var bokdin = data.features.filter((e) => e.properties.Add_Provin === selectProvince);
            console.log(bokdin);

            if(bokdin.length>0){
                var bokdinLayers = {
                    "type":"FeatureCollection",
                    "features":bokdin
                };
                L.geoJson(bokdinLayers).addTo(bokdin_layer)
            }
        })
    }
    
}

function clear_filter() {
    provinces.clearLayers();
    nsl_layer.clearLayers();
    bokdin_layer.clearLayers();

    get_provinces();
}

function clear_marker() {
    markers.clearLayers();

    map.setView([13.74, 100.50], 6);
}

var markers = L.layerGroup().addTo(map);
function submit_current_location() {
    markers.clearLayers();
    function onLocationFound(e) {
        var radius = e.accuracy;
        var marker = L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();
        markers.addLayer(marker);
        var marker2 = L.circle(e.latlng, radius).addTo(map)
        markers.addLayer(marker2);
    }
    map.locate({setView: true, maxZoom: 16});
    map.on('locationfound', onLocationFound);
    function onLocationError(e) {
        alert(e.message);
    }
    map.on('locationerror', onLocationError);
}

function submit_coodinate() {
    markers.clearLayers();
    var latitude = $("#latitude").val();
    var longitude = $("#longitude").val();
    console.log(latitude, longitude);

    map.setView([latitude, longitude], 16);
    var marker = L.marker([latitude, longitude]).addTo(map)
    .bindPopup("ตำแหน่ง<br>latitude : " + latitude + ", longitude : " + longitude).openPopup();
    markers.addLayer(marker);
    map.addLayer(markers);
}

const search = new GeoSearch.GeoSearchControl({
    provider: new GeoSearch.OpenStreetMapProvider(),
    position: 'topright',
    style: 'bar',
});
map.addControl(search);


var measureControl = new L.Control.Measure({ position: 'topright' });
measureControl.addTo(map);

var easyPrint = L.easyPrint({
    title: 'My awesome print button',
    position: 'topright',
    sizeModes: ['A4Portrait', 'A4Landscape']
})
easyPrint.addTo(map);