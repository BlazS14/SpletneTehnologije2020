const mongoose = require('mongoose')

const choreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tags: {
        type: String,
        required: true
    },
    clist: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    reminder: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('Chore',choreSchema)