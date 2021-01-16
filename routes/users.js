const express = require('express');
const router = express.Router();
const { registerValidation, passChangeValidation } = require('../validation/formValidation');
const User = require('../models/User');
const passport = require('passport');
const authCheck = require('../authentication/auth/authCheck');

require('../authentication/passport/local'); // Local Strategy implementation



router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login'
    });
});

router.get('/logout', authCheck, (req, res) => {
    req.logOut();
    req.flash("flahsNotify", "Logged Out!");
    res.redirect('/');
})

router.get('/register', (req, res) => {

    if (req.user) {
        return res.redirect('/');
    }

    res.render('register', {
        title: 'Register'
    });
});

router.get('/password', authCheck, (req, res) => {
    res.render('password', {
        title: 'Password'
    });
});


router.post('/login', (req, res, next) => {

    if (req.user) {
        return res.redirect('/');
    }

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: true
    })(req, res, next);
});

router.post('/register', async (req, res) => {
    try {
        const { username, password, password2, testerCode } = req.body;
        const validationErrors = registerValidation(username, password, password2);


        // beta
        if (testerCode === "") {
            validationErrors.push({ message: "Please provide a tester code."});
        } else if (testerCode !== process.env.BETA_CODE.toString()) {
            validationErrors.push({ message: "Tester code is wrong" });
        }

        // Server side validation
        if (validationErrors.length > 0) {
            return res.render('register', {
                errors: validationErrors,
                title: "Register"
            })
        }
    
        const newUser = new User({
            username,
            password
        });

        const existingUser = await User.findOne({ username: new RegExp(username, 'i') }); // admin - ADMIN - AdMiN

        if (existingUser) {
            // Username validation
            validationErrors.push({ message: "Username is already in use" });
            return res.render('register', {
                errors: validationErrors,
                title: "Register"
            });
        }
    
        await newUser.save();
        req.flash("flashSuccess", "Successfully Registered");
        res.redirect('/');
    } catch (e) {
        console.log(e)
    }
});

router.post('/password', authCheck, async (req, res) => {
    try {
        const { oldpass, newpass, newpass2 } = req.body;
        const validationErrors = await passChangeValidation(req.user.username, oldpass, newpass, newpass2);
        if (validationErrors.length > 0) {
            return res.render('password', {
                errors: validationErrors
            })
        }

        const user = await User.findOne({ username: req.user.username })
        user.password = newpass
        await user.save()

        req.flash("flashSuccess", "Successfully Changed Password");
        res.redirect('/p/' + user.username);
    } catch (e) {
        const validationErrors = await passChangeValidation(req.user.username, oldpass, newpass, newpass2);
        validationErrors.push({ message: "Something went wrong."})
        return res.render('password', {
            errors: validationErrors
        })
    }
})


module.exports = router;