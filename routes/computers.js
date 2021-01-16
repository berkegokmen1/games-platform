// /computer/

const express = require('express');
const router = express.Router();
const authCheck = require('../authentication/auth/authCheck');


router.get('/ttt', authCheck, (req, res) => {
    res.render('computer-ttt', {
        title: 'AI'
    });
});



module.exports = router;