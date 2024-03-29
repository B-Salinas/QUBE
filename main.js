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

const AXIS_SIZE = 0.1;
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

// const _outer_cube = {
//   geometry: {
//     width: 5,
//     height: 5,
//     depth: 5,
//   },
//   material: {
//     color: 0xfdfefe, // white
//     // color: 0x00bfff, // electric blue
//     wireframe: true,
//   },
//   // I want to point to other objects and we just make everything from here - but how nested and what about run time?
// };

// OUTER CUBE
let outer_cube = {
  geometry: {
    width: 9.75,
    height: 9.75,
    depth: 9.75,
  },
  material: {
    color: 0xfdfefe, // white
    // color: 0x00bfff, // electric blue
    wireframe: true,
  },
};

const OUTER_CUBE_GEOMETRY = new THREE.BoxGeometry(
  outer_cube?.geometry?.width,
  outer_cube?.geometry?.height,
  outer_cube?.geometry?.depth
);
const OUTER_CUBE_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_cube?.material?.color,
  wireframe: outer_cube?.material?.wireframe,
});

//

// TETRAHEDRONS
// Creating the connections to the other corners of the outer cube
let outer_tetra = {
  geometry: {
    radius: {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    },
    detail: 0,
  },
  material: {
    color: {
      a: 0x00bfff, // blue
      b: 0xe74c3c, // red
      c: 0x2ecc71, // green
      d: 0xf4d03f, // yellow
    },
    wireframe: true,
  },
};

const OUTER_TETRA_A_GEOMETRY = new THREE.TetrahedronGeometry(
  outer_tetra?.geometry?.radius?.a,
  outer_tetra?.geometry?.detail
);
const OUTER_TETRA_B_GEOMETRY = new THREE.TetrahedronGeometry(
  outer_tetra?.geometry?.radius?.b,
  outer_tetra?.geometry?.detail
);
const OUTER_TETRA_C_GEOMETRY = new THREE.TetrahedronGeometry(
  outer_tetra?.geometry?.radius?.c,
  outer_tetra?.geometry?.detail
);
const OUTER_TETRA_D_GEOMETRY = new THREE.TetrahedronGeometry(
  outer_tetra?.geometry?.radius?.d,
  outer_tetra?.geometry?.detail
);

const OUTER_TETRA_A_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_tetra?.material?.color?.a,
  wireframe: outer_tetra?.material?.wireframe,
});
const OUTER_TETRA_B_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_tetra?.material?.color?.b,
  wireframe: outer_tetra?.material?.wireframe,
});
const OUTER_TETRA_C_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_tetra?.material?.color?.c,
  wireframe: outer_tetra?.material?.wireframe,
});
const OUTER_TETRA_D_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_tetra?.material?.color?.d,
  wireframe: outer_tetra?.material?.wireframe,
});

//

// TORUS
let outer_torus = {
  geometry: {
    radius: 3.75, // default 1, expects FLOAT
    tube: 0.9, //default 0.4, expects FLOAT
    radicalSeg: 12, // default 12, expects INTEGER
    tubiularSeg: 75, // defaults 49, expects INTEGER
    arc: Math.PI * 2, // default Math.PI * 2, expects FLOAT
  },
  material: {
    color: 0xfdfefe, // white
    // color: 0x00bfff, // blue
    wireframe: true,
  },
};

const OUTER_TORUS_GEOMETRY = new THREE.TorusGeometry(
  outer_torus?.geometry?.radius,
  outer_torus?.geometry?.tube,
  outer_torus?.geometry?.radicalSeg,
  outer_torus?.geometry?.tubiularSeg,
  outer_torus?.geometry?.arc
);
const OUTER_TORUS_MATERIAL = new THREE.MeshBasicMaterial({
  color: outer_torus?.material?.color,
  wireframe: outer_torus?.material?.wireframe,
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
    // color: 0x00bfff, // blue
    wireframe: true,
  },
};

const INNER_CUBE_GEOMETRY = new THREE.BoxGeometry(
  inner_cube?.geometry?.width,
  inner_cube?.geometry?.height,
  inner_cube?.geometry?.depth
);
const INNER_CUBE_MATERIAL = new THREE.MeshBasicMaterial({
  color: inner_cube?.material?.color,
  wireframe: inner_cube?.material?.wireframe,
});

//

// TORUS
let inner_torus = {
  geometry: {
    radius: 1, // default 1, expects FLOAT
    tube: 0.4, //default 0.4, expects FLOAT
    radicalSeg: 12, // default 12, expects INTEGER
    tubiularSeg: 49, // defaults 49, expects INTEGER
    arc: Math.PI * 2, // default Math.PI * 2, expects FLOAT
  },
  material: {
    color: 0xfdfefe, // white
    // color: 0x00bfff, // blue
    wireframe: true,
  },
};

const INNER_TORUS_GEOMETRY = new THREE.TorusGeometry(
  inner_torus?.geometry?.radius,
  inner_torus?.geometry?.tube,
  inner_torus?.geometry?.radicalSeg,
  inner_torus?.geometry?.tubiularSeg,
  inner_torus?.geometry?.arc
);
const INNER_TORUS_MATERIAL = new THREE.MeshBasicMaterial({
  color: inner_torus?.material?.color,
  wireframe: inner_torus?.material?.wireframe,
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
    color: 0x00bfff, // blue
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

// outer
const OUTER_CUBE = new THREE.Mesh(OUTER_CUBE_GEOMETRY, OUTER_CUBE_MATERIAL);
const OUTER_TETRA_A = new THREE.Mesh(
  OUTER_TETRA_A_GEOMETRY,
  OUTER_TETRA_A_MATERIAL
);
const OUTER_TETRA_B = new THREE.Mesh(
  OUTER_TETRA_B_GEOMETRY,
  OUTER_TETRA_B_MATERIAL
);
const OUTER_TETRA_C = new THREE.Mesh(
  OUTER_TETRA_C_GEOMETRY,
  OUTER_TETRA_C_MATERIAL
);
const OUTER_TETRA_D = new THREE.Mesh(
  OUTER_TETRA_D_GEOMETRY,
  OUTER_TETRA_D_MATERIAL
);
const OUTER_TORUS = new THREE.Mesh(OUTER_TORUS_GEOMETRY, OUTER_TORUS_MATERIAL);

// inner
const INNER_CUBE = new THREE.Mesh(INNER_CUBE_GEOMETRY, INNER_CUBE_MATERIAL);
const INNER_TORUS = new THREE.Mesh(INNER_TORUS_GEOMETRY, INNER_TORUS_MATERIAL);

// center
const SPHERE = new THREE.Mesh(SPHERE_GEOMETRY, SPHERE_MATERIAL);

// .
// .
// .
// .
// .

// S C E N E

scene.add(axes);

// outer
scene.add(OUTER_CUBE);
scene.add(OUTER_TETRA_A);
scene.add(OUTER_TETRA_B);
scene.add(OUTER_TETRA_C);
scene.add(OUTER_TETRA_D);
scene.add(OUTER_TORUS);

// inner
scene.add(INNER_CUBE);
scene.add(INNER_TORUS);

// center
scene.add(SPHERE);

// .
// .
// .
// .
// .

// C A M E R A   C O N T R O L S

camera.position.set(1, 5, 9);

controls.autoRotate = true;

// .r
// .
// .
// .
// .

// A N I M A T E

function animate() {
  requestAnimationFrame(animate);

  OUTER_CUBE.rotation.x += 0.001;
  OUTER_CUBE.rotation.y += 0.001;
  OUTER_CUBE.rotation.z += 0.001;

  OUTER_TETRA_A.rotation.x += 0.0005;
  OUTER_TETRA_A.rotation.y += 0.0005;
  OUTER_TETRA_A.rotation.z += 0.0005;

  OUTER_TETRA_B.rotation.x += 0.0006;
  OUTER_TETRA_B.rotation.y += 0.0006;
  OUTER_TETRA_B.rotation.z += 0.0006;

  OUTER_TETRA_C.rotation.x += 0.0007;
  OUTER_TETRA_C.rotation.y += 0.0007;
  OUTER_TETRA_C.rotation.z += 0.0007;

  OUTER_TETRA_D.rotation.x += 0.0008;
  OUTER_TETRA_D.rotation.y += 0.0008;
  OUTER_TETRA_D.rotation.z += 0.0008;

  OUTER_TORUS.rotation.x += 0.003;
  OUTER_TORUS.rotation.y += 0.003;
  OUTER_TORUS.rotation.z += 0.003;

  INNER_CUBE.rotation.x += 0.005;
  INNER_CUBE.rotation.y += 0.005;
  INNER_CUBE.rotation.z += 0.005;

  INNER_TORUS.rotation.x += 0.007;
  INNER_TORUS.rotation.y += 0.007;
  INNER_TORUS.rotation.z += 0.007;

  SPHERE.rotation.x += 0.009;
  SPHERE.rotation.y += 0.009;
  SPHERE.rotation.z += 0.009;

  controls.update();

  renderer.render(scene, camera);
}

animate();

// .
// .
// .
// .
// .
//
