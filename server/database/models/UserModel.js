import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
        username: { type: String, unique: true },
        gamename: String,
        password: String,
        googleId: String,
        googleToken: String,
        isAdmin: Boolean,
        color: {
                type: String,
                default: 'FFFFFF'
        }
    },
    { collection : 'users' });

export default mongoose.model('User', userSchema);