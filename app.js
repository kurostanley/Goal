const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv').config();


require('dotenv').config()

// Create connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.env.password,
    database : 'GoalDb'
});

// connection
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Mysql Connected');
})

const app = express();

app.use(express.json());

// Set Router
app.use('/api', require('./routes/index'));
app.use('/api/user', require('./routes/goals'));
app.use('/api/user', require('./routes/subgoals'));

const PORT = process.env.port || 3000;

app.listen(PORT, () => {
    console.log('server start on 3000')
})