const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    gamesplayed: {
        type: Number,
        required: true
    },
    gameswon: {
        type: Number,
        required: true
    },
    place1: {
        type: Number,
        required: true
    },
    place2: {
        type: Number,
        required: true
    },
    place3: {
        type: Number,
        required: true
    },
    place4: {
        type: Number,
        required: true
    },
    figs: [{
        type: Number
    }],
    roomid: {
        type: mongoose.Schema.Types.ObjectId
    },
    session: {
        type: String
    },
    socketid: {
        type: String
    }
})

module.exports = mongoose.model('User',userSchema)