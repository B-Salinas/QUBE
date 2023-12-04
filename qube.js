// IMPORTS
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// WARNINGS

if (!WebGL.isWebGLAvailable()) {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
}

//

// are these variables that I can import?
let screen = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const FOV = 75;
const ASPECT = screen?.width / screen?.height;
const NEAR = 0.1;
const FAR = 1000;

const AXIS_SIZE = 5;

// MAIN COMPONENTS

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
const renderer = new THREE.WebGLRenderer();

const controls = new OrbitControls(camera, renderer.domElement);
// const axes = new THREE.AxesHelper(AXIS_SIZE);

//

renderer.setSize(screen?.width, screen?.height);
document.body.appendChild(renderer.domElement);

//

// AGAIN, are all of these things I can import/export?
// How can I make this easier to read (Big O Notation easier, and user-friendly)?

let outer_cube = {
  width: 1.7,
  height: 1.7,
  depth: 1.7,
  material: {
    color: 0xfdfefe, // white
    wireframe: true,
  },
};

let inner_cube = {
  width: 0.5,
  height: 0.5,
  depth: 0.5,
  material: {
    color: 0xfdfefe, // white
    wireframe: true,
  },
};

// OUTER CUBE
const OUTER_GEOMETRY = new THREE.BoxGeometry(
  outer_cube?.width,
  outer_cube?.height,
  outer_cube?.depth
);
const OUTER_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_cube?.material?.color,
  wireframe: outer_cube?.material?.wireframe,
});

// INNER CUBE
const INNER_GEOMETRY = new THREE.BoxGeometry(
  inner_cube?.width,
  inner_cube?.height,
  inner_cube?.depth
);
const INNER_MATERIAL = new THREE.MeshBasicMaterial({
  color: inner_cube?.material?.color,
  wireframe: inner_cube?.material?.wireframe,
});

const OUTER_CUBE = new THREE.Mesh(OUTER_GEOMETRY, OUTER_MATERIAL);
const INNER_CUBE = new THREE.Mesh(INNER_GEOMETRY, INNER_MATERIAL);

//

// scene.add(axes);

scene.add(OUTER_CUBE);
scene.add(INNER_CUBE);

//

let camera_position = {
  x: 2,
  y: 2,
  z: 2,
};

camera.position.set(camera_position?.x, camera_position?.y, camera_position?.z);

controls.update();
controls.autoRotate = true;

//

function animate() {
  requestAnimationFrame(animate);

  OUTER_CUBE.rotation.x += 0.007;
  OUTER_CUBE.rotation.y += 0.007;
  OUTER_CUBE.rotation.z += 0.007;

  INNER_CUBE.rotation.x += 0.005;
  INNER_CUBE.rotation.y += 0.005;
  INNER_CUBE.rotation.z += 0.005;

  controls.update();

  renderer.render(scene, camera);
}

//

animate();
