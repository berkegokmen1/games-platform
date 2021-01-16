// /ttt/

const express = require('express');
const router = express.Router();
const authCheck = require('../authentication/auth/authCheck');
const OnlineRoom = require('../models/OnlineRoom');
const Room = require('../models/Room');
const { uniqueNamesGenerator, adjectives, names, NumberDictionary } = require('unique-names-generator');


router.get('/', authCheck, (req, res) => {
    res.redirect('/');
});

router.get('/:room', authCheck, async (req, res) => {
    try {
        const _room = await Room.findOne({ name: req.params.room })

        if (!_room) { // check if the room exists
            req.flash('flashError', `Game ${req.params.room} does not exist.`);
            return res.redirect('/');
        }

        

        if (!_room.ended) { // the game in this room hasn't finished yet

            if (_room.members.includes(req.user.username)) { // check if the user tries to join the same game using different browsers
                req.flash('flashError', 'You cannot play with yourself');
                return res.redirect('/');
            }

            if (_room.members.length >= 2) { // game is being played and room is full
                req.flash('flashWarning', `${req.params.room} is full, try another room.`);
                res.redirect('/');    
            } else { // one user is waiting in the room
                res.render('ttt', {
                    roomid: req.params.room,
                    title: req.params.room
                });
            
            }
        } else { // the game has been finished so the room cannot be accessed
            req.flash('flashWarning', `The game in ${req.params.room} finished.`);
            res.redirect('/');
        }
    } catch (e) {
        console.log(e);
    }
})

router.post('/', authCheck, async (req, res) => {
    try {
        const numberDictionary = NumberDictionary.generate({ min:100, max:999 })
        const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, names, names, numberDictionary], separator: '', style: 'capital' });  // create random room name
        if (!req.body._option) { // no option specified for some reason
            // _option -> public
            const newOnlineRoom = new OnlineRoom({
                game: "XOX",
                name: randomName,
                player: req.user.username,
                points: req.user.ttt_wins - req.user.ttt_loses
            });

            const newRoom = new Room({
                game: "XOX",
                name: randomName,
                _option: 'public'
            });

            await newOnlineRoom.save();
            await newRoom.save();
            return res.redirect('/ttt/' + randomName);
        } else { // option is present
            if (req.body._option == 'public') { // public
                const newOnlineRoom = new OnlineRoom({
                    game: "XOX",
                    name: randomName,
                    player: req.user.username,
                    points: req.user.ttt_wins - req.user.ttt_loses
                });

                const newRoom = new Room({
                    game: "XOX",
                    name: randomName,
                    _option: 'public'
                });

                await newOnlineRoom.save();
                await newRoom.save();
                return res.redirect('/ttt/' + randomName);
            } else if (req.body._option == 'private') { // private room
                const newRoom = new Room({
                    game: "XOX",
                    name: randomName,
                    _option: 'private'
                })
                await newRoom.save();
                return res.redirect('/ttt/' + randomName);
            } else if (req.body._option == 'computer') { // vs computer

                return res.redirect('/computer/ttt');
                
            } else { // something is wrong - _option => public
                const newOnlineRoom = new OnlineRoom({
                    game: "XOX",
                    name: randomName,
                    player: req.user.username,
                    points: req.user.ttt_wins - req.user.ttt_loses
                });

                const newRoom = new Room({
                    game: "XOX",
                    name: randomName,
                    _option: 'public'
                });

                await newOnlineRoom.save();
                await newRoom.save();
                return res.redirect('/ttt/' + randomName);
            }

        }
    
    } catch (e) {
        console.log(e);
    }
})



module.exports = router;