import mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema({
        game: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Game'
        },
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
        },
        text: String,
        dateSent: Date,
        dateReceived: Date
    },
    { collection : 'messages' });

export default mongoose.model('Message', messageSchema);