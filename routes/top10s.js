// /leaderboard/

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('top10', {
        page: 'main',
        data: [],
        title: 'Top 10'
    });
});

router.get('/ttt', async (req, res) => {
    const data = await User.aggregate([ { $project: { points: { $subtract: [ "$ttt_wins", "$ttt_loses" ] }, username: 1 } } ]).sort({ points: -1 }).limit(10); // love mongoose

    res.render('top10', {
        page: 'ttt',
        data,
        title: 'Tic Tac Toe'
    });
});




module.exports = router;