import {Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ENV from "../../ENV.js";
import axios from "axios";
import {useContext, useEffect, useRef, useState} from "react";
import AuthContext from "../../context/AuthContext.js";
import SERVER_HOST from "../../ENV.js";

function Map() {
    const navigate = useNavigate()
    const {user, setUser} = useContext(AuthContext)

    const [maps, setMaps] = useState([])
    const [error, setError] = useState([])

    useEffect(async () => {
        const res = await axios.get(SERVER_HOST + 'admin/maps', {
            credentials: 'include',
            withCredentials: true
        })
        setMaps(res.data)
        console.log(res)
    }, [])

    const handleRegisterMap = async (e) => {
        e.preventDefault()
        console.log(e)

        const formData = new FormData(e.target)
        const res = await axios.post(SERVER_HOST + 'admin/maps/register', formData,
            {
                credentials: 'include',
                withCredentials: true
            })
        if (res.data.success) {
            setUser(res.data.user)
            navigate('/')
        }
    }

    return (
        <div className="container-fluid">
            <div className="container">
                <h1>Admin Maps</h1>

                <div className="col">
                    <h2>Maps</h2>

                    <table className="table table-dark">
                        <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Filename</th>
                            <th scope="col">Upload filename</th>
                            <th scope="col">Preview</th>
                            <th scope="col">Preview filename</th>
                            <th scope="col">Playable</th>
                            <th scope="col">Handle</th>
                        </tr>
                        </thead>
                        <tbody>
                        {maps.map(map => {
                            return <tr>
                                <td>
                                    <p className="map-id">
                                        {map._id}
                                    </p>
                                </td>
                                <td>
                                    {map.name}
                                </td>
                                <td>
                                    {map.filename}
                                </td>
                                <td>
                                    {map.uploadFilename}
                                </td>
                                <td>
                                    {map.preview}
                                </td>
                                <td>
                                    {map.previewFilename}
                                </td>
                                <td>
                                    {map.playable}
                                </td>
                                <td>
                                    <button data-id="{map.id}" className="btn btn-danger delete-btn">Delete</button>
                                    {/*{(!map.playable)}*/}
                                    {/*<button data-id="<%= map._id %>" className="btn btn-success accept-btn">Accept</button>*/}
                                    {/*<%} else {%>*/}
                                    {/*<button data-id="<%= map._id %>" className="btn btn-success unaccept-btn">Unaccept</button>*/}
                                    {/*<%} %>*/}
                                </td>
                            </tr>
                        })}


                        {maps.length < 1 &&
                            <tr>
                                <td colSpan={8}>No maps</td>
                            </tr>
                        }
                        </tbody>
                    </table>


                </div>

                <div className="col">
                    <h2>Register a map</h2>

                    <div id="map-form-error" className="invalid-feedback">
                        {error !== undefined && error}
                    </div>

                    <form id="map-form" onSubmit={handleRegisterMap}>
                        <div className="mb-3">
                            <label forHtml="map-name" className="form-label">Map name</label>
                            <input type="text" className="form-control" id="map-name" name="map-name"/>
                        </div>
                        <div className="mb-3">

                            <label forHtml="map-file" className="form-label">Map file (model/glb)</label>
                            <input id="map-file"
                                   name="map-file"
                                   className="form-control"
                                   type="file"
                                   accept=".glb,.gltf,gltf/model+json,gltf/model-binary"
                            />

                        </div>
                        <div className="mb-3">
                            <label forHtml="map-preview" className="form-label">Map preview</label>
                            <input id="map-preview"
                                   name="map-preview"
                                   className="form-control"
                                   type="file"
                                   accept="image/*"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </form>

    </div>

</div>


</div>
    );
}

export default Map;