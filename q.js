import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a 6x6x6 grid of small cubes
const gridSize = 6;
const cubeSize = 0.5; // Size of each individual cube
const spacing = 0.6; // Space between cubes
const offset = (gridSize - 1) * spacing / 2; // Center the grid

// Create materials for each plane
const materials = {
    xPlane: new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 }), // Blue
    yPlane: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 }), // Red
    zPlane: new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 }), // Green
    defaultCube: new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
};

const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

// Create grid of cubes
for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
            let material;
            
            // Determine if cube is on one of the outer planes
            if (x === 0) material = materials.xPlane;
            else if (y === 0) material = materials.yPlane;
            else if (z === 0) material = materials.zPlane;
            else material = materials.defaultCube;

            const cube = new THREE.Mesh(cubeGeometry, material);
            
            // Position each cube
            cube.position.set(
                x * spacing - offset,
                y * spacing - offset,
                z * spacing - offset
            );
            
            scene.add(cube);
        }
    }
}

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Position camera
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

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