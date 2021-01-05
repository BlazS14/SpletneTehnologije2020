const mongoose = require('mongoose')

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tags: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('CList',listSchema)