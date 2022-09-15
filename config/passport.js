const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require ('bcryptjs');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : process.env.password,
    database : 'GoalDb'
});


module.exports = function(passport) {
    let user = {};

    passport.use(
        new LocalStrategy({ usernameField: 'userEmail', passwordField: 'userPassword' }, (email, password, done) => {
            // Match User
            let sql = `SELECT * FROM users WHERE user_email = '${email}'`
            let query = db.query(sql, (err, result) => {
                if(err) throw err;

                // Match the Email
                if(result.length == 0){
                    return done(null, false, { message: 'That email is not registered'})
                }

                user = {id: result[0].user_id, username: result[0].user_name, password: result[0].user_password};
                // Match the Password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    
                    if(err) return done(err) ;

                    if(isMatch){
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect'});
                    } 
                })

            })
    }))


    passport.serializeUser((user, done) => {
        done(null, user.id);
    })
      
    passport.deserializeUser((id, done) => {
        let sql = `SELECT * FROM users WHERE user_id = '${id}'`
        let query = db.query(sql, (err, result) => {
        if(result.length != 0){
            done(err, user);
        }
        });
    });
}