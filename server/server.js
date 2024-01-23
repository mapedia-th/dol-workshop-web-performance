const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const corsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser());


const port = process.env.PORT || 3000;

// กำหนดค่าการเชื่อมต่อกับ PostgreSQL
const db = pgp('postgres://postgres:postgres@localhost:5432/postgres');

app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});