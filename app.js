const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require("body-parser");
const cors = require('cors');
const https = require('https')
const fs = require('fs')

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



// Use Cors
// app.use(cors({
//     origin:"https://localhost:5000",
//     credentials: true
// }))

// app.set('trust proxy', 1);


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://goalfont222.herokuapp.com/'); // * allows all, or you can limit by domain
    res.setHeader('Access-Control-Allow-Methods', '*'); // Set which header methods you want to allow (GET,POST,PUT,DELETE,OPTIONS)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // These 2 are recommended
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie'); // Required to allow the returned cookie to be set
	res.setHeader('Access-Control-Allow-Credentials', 'true'); // Required to allow auth credentials
    next();
});

app.set('trust proxy', 1)


// Express Session
app.use(session({
    secret: 'secert',
    resave: false,
    saveUninitialized: true,
    cookie: {
		path: "/",
		httpOnly: false, // Set this so it can be accessed via document.cookie in javascript
		secure: true, // Required when using sameSite:'none'
		sameSite: 'none', // Set this to allow access via different domians
		maxAge: 3600000 // Set cookie to last 1 hour
	}
  }))


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



app.use(express.json());
//app.use(express.urlencoded({extended: false}));
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

// // Sets up the server as HTTPS using certificates
// const httpsOptions = {
// 	key: fs.readFileSync('key.pem'),
// 	cert: fs.readFileSync('cert.pem')
// }
// const server = https.createServer(httpsOptions, app).listen(PORT);

app.listen(PORT)

