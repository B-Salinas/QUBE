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
    2: 0x61dafb   // Light blue
};

// Create a container for the entire structure
const entireStructure = new THREE.Object3D();
scene.add(entireStructure);

// Function to create center planes for a cube
function createCenterPlanes(size, position) {
    // Create plane geometries
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    
    // X plane (YZ plane) - Red
    const xPlaneMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const xPlane = new THREE.Mesh(planeGeometry, xPlaneMaterial);
    xPlane.rotation.y = Math.PI / 2; // Rotate to YZ plane
    xPlane.position.copy(position);
    entireStructure.add(xPlane);

    // Y plane (XZ plane) - Blue
    const yPlaneMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x0000ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const yPlane = new THREE.Mesh(planeGeometry, yPlaneMaterial);
    yPlane.rotation.x = Math.PI / 2; // Rotate to XZ plane
    yPlane.position.copy(position);
    entireStructure.add(yPlane);

    // Z plane (XY plane) - Green
    const zPlaneMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const zPlane = new THREE.Mesh(planeGeometry, zPlaneMaterial);
    zPlane.position.copy(position);
    entireStructure.add(zPlane);
}

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

    // Add center planes only to the main cube
    if (depth === 1) {
        createCenterPlanes(size, position);
    }

    if (depth < MAX_DEPTH) {
        const newSize = size * SCALE_FACTOR;
        const offset = newSize / 2;

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