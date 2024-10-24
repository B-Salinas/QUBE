import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Setup
const gridSize = 3; // Changed to 3x3x3
const cubeSize = 0.8; // Increased size for better visibility
const innerCubeScale = 0.4; // Scale factor for inner cubes
const spacing = 1.2; // Increased spacing
const offset = (gridSize - 1) * spacing / 2;

// Create materials for planes
const planeMaterials = {
    xPlane: new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 }),
    yPlane: new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 }),
    zPlane: new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 })
};

// Create geometries
const outerCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const innerCubeGeometry = new THREE.BoxGeometry(cubeSize * innerCubeScale, cubeSize * innerCubeScale, cubeSize * innerCubeScale);

// Create parent object to hold all cubes
const cubeParent = new THREE.Object3D();
scene.add(cubeParent);

// Function to create color based on position
function getColorFromPosition(nx, ny, nz) {
    return new THREE.Color(
        Math.pow((nx + 1) / 2, 2),
        Math.pow((ny + 1) / 2, 2),
        Math.pow((nz + 1) / 2, 2)
    );
}

// Create grid of cubes with nested cubes
for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
            // Normalize coordinates to [-1, 1] range
            const nx = (x / (gridSize - 1)) * 2 - 1;
            const ny = (y / (gridSize - 1)) * 2 - 1;
            const nz = (z / (gridSize - 1)) * 2 - 1;

            // Create outer cube
            let outerMaterial;
            if (x === 0 && y === 0 && z === 0) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.9
                });
            } else if (x === gridSize - 1 && y === gridSize - 1 && z === gridSize - 1) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9
                });
            } else if (x === 0) {
                outerMaterial = planeMaterials.xPlane;
            } else if (y === 0) {
                outerMaterial = planeMaterials.yPlane;
            } else if (z === 0) {
                outerMaterial = planeMaterials.zPlane;
            } else {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: getColorFromPosition(nx, ny, nz),
                    transparent: true,
                    opacity: 0.6 // More transparent outer cubes
                });
            }

            const outerCube = new THREE.Mesh(outerCubeGeometry, outerMaterial);
            outerCube.position.set(
                x * spacing - offset,
                y * spacing - offset,
                z * spacing - offset
            );

            // Create inner cube with inverted colors
            const innerMaterial = new THREE.MeshPhongMaterial({
                color: getColorFromPosition(-nx, -ny, -nz), // Inverted color
                transparent: true,
                opacity: 0.9,
                shininess: 100
            });

            const innerCube = new THREE.Mesh(innerCubeGeometry, innerMaterial);
            outerCube.add(innerCube); // Add inner cube as child of outer cube

            // Create container for rotation animation
            const containerGroup = new THREE.Group();
            containerGroup.add(outerCube);
            cubeParent.add(containerGroup);
        }
    }
}

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Position camera
camera.position.set(6, 6, 6); // Moved camera back slightly
camera.lookAt(0, 0, 0);

// Animation
const rotationSpeed = 0.005;

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the entire structure
    cubeParent.rotation.y += rotationSpeed;
    cubeParent.rotation.x += rotationSpeed * 0.5;
    
    // Rotate inner cubes independently
    cubeParent.children.forEach(container => {
        if (container.children[0]) {
            const innerCube = container.children[0].children[0];
            if (innerCube) {
                innerCube.rotation.x += rotationSpeed * 2;
                innerCube.rotation.y -= rotationSpeed * 3;
            }
        }
    });
    
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