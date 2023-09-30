
import ENV from "../../../ENV.js";
import { Link } from "react-router-dom";
import {useContext} from "react";
import AuthContext from "../../../context/AuthContext.js";


function LogoutButton() {

    const {user} = useContext(AuthContext)

    return (
        <div>
            <div>
                {user.gamename}
            </div>
            <div>
                <Link to={ENV.SERVER_HOST + 'api/user/logout'}>Logout</Link>
            </div>
        </div>
    )

}

export default LogoutButton