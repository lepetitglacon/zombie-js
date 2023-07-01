import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    googleId: String,
    googleToken: String
});

export default mongoose.model('User', userSchema);