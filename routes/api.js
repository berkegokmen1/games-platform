const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');
const authCheck = require('../authentication/auth/authCheck');

router.get('/', (req, res) => {
    res.redirect('/api/docs');
});

router.get('/docs', (req, res) => {
    res.render('docs', {
        title: 'Docs'
    });
});

router.get('/apiKey', authCheck, (req, res) => {
    res.send({
        uuid: uuidv4()
    });
});

router.patch('/apiKey', authCheck, async (req, res) => {
    try {
        req.user.apiKey = req.body.apiKey;
        await req.user.save();
        res.send({
            success: 'Success'
        });
    } catch (e) {
        res.send(e);
    }
});

router.get('/profiles', async (req, res) => { // /profiles?username=[USERNAME]&key=[KEY]
    if (!req.query.key) {
        return res.send({
            error: "Please provide an API key."
        })
    }

    if (!req.query.username) {
        return res.send({
            error: "Please specify a username."
        })
    }

    try {
        const _user = await User.findOne({ apiKey: req.query.key });
        
        if (!_user) { // api key not valid
            return res.send({
                error: "Api key is not valid."
            });
        }

        const requested = await User.findOne({ username: req.query.username });

        if (!requested) { // requested user not found
            return res.send({
                error: "User not found"
            });
        }
        
        const { username, createdAt, updatedAt, apiKey, games } = requested;

        res.send({
            username,
            games,
            createdAt,
            updatedAt,
        });
    } catch (e) {
        res.send(e);
    }
});

router.get('/rooms', async (req, res) => { // /rooms?room=[ROOM]&key=[KEY]
    if (!req.query.key) {
        return res.send({
            error: "Please provide an API key."
        });
    }

    if (!req.query.room) {
        return res.send({
            error: "Please specify a room name."
        });
    }

    try {
        const _user = await User.findOne({ apiKey: req.query.key });

        if (!_user) { // api key not valid
            return res.send({
                error: "Api key is not valid"
            });
        }

        const requested = await Room.findOne({ name: req.query.room });

        if (!requested) { // requested room not found
            return res.send({
                error: "Room not found."
            })
        }

        const { game, name, members, winner, createdAt, ended } = requested;
        res.send({
            game,
            name,
            members,
            winner,
            ended,
            createdAt
        });
    } catch (e) {
        res.send(e);
    }
});



module.exports = router;