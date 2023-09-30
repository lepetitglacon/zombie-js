import {useContext, useEffect, useState} from "react";
import {Navigate, Outlet, useNavigate} from 'react-router-dom';
import AuthContext from "../../context/AuthContext.js";

const ProtectedRoute = ({ user, redirectPath = '/auth', children = null }) => {

    if (!user) {
        return <Navigate to={redirectPath} reset ></Navigate>
    } else {
        return children ? children : <Outlet />
    }


};

export default ProtectedRoute;