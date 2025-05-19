import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Set up the scene
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube
let cubeGeometry = new THREE.BoxGeometry(2, 2, 2, 3, 3, 3);
let cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

console.log(cubeGeometry);

// Create lines from opposite face midpoints
let face1 = cubeGeometry.faces[0]; // assuming a standard cube
let face2 = cubeGeometry.faces[5];

let midpoint1 = new THREE.Vector3()
  .addVectors(cubeGeometry.vertices[face1.a], cubeGeometry.vertices[face1.b])
  .divideScalar(2);
let midpoint2 = new THREE.Vector3()
  .addVectors(cubeGeometry.vertices[face2.a], cubeGeometry.vertices[face2.b])
  .divideScalar(2);

let lineGeometry = new THREE.BufferGeometry().setFromPoints([
  midpoint1,
  midpoint2,
]);
let lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
let line = new THREE.Line(lineGeometry, lineMaterial);

scene.add(cube);
scene.add(line);

// Set camera position
camera.position.z = 5;

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube
  cube.rotation.x += 0.08;
  cube.rotation.y += 0.05;

  renderer.render(scene, camera);
}

animate();
