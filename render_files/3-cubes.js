import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Black background
document.body.appendChild(renderer.domElement);

// Add Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.1;
controls.zoomSpeed = 1.2;

// Golden ratio constants
const PHI = 1.618033988749895;
const DEPTH = 29; // Number of nested cubes

// Create sets of nested cubes with different colors
const createNestedCubes = (color) => {
    const cubes = [];
    let size = 1;
    
    for (let i = 0; i < DEPTH; i++) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: color });
        const cube = new THREE.LineSegments(edges, material);
        cubes.push(cube);
        size /= PHI; // Each inner cube is scaled down by 1/φ
    }
    
    // Group the nested cubes together
    const group = new THREE.Group();
    cubes.forEach(cube => group.add(cube));
    return group;
};

// Create three sets of nested cubes
const cubeGroups = [
    createNestedCubes(0xff0000), // Red cubes
    createNestedCubes(0x00ff00), // Green cubes
    createNestedCubes(0x0000ff)  // Blue cubes
];

cubeGroups.forEach(group => scene.add(group));

camera.position.z = 1.5;

// Animation variables with different speeds for each group
const baseRotationSpeed = 0.9;
const speedMultipliers = [0.1, 1.01, 1.125];
const delayOffset = Math.PI / 8;

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);
    controls.update();

    // Rotate each group of nested cubes
    cubeGroups.forEach((group, index) => {
        const timeOffset = time * 0.001 - (index * delayOffset);
        const currentSpeed = baseRotationSpeed * speedMultipliers[index];
        
        // Rotate the entire group
        group.rotation.x = timeOffset * currentSpeed;
        group.rotation.y = timeOffset * currentSpeed;
        
        // Add subtle counter-rotation to inner cubes for extra effect
        group.children.forEach((cube, depth) => {
            cube.rotation.x = -timeOffset * currentSpeed * 0.1 * (depth + 1);
            cube.rotation.z = timeOffset * currentSpeed * 0.1 * (depth + 1);
        });
    });

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(0);