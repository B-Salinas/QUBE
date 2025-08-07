import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

// Check if WebGL is available
if (!WebGL.isWebGLAvailable()) {
  console.error('WebGL is not available');
  document.body.appendChild(WebGL.getWebGLErrorMessage());
}

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
let cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
let cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

console.log(cubeGeometry);

// Create lines from opposite face midpoints using modern BufferGeometry
let positions = cubeGeometry.attributes.position;
let indices = cubeGeometry.index;

// Get the first and last face vertices for the line
let face1Vertex1 = new THREE.Vector3();
let face1Vertex2 = new THREE.Vector3();
let face2Vertex1 = new THREE.Vector3();
let face2Vertex2 = new THREE.Vector3();

// Get vertices from first face (indices 0, 1, 2)
face1Vertex1.fromBufferAttribute(positions, indices.getX(0));
face1Vertex2.fromBufferAttribute(positions, indices.getX(1));

// Get vertices from last face (indices 18, 19, 20) - assuming 6 faces with 4 vertices each
let lastFaceStart = indices.count - 6;
face2Vertex1.fromBufferAttribute(positions, indices.getX(lastFaceStart));
face2Vertex2.fromBufferAttribute(positions, indices.getX(lastFaceStart + 1));

// Calculate midpoints
let midpoint1 = new THREE.Vector3().addVectors(face1Vertex1, face1Vertex2).multiplyScalar(0.5);
let midpoint2 = new THREE.Vector3().addVectors(face2Vertex1, face2Vertex2).multiplyScalar(0.5);

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

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
