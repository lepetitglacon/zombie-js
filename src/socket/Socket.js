import { io } from 'socket.io-client';
import SERVER_HOST from "../ENV.js";

const Socket = (gameId, userId) => {
    return io(SERVER_HOST, {
        autoConnect: false,
        withCredentials: true,
        query: {
            gameId: gameId,
            userId: userId
        },
    })
}
export default Socket