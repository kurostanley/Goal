const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcryptjs')
const passport = require('passport')


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
            console.log(results)
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
                            res.send('login success');
                        })
                    });
            })
            }
        }) 
    }
})   

// Login Handle
// router.post('/login', (req, res, next) => {
//     let userId;
//     let sql = `SELECT * FROM users WHERE user_email = '${req.body.userEmail}'`
//     let query = db.query(sql, (err, result) => {
//         userId = result[0].user_id;
//     })
//     passport.authenticate('local', {
//         successRedirect:`/api/user/${userId}/goals`,
//         failureRedirect:'/api/login',
//         failureFlash: true
//     })(req, res, next);
// });

router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    let userId;
    let sql = `SELECT * FROM users WHERE user_email = '${req.body.userEmail}'`;
    let query = db.query(sql, (err, result) => {
       userId = result[0].user_id
    })
    console.log(userId)
    res.redirect('/users/' + userId + '/goals');
  })




// Logout
/**
 * @METH GET
 * 
 */ 
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.send({success_msg: 'You are logged out'});
    });
})


module.exports = router;
