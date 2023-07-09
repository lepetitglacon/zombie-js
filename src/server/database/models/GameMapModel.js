import mongoose from 'mongoose';

const gameMap = new mongoose.Schema({
        name: { type: String, unique: true },
        filename: { type: String, unique: true },
        uploadFilename: { type: String, unique: true },
        preview: String,
        previewFilename: { type: String, unique: true },
        playable: Boolean,
    },
    { collection : 'maps' });

export default mongoose.model('GameMap', gameMap);