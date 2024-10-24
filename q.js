import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup remains the same...
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Setup
const gridSize = 3;
const cubeSize = 0.8;
const innerCubeScale = 0.6;
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

// Store references to inner cube materials and their positions
const innerCubes = [];

function getColorFromPosition(nx, ny, nz) {
    return new THREE.Color(
        Math.pow((nx + 1) / 2, 2),
        Math.pow((ny + 1) / 2, 2),
        Math.pow((nz + 1) / 2, 2)
    );
}

function hslToColor(h, s, l) {
    return new THREE.Color().setHSL(h, s, l);
}

// Create grid of cubes
for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
            const nx = (x / (gridSize - 1)) * 2 - 1;
            const ny = (y / (gridSize - 1)) * 2 - 1;
            const nz = (z / (gridSize - 1)) * 2 - 1;

            const cubeContainer = new THREE.Group();
            cubeContainer.position.set(
                x * spacing - offset,
                y * spacing - offset,
                z * spacing - offset
            );

            // Create outer cube with same material logic...
            let outerMaterial;
            if (x === 0 && y === 0 && z === 0) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.5
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
                    opacity: 0.4
                });
            }

            const outerCube = new THREE.Mesh(outerCubeGeometry, outerMaterial);
            cubeContainer.add(outerCube);

            // Create inner cube
            const innerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(1, 1, 1),
                transparent: false,
                shininess: 100,
                emissive: new THREE.Color(0.2, 0.2, 0.2)
            });

            const innerCube = new THREE.Mesh(innerCubeGeometry, innerMaterial);
            cubeContainer.add(innerCube);

            // Store cube info for color updates
            innerCubes.push({
                material: innerMaterial,
                position: {x, y, z},
                mesh: innerCube
            });

            cubeParent.add(cubeContainer);
        }
    }
}

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

camera.position.set(6, 6, 6);
camera.lookAt(0, 0, 0);

// Animation
const rotationSpeed = 0.005;
const innerRotationSpeed = 0.001; // Slowed down inner rotation
const colorSpeed = 0.003; // Slowed down color cycling
let colorPhase = 0;

// Calculate color offset based on cube position
function getColorOffset(x, y, z) {
    // Create offset based on distance from center
    const centerOffset = Math.sqrt(
        Math.pow(x - (gridSize-1)/2, 2) + 
        Math.pow(y - (gridSize-1)/2, 2) + 
        Math.pow(z - (gridSize-1)/2, 2)
    ) / (gridSize * 1.5);
    
    return centerOffset;
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate entire structure
    cubeParent.rotation.y += rotationSpeed;
    cubeParent.rotation.x += rotationSpeed * 0.5;
    
    // Update color phase
    colorPhase = (colorPhase + colorSpeed) % 1;
    
    // Update inner cubes
    innerCubes.forEach(cube => {
        // Calculate position-based offset
        const offset = getColorOffset(cube.position.x, cube.position.y, cube.position.z);
        
        // Calculate color with offset
        const adjustedPhase = (colorPhase + offset) % 1;
        const color = hslToColor(adjustedPhase, 1, 0.5);
        
        // Apply color
        cube.material.color = color;
        cube.material.emissive.setRGB(color.r * 0.2, color.g * 0.2, color.b * 0.2);
        
        // Rotate inner cube
        cube.mesh.rotation.x += innerRotationSpeed;
        cube.mesh.rotation.y -= innerRotationSpeed * 1.5;
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