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
const outerSize = 1;
const innerSize = 0.6; // Adjust this value to change the size of the inner cube

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

const outerVertices = createVertices(outerSize);
const innerVertices = createVertices(innerSize);
const vertices = [...outerVertices, ...innerVertices];

function createGridEdges(startIndex, endIndex, divisions = 4) {
  const gridEdges = [];

  function addGridToFace(v1, v2, v3, v4) {
    for (let i = 1; i < divisions; i++) {
      const t = i / divisions;
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

  // Add grid to each face of the cube
  addGridToFace(startIndex, startIndex + 1, startIndex + 2, startIndex + 3);
  addGridToFace(startIndex + 4, startIndex + 5, startIndex + 6, startIndex + 7);
  addGridToFace(startIndex, startIndex + 1, startIndex + 5, startIndex + 4);
  addGridToFace(startIndex + 2, startIndex + 3, startIndex + 7, startIndex + 6);
  addGridToFace(startIndex, startIndex + 3, startIndex + 7, startIndex + 4);
  addGridToFace(startIndex + 1, startIndex + 2, startIndex + 6, startIndex + 5);

  return gridEdges;
}

function interpolateVertex(v1, v2, t) {
  return [
    vertices[v1][0] + (vertices[v2][0] - vertices[v1][0]) * t,
    vertices[v1][1] + (vertices[v2][1] - vertices[v1][1]) * t,
    vertices[v1][2] + (vertices[v2][2] - vertices[v1][2]) * t,
    vertices[v1][3] + (vertices[v2][3] - vertices[v1][3]) * t,
  ];
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

const outerGridEdges = createGridEdges(0, 7);
const innerGridEdges = createGridEdges(16, 23); // Note the change in start index

const cubeGeometry = new THREE.BufferGeometry();
const outerGridGeometry = new THREE.BufferGeometry();
const innerGridGeometry = new THREE.BufferGeometry();
const cubeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const outerGridMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Green for outer grid
const innerGridMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Blue for inner grid

function project4Dto3D(point, w = 2) {
  const scale = 1 / (w - point[3]);
  return new THREE.Vector3(
    point[0] * scale,
    point[1] * scale,
    point[2] * scale
  );
}

function updateTesseract(time) {
  try {
    const allVertices = [
      ...vertices,
      ...outerGridEdges.flat(),
      ...innerGridEdges.flat(),
    ];
    const rotatedVertices = allVertices.map((v) => {
      if (!Array.isArray(v) || v.length !== 4) {
        throw new Error("Invalid vertex format");
      }
      let [x, y, z, w] = v;
      const t = time * 0.001;
      const newX = x * Math.cos(t) - w * Math.sin(t);
      const newW = x * Math.sin(t) + w * Math.cos(t);
      return project4Dto3D([newX, y, z, newW]);
    });

    const cubePositions = [];
    edges.forEach((edge) => {
      cubePositions.push(
        rotatedVertices[edge[0]].x,
        rotatedVertices[edge[0]].y,
        rotatedVertices[edge[0]].z
      );
      cubePositions.push(
        rotatedVertices[edge[1]].x,
        rotatedVertices[edge[1]].y,
        rotatedVertices[edge[1]].z
      );
    });

    const outerGridPositions = [];
    const innerGridPositions = [];
    const baseIndex = vertices.length;

    outerGridEdges.forEach((edge, i) => {
      const index1 = baseIndex + i * 2;
      const index2 = baseIndex + i * 2 + 1;
      outerGridPositions.push(
        rotatedVertices[index1].x,
        rotatedVertices[index1].y,
        rotatedVertices[index1].z,
        rotatedVertices[index2].x,
        rotatedVertices[index2].y,
        rotatedVertices[index2].z
      );
    });

    innerGridEdges.forEach((edge, i) => {
      const index1 = baseIndex + outerGridEdges.length * 2 + i * 2;
      const index2 = baseIndex + outerGridEdges.length * 2 + i * 2 + 1;
      innerGridPositions.push(
        rotatedVertices[index1].x,
        rotatedVertices[index1].y,
        rotatedVertices[index1].z,
        rotatedVertices[index2].x,
        rotatedVertices[index2].y,
        rotatedVertices[index2].z
      );
    });

    cubeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(cubePositions, 3)
    );
    outerGridGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(outerGridPositions, 3)
    );
    innerGridGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(innerGridPositions, 3)
    );

    cubeGeometry.attributes.position.needsUpdate = true;
    outerGridGeometry.attributes.position.needsUpdate = true;
    innerGridGeometry.attributes.position.needsUpdate = true;
  } catch (error) {
    console.error("Error in updateTesseract:", error);
    showError(
      "An error occurred while updating the tesseract. Check the console for details."
    );
    throw error;
  }
}

const tesseractCube = new THREE.LineSegments(cubeGeometry, cubeMaterial);
const tesseractOuterGrid = new THREE.LineSegments(
  outerGridGeometry,
  outerGridMaterial
);
const tesseractInnerGrid = new THREE.LineSegments(
  innerGridGeometry,
  innerGridMaterial
);
scene.add(tesseractCube);
scene.add(tesseractOuterGrid);
scene.add(tesseractInnerGrid);

camera.position.z = 5;

function showError(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

let frameCount = 0;
const maxFrames = 1000; // Limit to prevent infinite loops

function animate(time) {
  try {
    if (frameCount > maxFrames) {
      showError("Animation stopped: Frame limit reached");
      return;
    }
    frameCount++;
    updateTesseract(time);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  } catch (error) {
    console.error("Animation error:", error);
    showError(
      "Animation stopped due to an error. Check the console for details."
    );
  }
}

animate(0);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
