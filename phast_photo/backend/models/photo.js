const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
    photoData: { type: Buffer, required: true }, // Store the photo as binary data
    metadata: { type: Schema.Types.Mixed, required: false } // Mixed type for flexible schema
}, { timestamps: true });

const Photo = mongoose.model('photo', photoSchema);

module.exports = Photo;