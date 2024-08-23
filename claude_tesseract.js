import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// .
// .
// .
// .
// .

// W A R N I N G S

if (!WebGL.isWebGLAvailable()) {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
}

//
//

// Set up the scene, camera, and renderer
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

// Create the tesseract geometry
const vertices = [
  [-1, -1, -1, 1],
  [1, -1, -1, 1],
  [1, 1, -1, 1],
  [-1, 1, -1, 1],
  [-1, -1, 1, 1],
  [1, -1, 1, 1],
  [1, 1, 1, 1],
  [-1, 1, 1, 1],
  [-1, -1, -1, -1],
  [1, -1, -1, -1],
  [1, 1, -1, -1],
  [-1, 1, -1, -1],
  [-1, -1, 1, -1],
  [1, -1, 1, -1],
  [1, 1, 1, -1],
  [-1, 1, 1, -1],
];

function createGridEdges() {
  const gridEdges = [];
  const gridDivisions = 4; // Number of divisions for the grid

  function addGridToFace(v1, v2, v3, v4) {
    for (let i = 1; i < gridDivisions; i++) {
      const t = i / gridDivisions;
      gridEdges.push([
        interpolateVertex(v1, v2, t),
        interpolateVertex(v4, v3, t),
      ]);
      gridEdges.push([
        interpolateVertex(v1, v4, t),
        interpolateVertex(v2, v3, t),
      ]);
    }
  }

  // Add grid to each face of each cube
  addGridToFace(0, 1, 2, 3);
  addGridToFace(4, 5, 6, 7);
  addGridToFace(0, 1, 5, 4);
  addGridToFace(2, 3, 7, 6);
  addGridToFace(0, 3, 7, 4);
  addGridToFace(1, 2, 6, 5);

  addGridToFace(8, 9, 10, 11);
  addGridToFace(12, 13, 14, 15);
  addGridToFace(8, 9, 13, 12);
  addGridToFace(10, 11, 15, 14);
  addGridToFace(8, 11, 15, 12);
  addGridToFace(9, 10, 14, 13);

  return gridEdges;
}

function interpolateVertex(v1, v2, t) {
  return (
    vertices.length +
    [
      v1[0] + (v2[0] - v1[0]) * t,
      v1[1] + (v2[1] - v1[1]) * t,
      v1[2] + (v2[2] - v1[2]) * t,
      v1[3] + (v2[3] - v1[3]) * t,
    ]
  );
}

const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 8],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 12],
  [8, 12],
  [9, 13],
  [10, 14],
  [11, 15],
  [0, 8],
  [1, 9],
  [2, 10],
  [3, 11],
  [4, 12],
  [5, 13],
  [6, 14],
  [7, 15],
];

const gridEdges = createGridEdges();
const allEdges = [...edges, ...gridEdges];

const geometry = new THREE.BufferGeometry();
const material = new THREE.LineBasicMaterial({ color: 0xffffff });

// Function to project 4D points to 3D
function project4Dto3D(point, w = 2) {
  const scale = 1 / (w - point[3]);
  return new THREE.Vector3(
    point[0] * scale,
    point[1] * scale,
    point[2] * scale
  );
}

// Function to update the tesseract's rotation
function updateTesseract(time) {
  const rotatedVertices = vertices.map((v) => {
    let [x, y, z, w] = v;

    // Rotate in 4D
    const t = time * 0.001;
    const newX = x * Math.cos(t) - w * Math.sin(t);
    const newW = x * Math.sin(t) + w * Math.cos(t);

    return project4Dto3D([newX, y, z, newW]);
  });

  const positions = [];
  edges.forEach((edge) => {
    positions.push(
      rotatedVertices[edge[0]].x,
      rotatedVertices[edge[0]].y,
      rotatedVertices[edge[0]].z
    );
    positions.push(
      rotatedVertices[edge[1]].x,
      rotatedVertices[edge[1]].y,
      rotatedVertices[edge[1]].z
    );
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.attributes.position.needsUpdate = true;
}

const tesseract = new THREE.LineSegments(geometry, material);
scene.add(tesseract);

camera.position.z = 5;

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  updateTesseract(time);
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
