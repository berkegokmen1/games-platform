const authCheck = (req, res, next) => {
    if (!req.user) {
        req.flash('flashError', 'You are not logged in!');
        res.redirect('/');
    } else {
        next();
    }
}


module.exports = authCheck;