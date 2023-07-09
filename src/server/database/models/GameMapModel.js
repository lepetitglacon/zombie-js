import mongoose from 'mongoose';

const gameMap = new mongoose.Schema({
    title: { type: String, unique: true },
    filename: { type: String, unique: true },
    playable: Boolean,
});

export default mongoose.model('GameMap', gameMap);