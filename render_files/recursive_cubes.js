import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

let scene, camera, renderer, controls;
let cubes = [];

const params = {
  recursionDepth: 2,
  cubeSize: 1,
  rotationSpeed: 0.01,
  wireframe: false,
  color: 0x00ffcc
};

function createRecursiveCubes(depth, size, position, parent = null) {
  if (depth === 0) return;
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshPhongMaterial({ color: params.color, wireframe: params.wireframe });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  if (parent) parent.add(cube);
  else scene.add(cube);
  cubes.push(cube);

  // Recursively add smaller cubes at each corner
  const offset = size * 0.5;
  const newSize = size * 0.5;
  for (let x of [-1, 1]) {
    for (let y of [-1, 1]) {
      for (let z of [-1, 1]) {
        const newPos = new THREE.Vector3(
          position.x + x * offset,
          position.y + y * offset,
          position.z + z * offset
        );
        createRecursiveCubes(depth - 1, newSize, newPos, cube);
      }
    }
  }
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  cubes.forEach(cube => {
    cube.rotation.x += params.rotationSpeed;
    cube.rotation.y += params.rotationSpeed;
  });
  renderer.render(scene, camera);
}

// GUI
const gui = new GUI();
gui.add(params, 'recursionDepth', 1, 4, 1).onChange(() => {
  cubes.forEach(cube => scene.remove(cube));
  cubes = [];
  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));
});
gui.add(params, 'cubeSize', 0.1, 2).onChange(() => {
  cubes.forEach(cube => scene.remove(cube));
  cubes = [];
  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));
});
gui.add(params, 'rotationSpeed', 0, 0.1);
gui.add(params, 'wireframe').onChange(() => {
  cubes.forEach(cube => scene.remove(cube));
  cubes = [];
  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));
});
gui.addColor(params, 'color').onChange(() => {
  cubes.forEach(cube => scene.remove(cube));
  cubes = [];
  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));
});

init();
animate(); 