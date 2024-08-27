import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

if (!WebGL.isWebGLAvailable()) {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
}

//

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Size control
const maxSize = 1;
const minSize = 0.3;

// Modify the createVertices function to create all 16 vertices of a tesseract
function createVertices(size) {
  return [
    [-size, -size, -size, -size], // 0
    [size, -size, -size, -size], // 1
    [size, size, -size, -size], // 2
    [-size, size, -size, -size], // 3
    [-size, -size, size, -size], // 4
    [size, -size, size, -size], // 5
    [size, size, size, -size], // 6
    [-size, size, size, -size], // 7
    [-size, -size, -size, size], // 8
    [size, -size, -size, size], // 9
    [size, size, -size, size], // 10
    [-size, size, -size, size], // 11
    [-size, -size, size, size], // 12
    [size, -size, size, size], // 13
    [size, size, size, size], // 14
    [-size, size, size, size], // 15
  ];
}

// Define colors for XYZ axes and remaining edges
const axisColors = [
  new THREE.Color(0xff0000), // Red for X
  new THREE.Color(0x00ff00), // Green for Y
  new THREE.Color(0x0000ff), // Blue for Z
  new THREE.Color(0xffffff), // White for remaining edges
];

// Create a single material with vertex colors
const cubeMaterial = new THREE.LineBasicMaterial({ vertexColors: true });

// Modify the edges array to include correct color index
const edges = [
  // Outer cube
  [0, 1, 0], [1, 2, 1], [2, 3, 0], [3, 0, 1], // Front face
  [4, 5, 0], [5, 6, 1], [6, 7, 0], [7, 4, 1], // Back face
  [0, 4, 2], [1, 5, 2], [2, 6, 2], [3, 7, 2], // Connecting edges
  // Inner cubes (8 in total)
  [8, 9, 0], [9, 10, 1], [10, 11, 0], [11, 8, 1], // Inner front face
  [12, 13, 0], [13, 14, 1], [14, 15, 0], [15, 12, 1], // Inner back face
  [8, 12, 2], [9, 13, 2], [10, 14, 2], [11, 15, 2], // Inner connecting edges
  // Connections between outer and inner cubes
  [0, 8, 3], [1, 9, 3], [2, 10, 3], [3, 11, 3],
  [4, 12, 3], [5, 13, 3], [6, 14, 3], [7, 15, 3],
];

const cubeGeometry = new THREE.BufferGeometry();

function project4Dto3D(point, w = 2) {
  const scale = 1 / (w - point[3]);
  return new THREE.Vector3(
    point[0] * scale,
    point[1] * scale,
    point[2] * scale
  );
}

function updateTesseract(time) {
  const t = time * 0.001;
  const rotationMatrix = new THREE.Matrix4()
    .makeRotationY(t * 0.5)
    .multiply(new THREE.Matrix4().makeRotationX(t * 0.3))
    .multiply(new THREE.Matrix4().makeRotationZ(t * 0.2));

  // 4D rotation
  const rotation4D = new THREE.Matrix4().set(
    Math.cos(t), 0, -Math.sin(t), 0,
    0, 1, 0, 0,
    Math.sin(t), 0, Math.cos(t), 0,
    0, 0, 0, 1
  ).multiply(new THREE.Matrix4().set(
    1, 0, 0, 0,
    0, Math.cos(t * 0.7), 0, -Math.sin(t * 0.7),
    0, 0, 1, 0,
    0, Math.sin(t * 0.7), 0, Math.cos(t * 0.7)
  ));

  const vertices = createVertices(1); // Create vertices with size 1

  const rotatedVertices = vertices.map((v) => {
    const point4D = new THREE.Vector4(v[0], v[1], v[2], v[3]);
    point4D.applyMatrix4(rotation4D); // Apply 4D rotation
    point4D.applyMatrix4(rotationMatrix); // Apply 3D rotation
    return project4Dto3D(point4D.toArray());
  });

  const positions = [];
  const colors = [];
  edges.forEach((edge) => {
    positions.push(
      rotatedVertices[edge[0]].x, rotatedVertices[edge[0]].y, rotatedVertices[edge[0]].z,
      rotatedVertices[edge[1]].x, rotatedVertices[edge[1]].y, rotatedVertices[edge[1]].z
    );
    const colorIndex = edge[2];
    const color = axisColors[colorIndex];
    colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
  });

  cubeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  cubeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  cubeGeometry.attributes.position.needsUpdate = true;
  cubeGeometry.attributes.color.needsUpdate = true;
}

const tesseract = new THREE.LineSegments(cubeGeometry, cubeMaterial);
scene.add(tesseract);

camera.position.z = 5;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

function animate(time) {
  requestAnimationFrame(animate);
  updateTesseract(time);
  controls.update();
  renderer.render(scene, camera);
}

animate(0);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
