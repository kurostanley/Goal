const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require("body-parser");

const app = express();

// Create connection
const db = mysql.createConnection({
    host     : 'goaldb.cf3qwkt8ruuo.ap-northeast-1.rds.amazonaws.com',
    user     : 'admin',
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

//passport config
require('./config/passport')(passport);

require('dotenv').config()

// Express Session
app.use(session({
    secret: 'secert',
    resave: true,
    saveUninitialized: true
}))


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: true}));


// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.userId = req.flash('userId');
    next();
})



// Set Router
app.use('/api', require('./routes/index'));
app.use('/api/user', require('./routes/goals'));
app.use('/api/user', require('./routes/subgoals'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server start on ${PORT}`)
})