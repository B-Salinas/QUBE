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
const MAX_DEPTH = 5;
const BASE_SIZE = 2;
const SCALE_FACTOR = 0.5; // Reduced from 0.5 to prevent overlap at deeper levels

// Color and opacity mapping for each level
const LEVEL_PROPERTIES = {
    1: { color: 0xffffff, opacity: 1.0 },    // White
    2: { color: 0x61dafb, opacity: 0.9 },    // Light blue
    3: { color: 0x41c7c7, opacity: 0.8 },    // Teal
    4: { color: 0x2288aa, opacity: 0.7 },    // Darker blue
    5: { color: 0x145566, opacity: 0.6 },    // Deep blue
    6: { color: 0x0a2233, opacity: 0.5 }     // Very deep blue
};

// Create a container for the entire structure
const entireStructure = new THREE.Object3D();
scene.add(entireStructure);

// Keep track of cube count
let cubeCount = 0;

function createCornerCube(depth, size, position) {
    if (depth > MAX_DEPTH) return;

    // Create cube
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: LEVEL_PROPERTIES[depth].color,
        wireframe: true,
        transparent: true,
        opacity: LEVEL_PROPERTIES[depth].opacity
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    entireStructure.add(cube);
    cubeCount++;

    if (depth < MAX_DEPTH) {
        const newSize = size * SCALE_FACTOR;
        const offset = size / 2;

        const corners = [
            new THREE.Vector3(-offset, -offset, -offset),
            new THREE.Vector3(-offset, -offset, offset),
            new THREE.Vector3(-offset, offset, -offset),
            new THREE.Vector3(-offset, offset, offset),
            new THREE.Vector3(offset, -offset, -offset),
            new THREE.Vector3(offset, -offset, offset),
            new THREE.Vector3(offset, offset, -offset),
            new THREE.Vector3(offset, offset, offset)
        ];

        corners.forEach(corner => {
            const newPosition = position.clone().add(corner);
            createCornerCube(depth + 1, newSize, newPosition);
        });
    }
}

// Create the initial structure
createCornerCube(1, BASE_SIZE, new THREE.Vector3(0, 0, 0));
console.log(`Total cubes created: ${cubeCount}`);

// Set up camera
camera.position.set(6, 6, 6); // Moved back slightly for better view
camera.lookAt(0, 0, 0);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;

// Animation parameters
const rotationSpeed = 0.001; // Reduced speed due to complexity

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