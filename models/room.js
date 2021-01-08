const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    playernum: {
        type: Number
    }
})

module.exports = mongoose.model('Room',roomSchema)