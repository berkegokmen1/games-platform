const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
        if (err) { return done(err, null, "There was an error :/") }

        if (!user) { return done(null, false, "User not found") }

        bcrypt.compare(password, user.password, (err, res) => {

            if (err) {
                return done(null, false, "There was a problem, please try again");
            }

            if (res) { // res returns => true / false
                return done(null, user, "Successfully Logged In"); // req.user
            } else { 
                return done(null, false, "Incorrect Password");
            }
        })
    });
}));

passport.serializeUser(function(user, done) { // Required to use "req.user"
    done(null, user.id);
});

passport.deserializeUser(function(id, done) { // Required to use "req.user"
    User.findById(id, function(err, user) {
        done(err, user);
    });
});