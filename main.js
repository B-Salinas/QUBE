// .
// .
// .
// .
// .

// I M P O R T S

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

// .
// .
// .
// .
// .

// V A R I A B L E S

/* are these variables that I can import? 
Should these live somewhere else? 
Be imported (how does that affect runtime?) */

let screen = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let perspective = {
  FOV: 75,
  ASPECT: screen?.width / screen?.height,
  NEAR: 0.1,
  FAR: 1000,
};

const AXIS_SIZE = 4;

// .
// .
// .
// .
// .

// S E T U P

/* I'm not sure how or when to use this */
// const loader = new GLTFLoader();

// primary
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  perspective?.FOV,
  perspective?.ASPECT,
  perspective?.NEAR,
  perspective?.FAR
);
const renderer = new THREE.WebGLRenderer();

// secondary
const controls = new OrbitControls(camera, renderer.domElement);
const axes = new THREE.AxesHelper(AXIS_SIZE);

// main
renderer.setSize(screen?.width, screen?.height);
document.body.appendChild(renderer.domElement);

// .
// .
// .
// .
// .

// G E O M E T R Y   &   M A T E R I A L S

/* AGAIN, are all of these things I can import/export? 
How can I make this easier to read (Big O Notation easier, and user-friendly)? */

// OUTER CUBE
let outer_cube = {
  geometry: {
    width: 5,
    height: 5,
    depth: 5,
  },
  material: {
    color: 0xfdfefe, // white
    // color: 0x00bfff, // electric blue
    wireframe: true,
  },
};

const OUTER_GEOMETRY = new THREE.BoxGeometry(
  outer_cube?.geometry?.width,
  outer_cube?.geometry?.height,
  outer_cube?.geometry?.depth
);
const OUTER_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_cube?.material?.color,
  wireframe: outer_cube?.material?.wireframe,
});

//

// INNER CUBE
let inner_cube = {
  geometry: {
    width: 3,
    height: 3,
    depth: 3,
  },
  material: {
    color: 0xfdfefe, // white
    // color: 0x00bfff, // electric blue
    wireframe: true,
  },
};

const INNER_GEOMETRY = new THREE.BoxGeometry(
  inner_cube?.geometry?.width,
  inner_cube?.geometry?.height,
  inner_cube?.geometry?.depth
);
const INNER_MATERIAL = new THREE.MeshBasicMaterial({
  color: inner_cube?.material?.color,
  wireframe: inner_cube?.material?.wireframe,
});

//

// TORUS
let torus = {
  geometry: {
    radius: 1, // default 1, expects FLOAT
    tube: 0.4, //default 0.4, expects FLOAT
    radicalSeg: 12, // default 12, expects INTEGER
    tubiularSeg: 49, // defaults 49, expects INTEGER
    arc: Math.PI * 2, // default Math.PI * 2, expects FLOAT
  },
  material: {
    color: 0xfdfefe, // white
    // color: 0x00bfff, // electric blue
    wireframe: true,
  },
};

const TORUS_GEOMETRY = new THREE.TorusGeometry(
  torus?.geometry?.radius,
  torus?.geometry?.tube,
  torus?.geometry?.radicalSeg,
  torus?.geometry?.tubiularSeg,
  torus?.geometry?.arc
);
const TORUS_MATERIAL = new THREE.MeshBasicMaterial({
  color: torus?.material?.color,
  wireframe: torus?.material?.wireframe,
});

//

// SPHERE
let sphere = {
  geometry: {
    radius: 1 / Math.PI,
    width: 32, // default 32
    height: 16, // default 16
  },
  material: {
    // color: 0xfdfefe, // white
    color: 0x00bfff, // electric blue
    wireframe: true,
  },
};

const SPHERE_GEOMETRY = new THREE.SphereGeometry(
  sphere?.geometry?.radius,
  sphere?.geometry?.width,
  sphere?.geometry?.height
);
const SPHERE_MATERIAL = new THREE.MeshBasicMaterial({
  color: sphere?.material?.color,
  wireframe: sphere?.material?.wireframe,
});

// .
// .
// .
// .
// .

// G & M   C R E A T I O N

const OUTER_CUBE = new THREE.Mesh(OUTER_GEOMETRY, OUTER_MATERIAL);
const INNER_CUBE = new THREE.Mesh(INNER_GEOMETRY, INNER_MATERIAL);
const TORUS = new THREE.Mesh(TORUS_GEOMETRY, TORUS_MATERIAL);
const SPHERE = new THREE.Mesh(SPHERE_GEOMETRY, SPHERE_MATERIAL);

// .
// .
// .
// .
// .

// S C E N E

scene.add(axes);

scene.add(OUTER_CUBE);
scene.add(INNER_CUBE);

/* commented out for now because I need to focus on "creating" the inner cube using the dimensions of the outer. I also need to start imposing mathematical limits. */
scene.add(TORUS);
scene.add(SPHERE);

// .
// .
// .
// .
// .

// C A M E R A   C O N T R O L S

camera.position.set(1, 4, 9);

controls.autoRotate = true;

// .
// .
// .
// .
// .

// A N I M A T E

function animate() {
  requestAnimationFrame(animate);

  // OUTER_CUBE.rotation.x += 0.007;
  // OUTER_CUBE.rotation.y += 0.007;
  // OUTER_CUBE.rotation.z += 0.007;

  // INNER_CUBE.rotation.x += 0.002;
  // INNER_CUBE.rotation.y += 0.002;
  // INNER_CUBE.rotation.z += 0.002;

  // TORUS.rotation.x += 0.009;
  // TORUS.rotation.y += 0.009;
  // TORUS.rotation.z += 0.009;

  // SPHERE.rotation.x += 0.004;
  // SPHERE.rotation.y += 0.004;
  // SPHERE.rotation.z += 0.004;

  controls.update();

  renderer.render(scene, camera);
}

animate();

// .
// .
// .
// .
// .
