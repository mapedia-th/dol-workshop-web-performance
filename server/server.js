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

const secretKey = 'Hkq8jmLZM74Ywvub6X2xVU';

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

app.post('/register', async (req, res) => {
    try {
        // Extract data from the request body
        const { username, password, first_name, last_name, email, role } = req.body;

        console.log(username, password, first_name, last_name, email, role);

        // Check if username or email already exists in the database
        const existingUser = await db.oneOrNone('SELECT * FROM public.member WHERE username = $1 OR email = $2', [username, email]);

        if (existingUser) {
            // Username or email already exists, return an error response
            return res.status(400).json({ error: 'Username or email already in use' });
        }

        // Perform the database insertion using pg-promise
        await db.none('INSERT INTO public.member(username, password, first_name, last_name, email, role) \
        VALUES ($1, $2, $3, $4, $5, $6)', [username, password, first_name, last_name, email, role]);

        res.status(201).json({ message: 'registration successful' });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for handling POST requests to insert data
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Perform the database query using pg-promise
        const result = await db.oneOrNone('SELECT first_name, last_name, email, role FROM member  \
        WHERE username = $1 AND password = $2', [username, password]);

        // Check if the user is found
        if (result) {
            const token = jwt.sign(result, secretKey, { expiresIn: '1h' });
            result.token = token
            res.status(200).json(result);
        }else{
            res.status(500).json({ error: 'Invaid Username Password' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Invaid Username Password' });
    }
});

// Route for handling POST requests to remove a member
app.post('/remove_member', verifyToken, async (req, res) => {
    const { id } = req.body;
    try {
        // Perform the database query to remove a member
        const result = await db.result('DELETE FROM member WHERE id = $1', [id]);

        // Check if the member was successfully removed
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Member removed successfully.' });
        } else {
            res.status(404).json({ error: 'Member not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// Route for handling get requests to remove a member
app.get('/allmember',verifyToken, async (req, res) => {
    try {
        // Perform the database query to remove a member
        const result = await db.manyOrNone('SELECT id,first_name, last_name, email, role FROM member Where role != $1',['superadmin']);

        // Check if the user is found
        if (result) {
            res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});