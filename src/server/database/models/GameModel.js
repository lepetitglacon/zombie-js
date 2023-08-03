import mongoose from 'mongoose';
import {userSchema} from "./UserModel.js";

export const GameState = {
    LOBBY: 'LOBBY',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
}

const gameSchema = new mongoose.Schema({
            name: String,
            private: Boolean,
            online: Boolean,
            state: {
                type: String,
                enum: GameState,
                default: GameState.LOBBY
            },
            map: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'GameMap'
            },
            owner: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
            },
            players: {
                type: Map,
                of: userSchema,
                default: new Map()
            },
            allowedPlayers: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
    },
    { collection : 'games' });

export default mongoose.model('Game', gameSchema);

export async function getGames() {

}

export async function getGame(gameId) {

}