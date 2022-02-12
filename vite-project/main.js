// Imports
import './style.css';
import * as THREE from 'three';

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
const material = new THREE.MeshStandardMaterial({ color: 0x349194});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff);;
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

function animate() {
    requestAnimationFrame(animate);

    // Rotations
    torus.rotation.x += 0.03;
    torus.rotation.y += 0.01;
    torus.rotation.z += 0.01;

    renderer.render(scene, camera);
}

animate()