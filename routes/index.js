const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.env.password,
    database : 'GoalDb'
});




// Create User
/**
 * @METH POST
 * @param {string} userName
 * @param {string} userEmail
 * @param {string} userPassword
 * @return {JSON} user creatscess info
 */ 
 router.post('/register', (req, res) => {
    let user = {
        user_name: req.body.userName,
        user_email: req.body.userEmail , 
        user_password: req.body.userPassword,
    };
    console.log(req.body);
    let sql = 'INSERT INTO users SET ?';   // ?means the db.query second param
    let query = db.query(sql, user, (err, result) => {
        if(err) throw err;
        console.log(result.insertId);
        res.send(result);
    })
})

//router.get('/api/logout')


module.exports = router;
