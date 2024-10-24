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
const SCALE_FACTOR = 0.5;

// Color mapping for each level
const LEVEL_COLORS = {
    1: 0xffffff,  // White
    2: 0xff0000,  // Red
    3: 0x0000ff,  // Blue
    4: 0x00ff00   // Green
};

// Create a container for the entire structure
const entireStructure = new THREE.Object3D();
scene.add(entireStructure);

function createCornerCube(depth, size, position) {
    if (depth > MAX_DEPTH) return;

    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: LEVEL_COLORS[depth],
        wireframe: true
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    entireStructure.add(cube);

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

// Set up camera
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation parameters
const rotationSpeed = 0.005;

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