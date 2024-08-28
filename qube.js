// Written with Claude 3.5 and Cursor
// By Bianca "B" Salinas
// Created on Monday, August 26, 2024
// Last updated on Wednesday, August 28, 2024

// QUBE stands for Quaternion-based Unified Boundary Element
// QUBE stands for Quantum U Bounded Energy ??


import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

console.log("qube.js is running");

let scene, camera, renderer, controls;
let qube;

const colors = [
  new THREE.Color(0xffffff), // White
  new THREE.Color(0xff0000), // Red
  new THREE.Color(0x0000ff), // Blue
  new THREE.Color(0x00ff00), // Green
];

function init() {
  console.log("Initializing...");
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 10;

    createQube();

    window.addEventListener("resize", onWindowResize, false);
    console.log("Initialization complete");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

function createQube() {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ vertexColors: true });

  const vertices = [];
  const colorAttributes = [];

  // Create 8 inner tesseracts
  for (let i = 0; i < 8; i++) {
    const x = i & 1 ? 0.5 : -0.5;
    const y = i & 2 ? 0.5 : -0.5;
    const z = i & 4 ? 0.5 : -0.5;

    createMiniTesseract(x, y, z, 0.4, vertices, colorAttributes);
  }

  // Create central cube (Qube)
  createCube(0, 0, 0, 1, vertices, colorAttributes, false, true);

  // Create outer cube (Haus)
  createCube(0, 0, 0, 2, vertices, colorAttributes, true);

  // Connect Haus and Qube at 8 vertices
  const hausCorners = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];

  hausCorners.forEach((corner, index) => {
    vertices.push(
      corner[0],
      corner[1],
      corner[2],
      corner[0] * 0.5,
      corner[1] * 0.5,
      corner[2] * 0.5
    );
    colorAttributes.push(...colors[0].toArray(), ...colors[0].toArray());
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colorAttributes, 3)
  );

  qube = new THREE.LineSegments(geometry, material);
  scene.add(qube);
}

function createMiniTesseract(x, y, z, size, vertices, colorAttributes) {
  // Create outer cube of mini-tesseract
  createCube(x, y, z, size, vertices, colorAttributes);

  // Create inner cube of mini-tesseract
  const innerSize = size * 0.5;
  createCube(x, y, z, innerSize, vertices, colorAttributes, false, true);

  // Create connecting lines between inner and outer cubes
  const halfSize = size / 2;
  const halfInnerSize = innerSize / 2;
  const corners = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];

  corners.forEach((corner, index) => {
    vertices.push(
      x + corner[0] * halfSize,
      y + corner[1] * halfSize,
      z + corner[2] * halfSize,
      x + corner[0] * halfInnerSize,
      y + corner[1] * halfInnerSize,
      z + corner[2] * halfInnerSize
    );

    const colorIndex = index % colors.length;
    colorAttributes.push(
      ...colors[colorIndex].toArray(),
      ...colors[colorIndex].toArray()
    );
  });
}

function createCube(
  x,
  y,
  z,
  size,
  vertices,
  colorAttributes,
  isOuterCube = false,
  isCentralCube = false,
  isInnermostCube = false
) {
  const halfSize = size / 2;
  const corners = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ];

  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0], // Bottom face
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4], // Top face
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7], // Connecting edges
  ];

  edges.forEach(([a, b], index) => {
    vertices.push(
      x + corners[a][0] * halfSize,
      y + corners[a][1] * halfSize,
      z + corners[a][2] * halfSize,
      x + corners[b][0] * halfSize,
      y + corners[b][1] * halfSize,
      z + corners[b][2] * halfSize
    );

    let colorIndex;
    if (isOuterCube) {
      // For outer cube: X = Red, Y = Green, Z = Blue
      if (index < 4) colorIndex = 1; // Red for X (bottom face)
      else if (index < 8) colorIndex = 2; // Green for Y (top face)
      else colorIndex = 3; // Blue for Z (connecting edges)
    } else if (isCentralCube) {
      colorIndex = 0; // White for central cube
    } else if (isInnermostCube) {
      colorIndex = 1; // Red for innermost cube
    } else {
      colorIndex = index % colors.length;
    }
    colorAttributes.push(
      ...colors[colorIndex].toArray(),
      ...colors[colorIndex].toArray()
    );
  });
}

let animationFrameId;
let time = 0;

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  time += 0.01;

  if (qube) {
    // Rotate the entire structure
    qube.rotation.x = Math.sin(time * 0.5) * 0.5;
    qube.rotation.y = Math.cos(time * 0.4) * 0.5;

    // No pulsing animation, so we don't need to modify vertices
  }

  renderer.render(scene, camera);

  // Safeguard against infinite recursion
  if (time > 600) {
    // Stop after about 1 minute
    cancelAnimationFrame(animationFrameId);
    console.log("Animation stopped after 1 minute as a safeguard");
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

try {
  init();
  animate(0);
} catch (error) {
  console.error("Error starting the application:", error);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
