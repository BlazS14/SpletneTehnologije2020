const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    redplayer: {
        type: mongoose.Schema.Types.ObjectId
    },
    yellowplayer: {
        type: mongoose.Schema.Types.ObjectId
    },
    blueplayer: {
        type: mongoose.Schema.Types.ObjectId
    },
    greenplayer: {
        type: mongoose.Schema.Types.ObjectId
    },
    redname: {
        type: String
    },
    yellowname: {
        type: String
    },
    bluename: {
        type: String
    },
    greenname: {
        type: String
    },
    redscore: {
        type: Number
    },
    yellowscore: {
        type: Number
    },
    bluescore: {
        type: Number
    },
    greenscore: {
        type: Number
    },
    redpos: [{
        type: Number
    }],
    yellowpos: [{
        type: Number
    }],
    bluepos: [{
        type: Number
    }],
    greenpos: [{
        type: Number
    }]
})

module.exports = mongoose.model('Game',gameSchema)