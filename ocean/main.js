import * as THREE from "three";
import './style.css'

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { PerspectiveCamera } from "three";

let camera;
let scene;
let radius = 10;
let hoverFactor = 1;
let hover = hoverFactor * radius;
let renderer;
let controls;
let water;

let sun;
let sign;
let flag;

let sunVol = 0.004;
let horizonDistance = 100000;
let vec = new THREE.Vector3(); 
let boat;
let boatSpeed = 20;
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

sign = 1;
init();
addBoat();
animate();

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        20000
    );
    camera.position.set(0, hover, radius*2);

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

    render();
}

function render() {
    water.material.uniforms["time"].value += 1.0 / 60.0;
    renderer.render(scene, camera);
}

// Boat
function addBoat() {
    const mass = 50000;
    const volume = 4/3*PI*(radius**3);
    const density = mass/volume;
    const buoyancy = 1;

    const geometry = new THREE.SphereGeometry(radius, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xfadf1f});
    boat = new THREE.Mesh(geometry, material);

    const x = 0;
    const y = density*buoyancy;
    const z = 0;

    boat.position.set(x, y/2, z);
    scene.add(boat);
};

function direction() {
    let pos = new THREE.Vector3();

    pos.x = boat.position.x - camera.position.x;
    pos.y = boat.position.y - camera.position.y;
    pos.z = boat.position.z - camera.position.z;

    pos.normalize();
    return pos;
}

function move(obj, angle, phi)
{
    obj.position.x += boatSpeed * Math.sin(angle - phi);
    obj.position.z -= boatSpeed * Math.cos(angle - phi);
}

document.addEventListener('keydown', function(event) {
    const speed = 30;
    let pos = direction();
    let angle = pos.angleTo(east);
    angle *= ((camera.position.x < boat.position.x) - 0.5) * 2;
    let conv = 3.14159/180
    // let degree = angle/conv;
    
    // Move
    switch(event.keyCode)
    {
        // Front
        case keyW: move(boat, angle, 0);
                   move(camera, angle, 0);
                   break;
        // Left
        case keyA: move(boat, angle, PI/2);
                   move(camera, angle, PI/2);
                   break;
        case keyS: move(boat, angle, PI);
                   move(camera, angle, PI);
                   break;
        case keyD: move(boat, angle, 3*PI/2);
                   move(camera, angle, 3*PI/2);
                   break;
    }
    controls.target.set(boat.position.x, boat.position.y, boat.position.z);
    stats();
});

function stats() {
    // Stats
    console.clear();
    console.log(skyUniforms["mieDirectionalG"].value);
    // console.log("Boat Pos : ", boat.position);
    // console.log("Camera Pos : ", camera.position);
    // console.log("Distance", boat.position.distanceTo(camera.position));
}