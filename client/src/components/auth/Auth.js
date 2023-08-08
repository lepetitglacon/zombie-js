function Auth() {

    const handleLogin = async () => {
        window.location.assign('http://localhost:39000/auth/google')
    }

    const handleLoginAttempt = () => {

    }

    return (
        <div>
            <h1 id="z3d">Z3D</h1>

            <button onClick={handleLogin} className="button"><span className="fa fa-google"></span>Connect with Google</button>

            <form className="mt-5" action="/login" method="post">
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input type="email" className="form-control" placeholder="Enter email" name="username"/>
                </div>
                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input type="password" className="form-control" placeholder="Password" name="password"/>
                </div>
                <button type="submit" onClick={handleLoginAttempt} className="btn button">Log in</button>
                <a href="/register" className="button">Sign up</a>
            </form>
        </div>
    );
}

export default Auth;