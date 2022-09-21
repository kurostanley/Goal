const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcryptjs')
const passport = require('passport')


const db = mysql.createConnection({
    host     : 'goaldb.cf3qwkt8ruuo.ap-northeast-1.rds.amazonaws.com',
    user     : 'admin',
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
    const {userName, userEmail, userPassword } = req.body
    let errors = [];
    
    //check require fields
    if(!userName || !userEmail || !userPassword ){
        errors.push({msg: 'Please fill in all fields'});
    }

    // check pass length
    if(userPassword.length < 6){
        errors.push({msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0){
        res.send({
            errors,
            userName,
            userEmail,
            userPassword
        })}
    
    else {
        // Validation passed
        let sql = `SELECT * FROM users WHERE user_email = '${userEmail}'`;   
        let query = db.query(sql, (err, results) => {
            if(err) throw err;
            if(results.length != 0){
                errors.push({ msg: 'Email is already registered'});
                res.send({
                    errors,
                    userName,
                    userEmail,
                    userPassword
                });
            }
            else {
                const user = {
                    user_name: req.body.userName,
                    user_email: req.body.userEmail , 
                    user_password: req.body.userPassword,
                }
                let sql2 = 'INSERT INTO users SET ?';   // ?means the db.query second param
                let query = db.query(sql2, user, (err, result) => {
                    if(err) throw err;
                    res.send({msg : 'create a new account success'});
                })

                // Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    let sql2 = `UPDATE users SET user_password = ? WHERE user_email = '${userEmail}'`;   
                    bcrypt.hash(userPassword, salt, (err, hash) => {
                        if(err) throw err;
                        // Set password to hashed
                        let query = db.query(sql2, hash, (err, result) => {
                            if(err) throw err;
                            req.flash('success_msg', 'You are now registered and can log in')
                        })
                    });
            })
            }
        }) 
    }
})   


// Login
/**
 * @METH POST
 * @param {string} userEmail
 * @param {string} userPassword
 * @return {JSON} user creatsuccess info
 */ 

router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    res.redirect('/api/user/' + req.session.passport.user + '/goals');
})




// Logout
/**
 * @METH GET
 */ 
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.send({success_msg: 'You are logged out'});
    });
})


module.exports = router;
