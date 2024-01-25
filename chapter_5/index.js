const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { features } = require('process');


const app = express();

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname + '/'));


const Pool = require('pg').Pool
const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'geodb',
    password: 'postgres',
    port: 5435
});


app.get('/province', (req, res) => {
    sql = 'SELECT *,ST_AsGeoJSON(geom) AS geojson FROM dol_province';
    let jsonFeatures = [];
    db.query(sql).then((data) => {
        var rows = data.rows;
        rows.forEach((e) => {
            let feature = {
                type: 'Feature',
                geometry: JSON.parse(e.geojson),
                properties: e
            };
            jsonFeatures.push(feature);
        });
        let geoJson = {
            type: 'FeatureCollection',
            features: jsonFeatures
        };
        res.status(200).json(geoJson);
    });
});

app.get('/province_data', (req, res) => {
    sql = 'select gid,prov_nam_t from dol_province'

    let jsonFeatures = [];
    db.query(sql).then((data) => {

        res.send(data.rows)

    })

})

app.get('/province_data/:name', (req, res) => {

    const name = req.params.name;
    sql = `select gid,prov_nam_t from dol_province where prov_nam_t = '${name}'`


    let jsonFeatures = [];
    db.query(sql).then((data) => {

        new_data = {
            row: data.rows,
            field: data.fields
        }
        res.send(new_data)

    })

})

app.post('/api/get_province', async (req, res) => {
    const province = req.body;
    console.log(province.geom);

    // Convert it to a GeoJSON string
    const geoJsonString = JSON.stringify(province.geom);

    sql = `select *,st_asgeojson(geom) AS geojson from dol_amphoe as d 
    where st_intersects(d.geom,st_geomfromgeojson('${geoJsonString}'));`

    let jsonFeatures = [];

    db.query(sql).then((data) => {
        var rows = data.rows;

        rows.forEach((e) => {
            console.log(e);
            let feature = {
                type: 'Feature',
                geometry: JSON.parse(e.geojson),
                properties: e
            };
            jsonFeatures.push(feature);

        });

        let geoJson = {
            type: 'FeatureCollection',
            features: jsonFeatures
        };
        res.status(200).json(geoJson);
    });


})

app.get('/get_bokdin/:id', (req, res) => {

    const id = req.params.id;
    sql = 'SELECT *,ST_AsGeoJSON(geom) AS geojson FROM dol_bokdin where id = ${id}';
    let jsonFeatures = [];
    db.query(sql).then((data) => {
        var rows = data.rows;
        rows.forEach((e) => {
            let feature = {
                type: 'Feature',
                geometry: JSON.parse(e.geojson),
                properties: e
            };
            jsonFeatures.push(feature);
        });
        let geoJson = {
            type: 'FeatureCollection',
            features: jsonFeatures
        };
        res.status(200).json(geoJson);
    });
});


app.get('/get_idp_bokdin', (req, res) => {
    sql = 'select id_p from dol_bokdin'
    db.query(sql).then((data) => {

        console.log(data.rows);
        res.send(data.rows)


    })

})








app.listen(3000, () => {
    console.log('run on port 3000..')
})


