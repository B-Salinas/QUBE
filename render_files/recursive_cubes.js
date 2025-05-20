import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

let scene, camera, renderer, controls;
let cubes = [];
let axesHelper = null;

const params = {
  recursionDepth: 2,
  cubeSize: 1,
  rotationSpeed: 0.01,
  wireframe: false,
  color: 0x00ffcc,
  recursionMode: 'vertices', // 'vertices' or 'contained'
  showAxes: true,
  axesBound: 'largest', // 'largest' or 'smallest'
  axesStatic: true // true = static, false = rotates with cube
};

function getSmallestCubeSize(depth, size) {
  let s = size;
  for (let i = 1; i < depth; i++) s *= 0.5;
  return s;
}

function getSmallestCube(depth, size, position, parent = null) {
  if (depth === 1) {
    // Return the last created cube at this recursion
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({ color: params.color, wireframe: params.wireframe });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    return cube;
  }
  // Only one child in 'contained' mode, 8 in 'vertices' mode
  const newSize = size * 0.5;
  if (params.recursionMode === 'vertices') {
    // Return the first smallest cube found (arbitrary)
    const offset = size * 0.5;
    return getSmallestCube(depth - 1, newSize, new THREE.Vector3(position.x + offset, position.y + offset, position.z + offset));
  } else {
    return getSmallestCube(depth - 1, newSize, position);
  }
}

function getLargestCube() {
  // The first cube in cubes[] is always the largest
  return cubes.length > 0 ? cubes[0] : null;
}

function getSmallestCubeRef() {
  // The last cube in cubes[] is always the smallest (due to push order)
  return cubes.length > 0 ? cubes[cubes.length - 1] : null;
}

function updateAxesHelper() {
  if (axesHelper) {
    if (axesHelper.parent) axesHelper.parent.remove(axesHelper);
    scene.remove(axesHelper);
  }
  if (!params.showAxes) return;
  let scale = 1;
  if (params.axesBound === 'largest') {
    scale = params.cubeSize;
  } else if (params.axesBound === 'smallest') {
    scale = getSmallestCubeSize(params.recursionDepth, params.cubeSize);
  }
  axesHelper = new THREE.AxesHelper(scale);
  if (params.axesStatic) {
    axesHelper.position.set(0, 0, 0);
    scene.add(axesHelper);
  } else {
    // Attach to the correct cube
    let targetCube = null;
    if (params.axesBound === 'largest') {
      targetCube = getLargestCube();
    } else {
      targetCube = getSmallestCubeRef();
    }
    if (targetCube) {
      targetCube.add(axesHelper);
      axesHelper.position.set(0, 0, 0);
    } else {
      scene.add(axesHelper);
    }
  }
}

function createRecursiveCubes(depth, size, position, parent = null) {
  if (depth === 0) return;
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshPhongMaterial({ color: params.color, wireframe: params.wireframe });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  if (parent) parent.add(cube);
  else scene.add(cube);
  cubes.push(cube);

  const newSize = size * 0.5;
  if (params.recursionMode === 'vertices') {
    // Recursively add smaller cubes at each corner
    const offset = size * 0.5;
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
  } else if (params.recursionMode === 'contained') {
    // Recursively add a single smaller cube at the center
    createRecursiveCubes(depth - 1, newSize, position, cube);
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
  updateAxesHelper();

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
gui.add(params, 'recursionDepth', 1, 4, 1).onChange(updateCubes);
gui.add(params, 'cubeSize', 0.1, 2).onChange(updateCubes);
gui.add(params, 'rotationSpeed', 0, 0.1);
gui.add(params, 'wireframe').onChange(updateCubes);
gui.addColor(params, 'color').onChange(updateCubes);
gui.add(params, 'recursionMode', ['vertices', 'contained']).onChange(updateCubes);
gui.add(params, 'showAxes').onChange(updateAxesHelper);
gui.add(params, 'axesBound', ['largest', 'smallest']).onChange(updateAxesHelper);
gui.add(params, 'axesStatic').onChange(updateAxesHelper);

function updateCubes() {
  cubes.forEach(cube => scene.remove(cube));
  cubes = [];
  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));
  updateAxesHelper();
}

init();
animate(); 