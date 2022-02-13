// Imports
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create a Scene object named scene
const scene = new THREE.Scene();

// Camera args
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const frustrumLowerLimit = 0.1;
const frustrumUpperLimit = 1000;

// Create a PerspectiveCamera object named camera
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, frustrumLowerLimit, frustrumUpperLimit);

// Render
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff0f7f});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Light
const pointLight = new THREE.PointLight(0xffffff);
const lightHelper = new THREE.PointLightHelper(pointLight);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);
scene.add(lightHelper);

// Grid
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(gridHelper);
const controls = new OrbitControls(camera, renderer.domElement);

// Star
function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff});
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
};
Array(200).fill().forEach(addStar);

// Space Texture
const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;
    
// Moon
const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshBasicMaterial({map: moonTexture})
);
moon.position.z = 30;
moon.position.setX(-10);
scene.add(moon);

let speed = 0.01;
function animate() {
    requestAnimationFrame(animate);

    // Rotations
    // torus.rotation.x += 0.03;
    torus.rotation.y += speed;
    // torus.rotation.z += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

animate()