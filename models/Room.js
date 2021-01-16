const mongoose = require('mongoose');


const roomSchema = new mongoose.Schema({
    game: {
        type: String,
        default: "XOX"
    },
    name: {
        type: String,
        default: "berkegokmen"
    },
    members: {
        type: [String],
        default: []
    },
    winner: {
        type: String,
        default: ""
    },
    ended: {
        type: Boolean,
        default: false
    },
    _option: {
        type: String,
        default: 'public',
        trim: true
    },
    socketIDs: {
        type: [{
        socketid: {
            type: String
        },
        username: {
            type: String
        },
        xo: {
            type: String
        }
    }],
        default: []
    }
}, {
    timestamps: true
});


const Room = mongoose.model('room', roomSchema);

module.exports = Room;