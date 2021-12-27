const mongoose = require('mongoose');

const usersData = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }
}, { collection: "users" })

module.exports = mongoose.model("userData", usersData);