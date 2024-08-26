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

function createVertices(size) {
  return [
    [-size, -size, -size, size],
    [size, -size, -size, size],
    [size, size, -size, size],
    [-size, size, -size, size],
    [-size, -size, size, size],
    [size, -size, size, size],
    [size, size, size, size],
    [-size, size, size, size],
    [-size, -size, -size, -size],
    [size, -size, -size, -size],
    [size, size, -size, -size],
    [-size, size, -size, -size],
    [-size, -size, size, -size],
    [size, -size, size, -size],
    [size, size, size, -size],
    [-size, size, size, -size],
  ];
}

// Replace the single material with an array of materials
const materials = [
  new THREE.LineBasicMaterial({ color: 0xff0000 }), // Red for X
  new THREE.LineBasicMaterial({ color: 0x00ff00 }), // Green for Y
  new THREE.LineBasicMaterial({ color: 0x0000ff }), // Blue for Z
  new THREE.LineBasicMaterial({ color: 0xffffff }), // White for edges connecting inner and outer cubes
];

// Modify the edges array to include material index
const edges = [
  // Outer cube
  [0, 1, 0],
  [1, 2, 1],
  [2, 3, 0],
  [3, 0, 1], // Front face (X-Y plane)
  [4, 5, 0],
  [5, 6, 1],
  [6, 7, 0],
  [7, 4, 1], // Back face (X-Y plane)
  [0, 4, 2],
  [1, 5, 2],
  [2, 6, 2],
  [3, 7, 2], // Connecting edges (Z axis)

  // Inner cube
  [8, 9, 0],
  [9, 10, 1],
  [10, 11, 0],
  [11, 8, 1], // Front face (X-Y plane)
  [12, 13, 0],
  [13, 14, 1],
  [14, 15, 0],
  [15, 12, 1], // Back face (X-Y plane)
  [8, 12, 2],
  [9, 13, 2],
  [10, 14, 2],
  [11, 15, 2], // Connecting edges (Z axis)

  // Connecting outer to inner
  [0, 8, 3],
  [1, 9, 3],
  [2, 10, 3],
  [3, 11, 3], // Front connections
  [4, 12, 3],
  [5, 13, 3],
  [6, 14, 3],
  [7, 15, 3], // Back connections
];

const cubeGeometry = new THREE.BufferGeometry();
const cubeMaterial = new THREE.LineBasicMaterial({ vertexColors: true });

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

  const outerSize = ((Math.sin(t) + 1) * (maxSize - minSize)) / 2 + minSize;
  const innerSize =
    ((Math.sin(t + Math.PI) + 1) * (maxSize - minSize)) / 2 + minSize;

  const outerVertices = createVertices(outerSize);
  const innerVertices = createVertices(innerSize);
  const vertices = [...outerVertices, ...innerVertices];

  const rotatedVertices = vertices.map((v) => {
    const point4D = new THREE.Vector4(v[0], v[1], v[2], v[3]);
    point4D.applyMatrix4(rotationMatrix);
    return project4Dto3D(point4D.toArray());
  });

  const positions = [];
  const colors = [];
  edges.forEach((edge) => {
    positions.push(
      rotatedVertices[edge[0]].x,
      rotatedVertices[edge[0]].y,
      rotatedVertices[edge[0]].z,
      rotatedVertices[edge[1]].x,
      rotatedVertices[edge[1]].y,
      rotatedVertices[edge[1]].z
    );
    const color = materials[edge[2]].color;
    colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
  });

  cubeGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  cubeGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );
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
