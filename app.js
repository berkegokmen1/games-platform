const express = require('express');
const http = require('http'); // to create express server which can be used with socketio
const path = require('path');
const mongoose = require('mongoose'); // To use it in session store
const database = require('./db/database'); // DB connection
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session); // For storing session information
const socketio = require('socket.io');
const passportSocketIo = require('passport.socketio');
const OnlineRoom = require('./models/OnlineRoom');
const favicon = require('serve-favicon');
const passport = require('passport');
const userRouter = require('./routes/users');
const tttRouter = require('./routes/ttts');
const profileRouter = require('./routes/profiles');
const apiRouter = require('./routes/api');
const computerRouter = require('./routes/computers');
const top10Router = require('./routes/top10s');


const app = express();

const server = http.createServer(app);
const _mongooseStore = new MongoStore({ mongooseConnection: mongoose.connection });
const io = socketio(server);




// settings
const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '/public');

// set up express
app.use(express.static(publicDirectoryPath));
app.use(cookieParser(process.env.SECRET));
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

// Express Body Parser Middleware
app.use(express.urlencoded({ extended: false })); // req.body -> form data
app.use(express.json()); // req.body -> patch/json



// Store sessions in mongodb
app.use(session({
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }, // miliseconds 1000 * 60 * 60 => 1 hour
    resave: false,
    secret: process.env.SECRET,
    saveUninitialized: false,
    store: _mongooseStore
}));



// Flash Middleware
app.use(flash());



// Passport => initialize
app.use(passport.initialize());
app.use(passport.session());

// socket.io and passport implementation
const tttNamespace = io.of(/\/ttt\/(.)+/); // /ttt/:room
tttNamespace.use(passportSocketIo.authorize({
    cookieParser: cookieParser,       
    key: 'connect.sid', // the name of the cookie where express/connect stores its session_id
    secret: process.env.SECRET,    
    store: _mongooseStore,        
    success: (data, accept) => {
        accept(null, true);
    },  
    fail: (data, message, error, accept) => {
        if(error)
            throw new Error(message);
    
    
        accept(null, false);
    },     
}));



module.exports = { io, tttNamespace }; // use it in /socket/socket.js
const socketEndpoints = require('./socket/socket-ttt'); // call /socket/socket.js file (No need to assign it to a variable)




// Global - Res.Locals
app.use((req, res, next) => {
    res.locals.flashSuccess = req.flash('flashSuccess');
    res.locals.flashError = req.flash('flashError');
    res.locals.flashWarning = req.flash('flashWarning');
    res.locals.flahsNotify = req.flash('flahsNotify');

    // Passport Flash
    res.locals.passportFailure = req.flash("error");
    res.locals.passportSuccess = req.flash("success");

    // Logged in user
    res.locals.user = req.user; // use "user" in templates

    next();
});




// set up view engine
app.set('view engine', 'ejs');


// Router Middleware
app.use(userRouter);
app.use("/ttt", tttRouter);
app.use("/p", profileRouter);
app.use("/api", apiRouter);
app.use("/computer", computerRouter);
app.use("/top10", top10Router);

// Homepage
app.get('/', async (req, res) => {
    const onlineRooms = await OnlineRoom.find({}) || [];
    res.render('homepage', {
        onlineRooms,
        title: 'Homepage'
    });
})

// 404
app.get('*', (req, res) => {
    res.render('404', {
        title: '404'
    });
})

server.listen(PORT, () => { // use server.listen instead of app.listen in order to use socket.io
    console.log('Server is up and running');
});

