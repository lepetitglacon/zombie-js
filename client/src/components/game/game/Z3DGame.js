import * as THREE from 'three';
import {useEffect, useRef} from "react";

function Z3DGame({socket, setGameState}) {

    const threeRef = useRef()

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#eee')
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame( animate );

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render( scene, camera );
    }
    animate();

    useEffect(() => {
        threeRef.current.appendChild( renderer.domElement );
    })

    return (
        <div>
            <h1>GAMING</h1>
            <img src="https://img.redbull.com/images/c_crop,x_1926,y_0,h_3769,w_2827/c_fill,w_400,h_540/q_auto:low,f_auto/redbullcom/2023/3/22/pjjsk4mejcei48nl7sfd/alderiate-red-bull-challengers-league-of-legends" alt=""/>

            <div ref={threeRef}></div>
        </div>
    );
}

export default Z3DGame;