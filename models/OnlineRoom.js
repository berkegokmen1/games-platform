const mongoose = require('mongoose');


const onlineRoomSchema = new mongoose.Schema({
    game: {
        type: String,
        default: "XOX"
    },
    name: {
        type: String,
        default: "berkegokmen"
    },
    player: {
        type: String,
        default: "berkegokmen"
    },
    points: {
        type: Number,
        default: 0
    }
});


const OnlineRoom = mongoose.model('onlineRoom', onlineRoomSchema);

module.exports = OnlineRoom;