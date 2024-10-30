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
const MAX_DEPTH = 3;  // We can go deeper since we're scaling by golden ratio
const BASE_SIZE = 2;
const PHI = 1.618033988749895;  // Golden ratio
const SCALE_FACTOR = 1 / PHI;  // Inverse of golden ratio for scaling down

// Color mapping for visual depth
const LEVEL_COLORS = {
    1: 0x00ffff,  // Cyan
    2: 0x0088ff,  // Light blue
    3: 0xff00ff,  // Magenta
    4: 0xff8800,  // Orange
    5: 0xff0000   // Red
};

// Create a container for the entire structure
const entireStructure = new THREE.Object3D();
scene.add(entireStructure);

// Track the golden spiral path
const spiralPoints = [];

function createGoldenCube(depth, size, position, isSpiral = true) {
    if (depth > MAX_DEPTH) return;

    // Create cube
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: LEVEL_COLORS[depth],
        wireframe: true,
        transparent: true,
        opacity: isSpiral ? 0.8 : 0.3  // More visible if on spiral path
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    entireStructure.add(cube);

    if (isSpiral) {
        spiralPoints.push(position.clone());
    }

    if (depth < MAX_DEPTH) {
        const newSize = size * SCALE_FACTOR;
        
        // Calculate next position based on golden ratio
        // We'll follow a specific path through the octants
        const offset = size * SCALE_FACTOR / 2;
        
        // Choose next spiral position based on depth
        let nextSpiralPos;
        switch (depth % 3) {
            case 0:
                nextSpiralPos = new THREE.Vector3(offset, -offset, -offset);
                break;
            case 1:
                nextSpiralPos = new THREE.Vector3(-offset, offset, -offset);
                break;
            case 2:
                nextSpiralPos = new THREE.Vector3(-offset, -offset, offset);
                break;
        }

        // Create the next cube in the golden spiral
        const newSpiralPosition = position.clone().add(nextSpiralPos);
        createGoldenCube(depth + 1, newSize, newSpiralPosition, true);

        // Create additional cubes in other octants (non-spiral path)
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
            if (!octant.equals(nextSpiralPos)) {
                const newPosition = position.clone().add(octant);
                createGoldenCube(depth + 1, newSize, newPosition, false);
            }
        });
    }
}

// Create the initial structure
createGoldenCube(1, BASE_SIZE, new THREE.Vector3(0, 0, 0));

// Set up camera
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;

// Animation parameters
const rotationSpeed = 0.001;  // Slower rotation to observe the structure

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Gentle rotation
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