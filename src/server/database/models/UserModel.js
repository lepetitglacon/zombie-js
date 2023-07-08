import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    gamename: String,
    password: String,
    googleId: String,
    googleToken: String
});

export default mongoose.model('User', userSchema);