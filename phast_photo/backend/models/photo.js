const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
    filePath: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, required: false }
}, { timestamps: true });

const Photo = mongoose.model('photo', photoSchema);

module.exports = Photo;