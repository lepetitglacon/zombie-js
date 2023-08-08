import {useContext, useEffect} from "react";
import {Navigate, Outlet, useNavigate} from 'react-router-dom';
import AuthContext from "../../context/AuthContext";

const ProtectedRoute = ({ redirectPath = '/auth', children = null }) => {

    const {user, setUser} = useContext(AuthContext)

    useEffect(() => {

        const getUserFromSession = async () => {
            console.log('get user from session')

            const res = await fetch('http://localhost:39000/api/user/session', {
                credentials: 'include'
            })
            const data = await res.json()
            setUser(data.user)


        }
        getUserFromSession()

    }, [])

    if (!user) {
        return <Navigate to={redirectPath} reset ></Navigate>
    }

    return children ? children : <Outlet />

};

export default ProtectedRoute;