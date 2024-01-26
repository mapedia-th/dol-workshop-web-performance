# ติดตั้ง Library ทั้งหมด
npm i express pg-promise body-parser cookie-parser crypto cors jsonwebtoken
npm i express body-parser cors process
์npm i -g nodemon

# แก้ ใช้ nodemon ไม่ได้
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# กำหนดค่าการเชื่อมต่อกับ PostgreSQL
const db = pgp('postgres://postgres:postgres@localhost:5432/postgres');

# set routing node 

app.use('/assets', express.static(__dirname + '/assets'))

app.use('/home', express.static(__dirname + '/index.html'))
app.use('/login', express.static(__dirname + '/login.html'))
app.use('/register', express.static(__dirname + '/register.html'))
app.use('/sample', express.static(__dirname + '/sample.html'))

# Create Table member

DROP TABLE IF EXISTS public.member;

CREATE TABLE IF NOT EXISTS public.member
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    username text COLLATE pg_catalog."default",
    password text COLLATE pg_catalog."default",
    first_name text COLLATE pg_catalog."default",
    last_name text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    role text COLLATE pg_catalog."default",
    CONSTRAINT member_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.member
    OWNER to postgres;

# Write Node API Registor member
# Route for handling POST requests to insert data
# Perform the database insertion using pg-promise
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

# Create Function addMember()
async function addMember(memberData) {
  const apiUrl = 'http://localhost:3000/register'; // Replace with your actual API endpoint

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may need to include additional headers like authorization if required
      },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      // Handle error responses
      const errorMessage = await response.text();
      throw new Error(`Failed to register member: ${errorMessage}`);
    }

    // Registration successful
    const responseData = await response.json();
    console.log('Member registered successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error during member registration:', error.message);
    throw error;
  }
}

# Create Function registerMember()
function registerMember() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var email = document.getElementById("email").value;
  var first_name = document.getElementById("first_name").value;
  var last_name = document.getElementById("last_name").value;

  memberData = {
    username: username,
    email: email,
    password: password,
    first_name: first_name,
    last_name: last_name,
    role: 'user',
  }
  if (memberData.username != undefined && memberData.email != undefined && memberData.password != undefined && memberData.first_name != undefined && memberData.last_name != undefined) {
    addMember(memberData)
      .then((response) => {
        alert(response.message)
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert('ขออภัยไม่สามารถเพิ่มผู้ใช้งานใหม่ได้')
      });
  } else {
    alert('กรุณากรอกข้อมูลให้ครบทุกช่อง')
  }
}

# Write Node API Check login 
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


# Create Function loginUser
async function loginUser(username, password) {
  const apiUrl = 'http://localhost:3000/login'; // Replace with your actual API endpoint

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You may need to include additional headers like authorization if required
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Handle error responses
      const errorMessage = await response.text();
      throw new Error(`Failed to login: ${errorMessage}`);
    }

    // Login successful
    const responseData = await response.json();
    window.location.href = "index.html";
    localStorage.setItem('user_data', JSON.stringify(responseData))
    return responseData;
  } catch (error) {
    console.error('Error during login:', error.message);
    throw error;
  }
}


# Create Function attempLogin()

function attemptLogin() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  // Check if the username and password are valid (for demonstration purposes)
  if (username != null && username != undefined && password != null && password != undefined) {
    loginUser(username, password);
  } else {
    alert('กรุณากรอกข้อมูลให้ครบ')
  }
}

# SET Clear LocalStorage When at login.html && set Show Fullname 
// Check if the current URL is login.html
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.href.endsWith('login.html')) {
    // Clear localStorage
    localStorage.clear();
  } else if (window.location.href.endsWith('index.html') || window.location.href.endsWith('/')) {
    if (!localStorage.getItem('user_data')) {
      window.location.href = "login.html";
    } else {
      const userSpan = document.getElementById('userSpan');
      const userFullName = document.getElementById('userFullName');
      const userRole = document.getElementById('userRole');

      const user = JSON.parse(localStorage.getItem('user_data'));
      userSpan.textContent = `${user.first_name} ${user.last_name}`;
      // Remove the 'd-none' class to make it visible
      userSpan.classList.remove('d-none');
      userFullName.textContent = `${user.first_name} ${user.last_name}`;
      userRole.textContent = user.role;
    }
  }
});

# สร้าง Function logout 
function logout() {
  localStorage.clear();
  window.location.href = "login.html"
}

# import lib  & setting Node js
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

const secretKey = 'Hkq8jmLZM74Ywvub6X2xVU';

// กำหนดค่าการเชื่อมต่อกับ PostgreSQL
const db = pgp('postgres://postgres:postgres@localhost:5436/geodb');

# JWT token verify 
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

# add JWT to /login

const token = jwt.sign(result, secretKey, { expiresIn: '1h' });
            result.token = token
            console.log(token);


# Using JWT verify
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

# Add sample user
INSERT INTO public.member(username, password, first_name, last_name, email, role)
VALUES
    ('Thana', 'password', 'Thana', 'Maturod', 'Thana.M@gmail.com', 'user'),
    ('Mati', 'password', 'Mati', 'Sutwilai', 'Mati.S@gmail.com', 'user'),
    ('Korawich', 'password', 'Korawich', 'Prempree', 'Korawich.P@gmail.com', 'user'),
    ('Uthaiwit', 'password', 'Uthaiwit', 'Sumsap', 'Uthaiwit.S@gmail.com', 'user'),
    ('Natchanon', 'password', 'Natchanon', 'Rompho', 'Natchanon.R@gmail.com', 'user');

# Add Sweatalret2 to index.html
<!-- sweetalert2 -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>


