import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Setup
const gridSize = 3;
const cubeSize = 0.8;
const innerCubeScale = 0.6; // Increased from 0.4
const spacing = 1.2;
const offset = (gridSize - 1) * spacing / 2;

// Create materials for planes
const planeMaterials = {
    xPlane: new THREE.MeshPhongMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 }),
    yPlane: new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 }),
    zPlane: new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 })
};

const outerCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const innerCubeGeometry = new THREE.BoxGeometry(cubeSize * innerCubeScale, cubeSize * innerCubeScale, cubeSize * innerCubeScale);

const cubeParent = new THREE.Object3D();
scene.add(cubeParent);

function getColorFromPosition(nx, ny, nz) {
    return new THREE.Color(
        Math.pow((nx + 1) / 2, 2),
        Math.pow((ny + 1) / 2, 2),
        Math.pow((nz + 1) / 2, 2)
    );
}

// Create grid of cubes
for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
            const nx = (x / (gridSize - 1)) * 2 - 1;
            const ny = (y / (gridSize - 1)) * 2 - 1;
            const nz = (z / (gridSize - 1)) * 2 - 1;

            // Create container group for this position
            const cubeContainer = new THREE.Group();
            cubeContainer.position.set(
                x * spacing - offset,
                y * spacing - offset,
                z * spacing - offset
            );

            // Create outer cube
            let outerMaterial;
            if (x === 0 && y === 0 && z === 0) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.5 // More transparent to show inner cube
                });
            } else if (x === gridSize - 1 && y === gridSize - 1 && z === gridSize - 1) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.5
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
                    opacity: 0.4 // More transparent outer cube
                });
            }

            const outerCube = new THREE.Mesh(outerCubeGeometry, outerMaterial);
            cubeContainer.add(outerCube);

            // Create inner cube with contrasting color
            const innerMaterial = new THREE.MeshPhongMaterial({
                color: getColorFromPosition(-nx, -ny, -nz),
                transparent: false, // Solid inner cube
                shininess: 100
            });

            const innerCube = new THREE.Mesh(innerCubeGeometry, innerMaterial);
            cubeContainer.add(innerCube); // Add to same container as outer cube

            cubeParent.add(cubeContainer);
        }
    }
}

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Position camera
camera.position.set(6, 6, 6);
camera.lookAt(0, 0, 0);

// Animation
const rotationSpeed = 0.005;

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate entire structure
    cubeParent.rotation.y += rotationSpeed;
    cubeParent.rotation.x += rotationSpeed * 0.5;
    
    // Rotate inner cubes
    cubeParent.children.forEach(container => {
        if (container.children[1]) { // Second child is inner cube
            container.children[1].rotation.x += rotationSpeed * 2;
            container.children[1].rotation.y -= rotationSpeed * 3;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();