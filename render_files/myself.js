import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create GUI instance
const gui = new GUI();

// Parameters for cube generation
const params = {
  recursionDepth: 1,
  cubeSize: 1,
  rotationSpeed: 0.01,
  wireframe: false
};

// Create materials
const material = new THREE.MeshPhongMaterial({ 
  color: 0x00ff00,
  wireframe: params.wireframe
});

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Store all cubes
let cubes = [];

// Function to create recursive cubes
function createRecursiveCubes(depth, size, position) {
  if (depth <= 0) return;

  const geometry = new THREE.BoxGeometry(size, size, size);
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  scene.add(cube);
  cubes.push(cube);

  // Create smaller cubes at corners
  const offset = size / 2;
  const newSize = size / 2;
  
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const newPos = new THREE.Vector3(
          position.x + x * offset,
          position.y + y * offset,
          position.z + z * offset
        );
        createRecursiveCubes(depth - 1, newSize, newPos);
      }
    }
  }
}

// GUI controls
gui.add(params, 'recursionDepth', 1, 3, 1).onChange(() => {
  // Remove existing cubes
  cubes.forEach(cube => scene.remove(cube));
  cubes = [];
  // Create new cubes with updated depth
  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));
});

gui.add(params, 'cubeSize', 0.1, 2).onChange(() => {
  cubes.forEach(cube => scene.remove(cube));
  cubes = [];
  createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));
});

gui.add(params, 'rotationSpeed', 0, 0.1);
gui.add(params, 'wireframe').onChange(() => {
  material.wireframe = params.wireframe;
});

// Initial cube creation
createRecursiveCubes(params.recursionDepth, params.cubeSize, new THREE.Vector3(0, 0, 0));

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate all cubes
  cubes.forEach(cube => {
    cube.rotation.x += params.rotationSpeed;
    cube.rotation.y += params.rotationSpeed;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
