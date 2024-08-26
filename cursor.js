import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { TorusGeometry } from "three/src/geometries/TorusGeometry.js";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";

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

// Define colors for each cube
const cubeColors = [
  0xff0000, // Red
  0x00ff00, // Green
  0x0000ff, // Blue
  0xffff00, // Yellow
  0xff00ff, // Magenta
  0x00ffff, // Cyan
  0xffa500, // Orange
  0x800080, // Purple
  0xffffff, // White (for the outer cube)
];

// Create materials for each cube
const materials = cubeColors.map(
  (color) => new THREE.LineBasicMaterial({ color })
);

// Define edges for all 8 cubes
const edges = [
  // Cube 0 (outer cube)
  [0, 1, 0],
  [1, 2, 0],
  [2, 3, 0],
  [3, 0, 0],
  [4, 5, 0],
  [5, 6, 0],
  [6, 7, 0],
  [7, 4, 0],
  [0, 4, 0],
  [1, 5, 0],
  [2, 6, 0],
  [3, 7, 0],
  // Cube 1
  [0, 1, 1],
  [1, 9, 1],
  [9, 8, 1],
  [8, 0, 1],
  // Cube 2
  [1, 5, 2],
  [5, 13, 2],
  [13, 9, 2],
  [9, 1, 2],
  // Cube 3
  [5, 4, 3],
  [4, 12, 3],
  [12, 13, 3],
  [13, 5, 3],
  // Cube 4
  [4, 0, 4],
  [0, 8, 4],
  [8, 12, 4],
  [12, 4, 4],
  // Cube 5
  [2, 3, 5],
  [3, 11, 5],
  [11, 10, 5],
  [10, 2, 5],
  // Cube 6
  [3, 7, 6],
  [7, 15, 6],
  [15, 11, 6],
  [11, 3, 6],
  // Cube 7
  [7, 6, 7],
  [6, 14, 7],
  [14, 15, 7],
  [15, 7, 7],
  // Cube 8
  [6, 2, 8],
  [2, 10, 8],
  [10, 14, 8],
  [14, 6, 8],
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

// Add this function to create a Möbius strip geometry
function createMobiusStrip(radius, width, thickness, segments) {
  const geometry = new ParametricGeometry(
    (u, v, target) => {
      u *= Math.PI * 2;
      v = v * 2 - 1;

      const t = v * thickness;
      const x =
        (radius + width * Math.cos(u / 2) + t * Math.cos(u / 2) * Math.cos(u)) *
        Math.cos(u);
      const y =
        (radius + width * Math.cos(u / 2) + t * Math.cos(u / 2) * Math.cos(u)) *
        Math.sin(u);
      const z = width * Math.sin(u / 2) + t * Math.cos(u / 2) * Math.sin(u);

      target.set(x, y, z);
    },
    segments,
    segments
  );

  return geometry;
}

// Custom shader material for the Möbius strip
const mobiusMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0xffff00) },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 light = normalize(vec3(sin(time), cos(time), 0.5));
      float dProd = max(0.0, dot(vNormal, light));
      vec3 shade = mix(color * 0.3, color, dProd);
      gl_FragColor = vec4(shade, 1.0);
    }
  `,
  side: THREE.DoubleSide,
});

// Create a Möbius strip
const mobiusRadius = 0.7;
const mobiusWidth = 0.2;
const mobiusThickness = 0.05;
const mobiusSegments = 200;
const mobiusGeometry = createMobiusStrip(
  mobiusRadius,
  mobiusWidth,
  mobiusThickness,
  mobiusSegments
);
const mobiusStrip = new THREE.Mesh(mobiusGeometry, mobiusMaterial);
scene.add(mobiusStrip);

function updateTesseract(time) {
  const t = time * 0.001;
  const rotationMatrix = new THREE.Matrix4()
    .makeRotationY(t * 0.5)
    .multiply(new THREE.Matrix4().makeRotationX(t * 0.3))
    .multiply(new THREE.Matrix4().makeRotationZ(t * 0.2));

  // 4D rotation
  const rotation4D = new THREE.Matrix4()
    .set(
      Math.cos(t),
      0,
      -Math.sin(t),
      0,
      0,
      1,
      0,
      0,
      Math.sin(t),
      0,
      Math.cos(t),
      0,
      0,
      0,
      0,
      1
    )
    .multiply(
      new THREE.Matrix4().set(
        1,
        0,
        0,
        0,
        0,
        Math.cos(t * 0.7),
        0,
        -Math.sin(t * 0.7),
        0,
        0,
        1,
        0,
        0,
        Math.sin(t * 0.7),
        0,
        Math.cos(t * 0.7)
      )
    );

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

  // Update Möbius strip position, rotation, scale, and shader
  const centerPoint = new THREE.Vector3()
    .addVectors(rotatedVertices[0], rotatedVertices[15])
    .multiplyScalar(0.5);
  mobiusStrip.position.copy(centerPoint);
  mobiusStrip.setRotationFromMatrix(rotationMatrix);

  // Scale Möbius strip based on tesseract size
  const scale = rotatedVertices[15].distanceTo(rotatedVertices[0]) / 2;
  mobiusStrip.scale.setScalar(scale);

  // Update shader time uniform
  mobiusMaterial.uniforms.time.value = time * 0.001;
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
