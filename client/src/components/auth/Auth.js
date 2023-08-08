import {Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ENV from "../../ENV";
import axios from "axios";
import {useContext, useEffect, useRef} from "react";
import AuthContext from "../../context/AuthContext";

function Auth() {

    const {user, setUser} = useContext(AuthContext)

    const navigate = useNavigate()

    const handleGoogleLogin = async () => {
        window.location.assign('http://localhost:39000/auth/google')
    }

    const handleLoginAttempt = (e) => {
        e.preventDefault()
        const fetchLocalAuth = async (e) => {
            console.log(e)
            const res = await axios.post(ENV.SERVER_HOST + 'login', {
                username: e.target.elements.username.value,
                password: e.target.elements.password.value,
            },
                {
                    withCredentials: true
                })
            if (res.data.success) {
                setUser(res.data.user)
                navigate('/')
            }
        }
        fetchLocalAuth(e)
    }

    return (
        <div>
            <h1 id="z3d">Z3D</h1>

            <button onClick={handleGoogleLogin} className="btn btn-danger"><span className="fa fa-google"></span>Connect with Google</button>

            <form onSubmit={(e) => handleLoginAttempt(e)} className="mt-5" action="http://localhost:39000/login" method="post">
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input type="email" className="form-control" placeholder="Enter email" name="username"/>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input type="password" className="form-control" placeholder="Password" name="password"/>
                </div>
                <input type="submit"
                       className="btn btn-danger"
                       value="Log in"
                />
                <a href="/register" className="btn btn-dark">Sign up</a>
            </form>
        </div>
    );
}

export default Auth;