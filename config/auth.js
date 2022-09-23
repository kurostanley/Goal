module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated() && (req.session.passport.user == req.params.userId)){
            req.flash('userId',res.locals.userId[0])
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.send([{msg: "no authentication"}]);
    },
    // ensureAuthenticatedInWelcome: function(req, res, next){
    //     if(!req.isAuthenticated()){
    //         return next();
    //     }
    //     res.redirect('/dashboard');
    // },
}