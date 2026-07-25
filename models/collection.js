const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        
    },
    slug: {
        type: String,
        required: true,
        unquie: true,
        lowercase: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Collection", collectionSchema);