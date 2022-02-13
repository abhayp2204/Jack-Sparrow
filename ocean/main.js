import * as THREE from "three";
import './style.css'

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { PerspectiveCamera } from "three";

let camera;
let scene;
let renderer;
let controls;
let water;
let sun;
let boat;
let dir;
let vec = new THREE.Vector3(); 
// const boat;
const PI = 3.14159;

// Keycodes
const keyW = 87;
const keyA = 65;
const keyS = 83;
const keyD = 68;

let east = new THREE.Vector3(0, 0, -1);

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
    camera.position.set(0, 10, 100);

    sun = new THREE.Vector3();

    // Water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

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

    water.rotation.x = -Math.PI / 2;

    scene.add(water);

    // Sky 1
    const sky1 = new Sky();
    sky1.scale.setScalar(10000);
    scene.add(sky1);
    
    const skyUniforms1 = sky1.material.uniforms;
    skyUniforms1["turbidity"].value = 10;
    skyUniforms1["rayleigh"].value = 2;
    skyUniforms1["mieCoefficient"].value = 0.004;
    skyUniforms1["mieDirectionalG"].value = 1.001;
    
    // Sky 2
    const sky2 = new Sky();
    sky2.scale.setScalar(10000);
    // scene.add(sky2);

    const skyUniforms2 = sky2.material.uniforms;
    skyUniforms2["turbidity"].value = 10;
    skyUniforms2["rayleigh"].value = 2;
    skyUniforms2["mieCoefficient"].value = 0.004;
    skyUniforms2["mieDirectionalG"].value = 1.8;
    
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

    updateSun(sky1);
    // updateSun(sky2);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
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
    render();
}

function render() {
    water.material.uniforms["time"].value += 1.0 / 60.0;
    renderer.render(scene, camera);
}

// Boat
function addBoat() {
    const radius = 20;
    const density = 10;
    const geometry = new THREE.SphereGeometry(radius, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff});
    boat = new THREE.Mesh(geometry, material);

    const x = 0;
    const y = radius - density;
    const z = 0;

    boat.position.set(x, 10, z);
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
    let speed = 30;

    obj.position.x += speed * Math.sin(angle - phi);
    obj.position.z -= speed * Math.cos(angle - phi);
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
    console.log("Boat Pos : ", boat.position);
    console.log("Camera Pos : ", camera.position);
    console.log("Distance", boat.position.distanceTo(camera.position));
}