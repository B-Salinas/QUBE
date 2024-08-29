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

const colors = {
  x: new THREE.Color(0xff0000), // Red for X-axis
  y: new THREE.Color(0x00ff00), // Green for Y-axis
  z: new THREE.Color(0x0000ff), // Blue for Z-axis
  white: new THREE.Color(0xffffff), // White for diagonal lines
};

const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio, approximately 1.618033988749895

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

function createGrid(size, divisions) {
  const vertices = [];
  const step = size / divisions;

  // Create grid lines
  for (let i = 0; i <= divisions; i++) {
    const pos = i * step - size / 2;

    // X-axis lines
    vertices.push(-size / 2, pos, -size / 2, size / 2, pos, -size / 2);
    vertices.push(-size / 2, pos, size / 2, size / 2, pos, size / 2);
    vertices.push(-size / 2, -size / 2, pos, -size / 2, size / 2, pos);
    vertices.push(size / 2, -size / 2, pos, size / 2, size / 2, pos);

    // Y-axis lines
    vertices.push(pos, -size / 2, -size / 2, pos, size / 2, -size / 2);
    vertices.push(pos, -size / 2, size / 2, pos, size / 2, size / 2);

    // Z-axis lines (added)
    vertices.push(-size / 2, pos, -size / 2, -size / 2, pos, size / 2);
    vertices.push(size / 2, pos, -size / 2, size / 2, pos, size / 2);
    vertices.push(pos, -size / 2, -size / 2, pos, -size / 2, size / 2);
    vertices.push(pos, size / 2, -size / 2, pos, size / 2, size / 2);
  }

  return new Float32Array(vertices);
}

function createQube() {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ vertexColors: true });

  const vertices = [];
  const colorAttributes = [];

  const qubeSize = 1; // Base size for the inner cube (Qube)
  const hausSize = qubeSize * PHI; // Size of the outer cube (Haus)

  // Create central cube (Qube)
  createCube(0, 0, 0, qubeSize, vertices, colorAttributes, false, true);

  // Create outer cube (Haus)
  createCube(0, 0, 0, hausSize, vertices, colorAttributes, true);

  // Extend XYZ lines from Qube edges to Haus edges
  const extendedLines = [
    // X-axis (red)
    [
      -qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      -hausSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
    ],
    [
      qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      hausSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
    ],
    [
      -qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      -hausSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
    ],
    [
      qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      hausSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
    ],
    [
      -qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      -hausSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
    ],
    [
      qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      hausSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
    ],
    [
      -qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      -hausSize / 2,
      qubeSize / 2,
      qubeSize / 2,
    ],
    [
      qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      hausSize / 2,
      qubeSize / 2,
      qubeSize / 2,
    ],
    // Y-axis (green)
    [
      -qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      -hausSize / 2,
      -qubeSize / 2,
    ],
    [
      qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      -hausSize / 2,
      -qubeSize / 2,
    ],
    [
      -qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      hausSize / 2,
      -qubeSize / 2,
    ],
    [
      qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      hausSize / 2,
      -qubeSize / 2,
    ],
    [
      -qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      -hausSize / 2,
      qubeSize / 2,
    ],
    [
      qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      -hausSize / 2,
      qubeSize / 2,
    ],
    [
      -qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      hausSize / 2,
      qubeSize / 2,
    ],
    [
      qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      hausSize / 2,
      qubeSize / 2,
    ],
    // Z-axis (blue)
    [
      -qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      -hausSize / 2,
    ],
    [
      qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      -hausSize / 2,
    ],
    [
      -qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      -hausSize / 2,
    ],
    [
      qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      -hausSize / 2,
    ],
    [
      -qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      -qubeSize / 2,
      hausSize / 2,
    ],
    [
      qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      hausSize / 2,
    ],
    [
      -qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      -qubeSize / 2,
      qubeSize / 2,
      hausSize / 2,
    ],
    [
      qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      qubeSize / 2,
      hausSize / 2,
    ],
  ];

  extendedLines.forEach((line, index) => {
    vertices.push(...line);
    const color = index < 8 ? colors.x : index < 16 ? colors.y : colors.z;
    colorAttributes.push(...color.toArray(), ...color.toArray());
  });

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

  hausCorners.forEach((corner) => {
    vertices.push(
      (corner[0] * hausSize) / 2,
      (corner[1] * hausSize) / 2,
      (corner[2] * hausSize) / 2,
      (corner[0] * qubeSize) / 2,
      (corner[1] * qubeSize) / 2,
      (corner[2] * qubeSize) / 2
    );

    // Check if the line is strictly along one axis
    if (corner.filter((coord) => coord !== 0).length === 1) {
      // The line is along a single axis
      let primaryColor;
      if (corner[0] !== 0) primaryColor = colors.x;
      else if (corner[1] !== 0) primaryColor = colors.y;
      else primaryColor = colors.z;
      colorAttributes.push(
        ...primaryColor.toArray(),
        ...primaryColor.toArray()
      );
    } else {
      // The line is diagonal, so use white
      colorAttributes.push(
        ...colors.white.toArray(),
        ...colors.white.toArray()
      );
    }
  });

  // Create Haus grid
  const hausGridDivisions = 5; // 5x5x5 grid for Haus
  const hausGridGeometry = new THREE.BufferGeometry();
  hausGridGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(createGrid(hausSize, hausGridDivisions), 3)
  );
  const hausGridMaterial = new THREE.LineBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.3,
  });
  const hausGrid = new THREE.LineSegments(hausGridGeometry, hausGridMaterial);

  // Create Qube grid
  const qubeGridDivisions = 3; // 3x3x3 grid for Qube (adjust as needed)
  const qubeGridGeometry = new THREE.BufferGeometry();
  qubeGridGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(createGrid(qubeSize, qubeGridDivisions), 3)
  );
  const qubeGridMaterial = new THREE.LineBasicMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0.5,
  });
  const qubeGrid = new THREE.LineSegments(qubeGridGeometry, qubeGridMaterial);

  // Create the main geometry
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colorAttributes, 3)
  );

  qube = new THREE.Group();
  qube.add(new THREE.LineSegments(geometry, material));
  qube.add(hausGrid);
  qube.add(qubeGrid);
  scene.add(qube);
}

function createCube(
  x,
  y,
  z,
  size,
  vertices,
  colorAttributes,
  isHaus = false,
  isQube = false
) {
  const halfSize = size / 2;
  const corners = [
    [-halfSize, -halfSize, -halfSize],
    [halfSize, -halfSize, -halfSize],
    [halfSize, halfSize, -halfSize],
    [-halfSize, halfSize, -halfSize],
    [-halfSize, -halfSize, halfSize],
    [halfSize, -halfSize, halfSize],
    [halfSize, halfSize, halfSize],
    [-halfSize, halfSize, halfSize],
  ];

  // Function to add an edge with appropriate color
  function addEdge(start, end, axisColor) {
    vertices.push(
      x + corners[start][0],
      y + corners[start][1],
      z + corners[start][2],
      x + corners[end][0],
      y + corners[end][1],
      z + corners[end][2]
    );
    colorAttributes.push(...axisColor.toArray(), ...axisColor.toArray());
  }

  // Add edges with colors based on their orientation
  // X-axis edges (red)
  addEdge(0, 1, colors.x);
  addEdge(2, 3, colors.x);
  addEdge(4, 5, colors.x);
  addEdge(6, 7, colors.x);

  // Y-axis edges (green)
  addEdge(0, 3, colors.y);
  addEdge(1, 2, colors.y);
  addEdge(4, 7, colors.y);
  addEdge(5, 6, colors.y);

  // Z-axis edges (blue)
  addEdge(0, 4, colors.z);
  addEdge(1, 5, colors.z);
  addEdge(2, 6, colors.z);
  addEdge(3, 7, colors.z);
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
