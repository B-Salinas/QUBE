import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Constants
const MAX_DEPTH = 4;
const BASE_SIZE = 2;
// For inner subdivision, we'll divide by 2 each time
const SCALE_FACTOR = 0.5;

// Color mapping for each level
const LEVEL_COLORS = {
    1: 0xffffff,  // White
    2: 0x61dafb,  // Light blue
    3: 0x41c7c7,  // Teal
    4: 0x2288aa   // Darker blue
};

// Create a container for the entire structure
const entireStructure = new THREE.Object3D();
scene.add(entireStructure);

// Keep track of cube count
let cubeCount = 0;

function createSubdividedCube(depth, size, position) {
    if (depth > MAX_DEPTH) return;

    // Create cube
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: LEVEL_COLORS[depth],
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    entireStructure.add(cube);
    cubeCount++;

    if (depth < MAX_DEPTH) {
        const newSize = size * SCALE_FACTOR;
        const offset = newSize / 2; // Offset is half the new size for internal subdivision

        // Define the 8 octants within the current cube
        const octants = [
            new THREE.Vector3(-offset, -offset, -offset),
            new THREE.Vector3(-offset, -offset, offset),
            new THREE.Vector3(-offset, offset, -offset),
            new THREE.Vector3(-offset, offset, offset),
            new THREE.Vector3(offset, -offset, -offset),
            new THREE.Vector3(offset, -offset, offset),
            new THREE.Vector3(offset, offset, -offset),
            new THREE.Vector3(offset, offset, offset)
        ];

        octants.forEach(octant => {
            const newPosition = position.clone().add(octant);
            createSubdividedCube(depth + 1, newSize, newPosition);
        });
    }
}

// Create the initial structure
createSubdividedCube(1, BASE_SIZE, new THREE.Vector3(0, 0, 0));
console.log(`Total cubes created: ${cubeCount}`);

// Set up camera
camera.position.set(4, 4, 4);
camera.lookAt(0, 0, 0);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;

// Animation parameters
const rotationSpeed = 0.002;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the entire structure
    entireStructure.rotation.y += rotationSpeed;
    entireStructure.rotation.x += rotationSpeed * 0.5;
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();