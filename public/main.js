const canvas = document.querySelector('canvas')
const gl = canvas.getContext('webgl');

if(!gl) {
    throw new Error("WebGL not supported");
}
alert("Everything's peachy here");
console.log("Hello");

const scene = new THREE.Scene();
console.log(scene);
