const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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
    parentCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        default: null
    },
    collections:{
        type: [String],
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);