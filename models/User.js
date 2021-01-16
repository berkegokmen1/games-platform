const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcryptjs");



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    apiKey: {
        type: String,
        default: uuidv4()
    },
    games: {
        type: [String],
        default: []
    },
    ttt_wins: {
        type: Number,
        default: 0
    },
    ttt_loses: {
        type: Number,
        default: 0
    },
    ttt_draws: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function(next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;