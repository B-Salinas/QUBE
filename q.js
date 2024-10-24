import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Black background
document.body.appendChild(renderer.domElement);

// Setup
const gridSize = 6;
const cubeSize = 0.5;
const spacing = 0.6;
const offset = (gridSize - 1) * spacing / 2;

// Create materials for planes
const planeMaterials = {
    xPlane: new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 }),
    yPlane: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 }),
    zPlane: new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 })
};

const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

// Create parent object to hold all cubes
const cubeParent = new THREE.Object3D();
scene.add(cubeParent);

// Create grid of cubes
for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
            let material;
            
            // Color based on position
            if (x === 0) {
                material = planeMaterials.xPlane;
            } else if (y === 0) {
                material = planeMaterials.yPlane;
            } else if (z === 0) {
                material = planeMaterials.zPlane;
            } else {
                // Enhanced color calculation
                const color = new THREE.Color(
                    0.5 + (x / gridSize) * 0.5,  // Red component - starts at 0.5
                    0.5 + (y / gridSize) * 0.5,  // Green component - starts at 0.5
                    0.5 + (z / gridSize) * 0.5   // Blue component - starts at 0.5
                );
                material = new THREE.MeshPhongMaterial({
                    color: color,
                    shininess: 70,    // Increased shininess
                    transparent: true,
                    opacity: 0.9      // Increased opacity
                });
            }

            const cube = new THREE.Mesh(cubeGeometry, material);
            cube.position.set(
                x * spacing - offset,
                y * spacing - offset,
                z * spacing - offset
            );
            cubeParent.add(cube);
        }
    }
}

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);  // Increased ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);  // Increased directional light
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Position camera
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Animation
const rotationSpeed = 0.005;

function animate() {
    requestAnimationFrame(animate);
    
    cubeParent.rotation.y += rotationSpeed;
    cubeParent.rotation.x += rotationSpeed * 0.5;
    
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