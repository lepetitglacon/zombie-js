import {useState} from "react";
import {useParams, Link} from 'react-router-dom'

function Signin() {

    const params = useParams()
    console.log(params)

    return (
        <div>
            <h2>LOGIN</h2>
            <Link to="/mainlobby">Log in</Link>
        </div>
    );
}

export default Signin;