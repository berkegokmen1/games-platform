const mongoose = require('mongoose');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, ('Error: Connection to mongodb')));
db.once("open", () => {
    console.log('Connected to mongoDB - mongoose');
})