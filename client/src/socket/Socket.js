import { io } from 'socket.io-client';
import ENV from "../ENV";

const Socket = (gameId, userId) => {
    return io(ENV.SERVER_HOST, {
        autoConnect: false,
        withCredentials: true,
        query: {
            gameId: gameId,
            userId: userId
        },
    })
}
export default Socket