import * as THREE from "three";
import './style.css'

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { PerspectiveCamera } from "three";

let camera;
let scene;
let hoverFactor = 1;
let renderer;
let controls;
let water;

let sun;
let sign;
let flag;

let sunVol = 0.004;
let horizonDistance = 5000;
let vec = new THREE.Vector3(); 

// Ship
let ship;
let shipRadius = 10;
let hover = hoverFactor * shipRadius;
let shipSpeed = 5;

// Pirate Ship
let pirateShipSpeed = 1;
let pirateShipRadius = 10;
let pirateShipAlive = true;
const NUM_PIRATE_SHIPS = 5;
const distanceFactor = 0.07;
let targetDir;
let minDistance;

// Cannonball
let cannonBall;
let cannonBallRadius = 4;
let cannonBallFired = false;
const cannonBallSpeed = 30;
let cannonDirection;

const PI = 3.14159;

// Keycodes
const keyW = 87;
const keyA = 65;
const keyS = 83;
const keyD = 68;
const keySpace = 32;

let east = new THREE.Vector3(0, 0, -1);

const sky = new Sky();
const skyUniforms = sky.material.uniforms;

// Sample colors
const darkGray = 0x222222;
const black = 0x000000;
const red = 0xAA0119;
const yellow = 0xfadf1f;

// Game colors
const shipColor = yellow;
const pirateShipColor = black;
const cannonBallColor = red;

sign = 1;
init();
addShip();

let p1 = addPirateShip();
let p2 = addPirateShip();
let p3 = addPirateShip();

addCannonBall();
animate();

// Ship
function addShip() {
    const geometry = new THREE.SphereGeometry(shipRadius, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xfadf1f});
    ship = new THREE.Mesh(geometry, material);

    const x = 0;
    const y = shipRadius * 0.8;
    const z = 0;

    ship.position.set(x, y, z);
    scene.add(ship);
};

// Pirate Ship
function addPirateShip() {
    const geometry = new THREE.SphereGeometry(shipRadius, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: pirateShipColor});
    let ps = new THREE.Mesh(geometry, material);

    var location = random_spawn();
    const x = location[0];
    const y = pirateShipRadius * 0.8;
    const z = location[2];

    console.log(x);

    ps.position.set(x, y, z);
    scene.add(ps);
    return ps;
};

// Cannon Ball
function addCannonBall() {
    const geometry = new THREE.SphereGeometry(cannonBallRadius, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: cannonBallColor});
    cannonBall = new THREE.Mesh(geometry, material);

    var location = random_spawn();
    const x = 0;
    const y = shipRadius * 0.8;
    const z = -10;

    cannonBall.position.set(ship.position.x, ship.position.y + shipRadius, ship.position.z);
    scene.add(cannonBall);
};

// Fire Cannon
function fireCannonBall() {
    cannonDirection = direction(ship, camera);
    cannonBallFired = true;
    // cannonBall.position.x += pos.x;
    // cannonBall.position.z += pos.z;
}

// Move Cannonball
function moveCannonBall() {
    if(cannonBallFired)
    {
        cannonBall.position.x += cannonDirection.x * cannonBallSpeed;
        cannonBall.position.z += cannonDirection.z * cannonBallSpeed;
    }

    let d = ship.position.distanceTo(cannonBall.position);

    if(d > 2000)
    {
        cannonBallFired = false;
        cannonBall.position.set(ship.position.x, ship.position.y + shipRadius, ship.position.z);
    }

    destroyPirateShip(p1);
    destroyPirateShip(p2);
    destroyPirateShip(p3);
    // let dtps;
    // dtps = p1.position.distanceTo(cannonBall.position)
    // if(dtps < 20)
    // {
    //     pirateShipAlive = false;
    //     scene.remove(p1);
    //     console.log("Hit!")
    // }
    // console.log(dtps);
}

function destroyPirateShip(ps) {
    let dtps = ps.position.distanceTo(cannonBall.position);
    if(dtps < 20)
    {
        // ps = false;
        scene.remove(ps);
        console.log("Hit!")
    }
}

function movePirateShip(ps) {
    // Get direction: pirateShip ---> Ship (normalized)
    targetDir = direction(ship, ps);

    ps.position.x += targetDir.x * pirateShipSpeed * 1.6;
    ps.position.z += targetDir.z * pirateShipSpeed * 1.6;
}

document.addEventListener('keydown', function(event) {
    const speed = 30;
    let pos = direction(ship, camera);
    let angle = pos.angleTo(east);
    angle *= ((camera.position.x < ship.position.x) - 0.5) * 2;
    
    // Move
    switch(event.keyCode)
    {
        // Front
        case keyW: 
            move(ship, angle, 0);
            move(camera, angle, 0);
            move(cannonBall, angle, 0);
            break;
        // Left
        case keyA: 
            move(ship, angle, PI/2);
            move(camera, angle, PI/2);
            move(cannonBall, angle, PI/2);
            break;
        // Back
        case keyS: 
            move(ship, angle, PI);
            move(camera, angle, PI);
            move(cannonBall, angle, PI);
            break;
        // Right
        case keyD: 
            move(ship, angle, 3*PI/2);
            move(camera, angle, 3*PI/2);
            move(cannonBall, angle, 3*PI/2);
            break;
        // Shoot
        case keySpace:
            if(cannonBallFired)
                break;
            console.log("Fire Cannon!");
            fireCannonBall();
    }
    controls.target.set(ship.position.x, ship.position.y, ship.position.z);

    // stats();
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    skyUniforms["mieDirectionalG"].value += sunVol * sign;
    if(skyUniforms["mieDirectionalG"].value >= 2)
    {
        sign = -1;
    }
    if(skyUniforms["mieDirectionalG"].value <= 0.5)
    {
        sign = 1;
    }

    movePirateShip(p1);
    movePirateShip(p2);
    movePirateShip(p3);
    moveCannonBall();
    // cannonBall.position.set(ship.position.x, ship.position.y + shipRadius, ship.position.z);
    render();
}

function init() {
    // Scene
    scene = new THREE.Scene();

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    const fov = 70;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 20000;

    camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera.position.set(0, hover*3, shipRadius*7);

    sun = new THREE.Vector3();

    // Water
    const waterGeometry = new THREE.PlaneGeometry(horizonDistance, horizonDistance);

    water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
            "textures/waternormals.jpg",
            function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
    });

    water.rotation.x = -Math.PI/2;

    scene.add(water);

    // Sky 1
    // const sky = new Sky();
    sky.scale.setScalar(horizonDistance);
    scene.add(sky);
    
    // const skyUniforms = sky.material.uniforms;
    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.004;
    skyUniforms["mieDirectionalG"].value = 0.6;
    
    const parameters = {
        elevation: 1,
        azimuth: 180,
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun(sky) {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms["sunPosition"].value.copy(sun);
        water.material.uniforms["sunDirection"].value.copy(sun).normalize();

        scene.environment = pmremGenerator.fromScene(sky).texture;
    }

    updateSun(sky);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, hover, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    const waterUniforms = water.material.uniforms;

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    water.material.uniforms["time"].value += 1.0 / 60.0;
    renderer.render(scene, camera);
}

function direction(A, B) {
    let pos = new THREE.Vector3();

    pos.x = A.position.x - B.position.x;
    pos.y = 0
    pos.z = A.position.z - B.position.z;

    pos.normalize();
    return pos;
}

function move(obj, angle, phi)
{
    obj.position.x += shipSpeed * Math.sin(angle - phi);
    obj.position.z -= shipSpeed * Math.cos(angle - phi);
}

function stats() {
    // Stats
    console.clear();
    console.log(skyUniforms["mieDirectionalG"].value);
    // console.log("Ship Pos : ", ship.position);
    // console.log("Camera Pos : ", camera.position);
    // console.log("Distance", ship.position.distanceTo(camera.position));
}

// Random spawn position
function random_integer(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function random_spawn() {
    let x = random_integer(-horizonDistance * distanceFactor, horizonDistance * distanceFactor);
    let y = shipRadius * 0.8;
    let z = random_integer(-horizonDistance * distanceFactor, horizonDistance * distanceFactor);

    return [x, y, z];
}