const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { features } = require('process');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/assets', express.static(__dirname + '/assets'))

app.use('/home', express.static(__dirname + '/index.html'))
app.use('/login', express.static(__dirname + '/login.html'))
app.use('/register', express.static(__dirname + '/register.html'))
app.use('/sample', express.static(__dirname + '/sample.html'))

const Pool = require('pg').Pool
const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'geodb',
    password: 'postgres',
    port: 5436
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

app.post('/register', async (req, res) => {
    try {
        // Extract data from the request body
        const { username, password, first_name, last_name, email, role } = req.body;

        console.log(username, password, first_name, last_name, email, role);

        // Check if username or email already exists in the database
        const existingUser = await db.query('SELECT * FROM public.member WHERE username = $1 OR email = $2', [username, email]);

        if (existingUser) {
            // Username or email already exists, return an error response
            return res.status(400).json({ error: 'Username or email already in use' });
        }

        // Perform the database insertion using pg-promise
        await db.query('INSERT INTO public.member(username, password, first_name, last_name, email, role) \
        VALUES ($1, $2, $3, $4, $5, $6)', [username, password, first_name, last_name, email, role]);

        res.status(201).json({ message: 'registration successful' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        // Extract data from the request body
        const { username, password } = req.body;

        // Perform the database query using pg-promise
        const result = await db.query('SELECT first_name, last_name, email, role FROM member WHERE username = $1 AND password = $2', [username, password]);

        // Check if the user is found
        if (result) {
            // const token = jwt.sign({ username: username, password: password }, secretKey, { expiresIn: '1h' });
            // result.token = token;
            res.status(200).json(result.rows);
        }
    } catch (error) {
        res.status(500).json({ error: 'Invaid Username Password' });
    }
});








app.listen(3000, () => {
    console.log('run on port 3000..')
})


