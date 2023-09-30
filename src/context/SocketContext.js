import {createContext, useState} from "react";

const SocketContext = createContext({})

export const SocketProvider = ({children}) => {

    const [socket, setSocket] = useState(null)

    return <SocketContext.Provider value={{ socket: socket, setSocket: setSocket }}>
        {children}
    </SocketContext.Provider>
}

export default SocketContext