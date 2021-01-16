const express = require('express');
const router = express.Router();
const authCheck = require('../authentication/auth/authCheck');
const User = require('../models/User');
const Room = require('../models/Room');



router.get('/:username', async (req, res) => {
    try {

        if (req.user) { // if the person is logged in
            if (req.user.username === req.params.username) { // if logged in user tries to show their own account
                const ownerUser = await User.findOne({ username: req.user.username });
                const gamesArray = await Room.find({ members: { "$in" : [ownerUser.username] } }).sort({ createdAt: -1 }).limit(12);
                return res.render('profile', {
                    isOwner: true,
                    profile: ownerUser,
                    gamesArray,
                    title: req.user.username
                })
            }
        }

        const profileUser = await User.findOne({ username: req.params.username });
        
        if (!profileUser) { return res.render('blankProfile', { search: req.params.username }) }
        const gamesArray = await Room.find({ members: { "$in" : [profileUser.username] } }).sort({ createdAt: -1 }).limit(12); // get the rooms in which the username of user is present. createdAt: -1 => newest > oldest 
        res.render('profile', {
            isOwner: false,
            profile: profileUser,
            gamesArray,
            title: req.params.username
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/', async (req, res) => {
    if (req.user) { // if the person is logged in
        return res.redirect(`/p/${req.user.username}`);
    }
    res.redirect('/');
});

router.delete('/', authCheck, async (req, res) => {
    await req.user.remove();
    req.logOut();
    res.redirect('/');
});









module.exports = router;