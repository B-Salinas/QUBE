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
const MAX_DEPTH = 3;  // How deep we go with recursion
const BASE_SIZE = 2;  // Size of initial cube
const SCALE_FACTOR = 0.5;  // Each new cube is 50% size of parent

function createCornerCube(depth, size, position) {
    if (depth > MAX_DEPTH) return;

    // Create wireframe cube
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    scene.add(cube);

    // If we haven't reached max depth, create corner cubes
    if (depth < MAX_DEPTH) {
        const newSize = size * SCALE_FACTOR;
        const offset = size / 2;  // Distance to corners

        // Define the 8 corners
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

        // Create cube at each corner
        corners.forEach(corner => {
            const newPosition = position.clone().add(corner);
            createCornerCube(depth + 1, newSize, newPosition);
        });
    }
}

// Create the initial cube at center
createCornerCube(1, BASE_SIZE, new THREE.Vector3(0, 0, 0));

// Set up camera
camera.position.set(4, 4, 4);
camera.lookAt(0, 0, 0);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
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