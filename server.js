require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost', // Your MySQL host
    user: process.env.DB_USER, // Your MySQL user
    password: process.env.DB_PASSWORD, // Your MySQL password
    database: 'bitcoin_crash_game'
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Register a new user
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    // Hash password before saving (use bcrypt for security)
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ id: results.insertId });
    });
});

// User login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            const user = results[0];
            // Compare password (use bcrypt for security)
            if (user.password === password) {
                res.send({ id: user.id, balance: user.balance });
            } else {
                res.status(401).send('Invalid password');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Place a bet
app.post('/api/bet', (req, res) => {
    const { userId, amount, multiplier } = req.body;
    db.query('INSERT INTO bets (user_id, amount, multiplier) VALUES (?, ?, ?)', [userId, amount, multiplier], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ id: results.insertId });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
