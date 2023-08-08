
import ENV from "../../../ENV";
import { Link } from "react-router-dom";


function logoutButton() {

    return (
        <div>
            <Link to={ENV.SERVER_HOST + 'api/user/logout'}>Logout</Link>
        </div>
    )

}

export default logoutButton