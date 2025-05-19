import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Setup
const gridSize = 6;
const cubeSize = 0.5;
const innerCubeScale = 0.5;
const spacing = 0.7;
const offset = (gridSize - 1) * spacing / 2;

// Make ALL outer cubes completely transparent and colorless
const planeMaterials = {
    xPlane: new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 }),
    yPlane: new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 }),
    zPlane: new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 })
};

const outerCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const innerCubeGeometry = new THREE.BoxGeometry(cubeSize * innerCubeScale, cubeSize * innerCubeScale, cubeSize * innerCubeScale);

const cubeParent = new THREE.Object3D();
scene.add(cubeParent);

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

            // Outer cube material logic - all transparent and colorless
            let outerMaterial;
            if (x === 0 && y === 0 && z === 0) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.05
                });
            } else if (x === gridSize - 1 && y === gridSize - 1 && z === gridSize - 1) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.05
                });
            } else if (x === 0) {
                outerMaterial = planeMaterials.xPlane;
            } else if (y === 0) {
                outerMaterial = planeMaterials.yPlane;
            } else if (z === 0) {
                outerMaterial = planeMaterials.zPlane;
            } else {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.05
                });
            }

            const outerCube = new THREE.Mesh(outerCubeGeometry, outerMaterial);
            cubeContainer.add(outerCube);

            // Create inner cube with enhanced visibility
            const innerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(1, 1, 1),
                transparent: false,
                shininess: 100,
                emissive: new THREE.Color(0.4, 0.4, 0.4)
            });

            const innerCube = new THREE.Mesh(innerCubeGeometry, innerMaterial);
            cubeContainer.add(innerCube);

            // Calculate distance from center for color effects
            const centerX = (gridSize - 1) / 2;
            const centerY = (gridSize - 1) / 2;
            const centerZ = (gridSize - 1) / 2;
            
            const distanceFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + 
                Math.pow(y - centerY, 2) + 
                Math.pow(z - centerZ, 2)
            ) / (Math.sqrt(3) * gridSize / 2);

            innerCubes.push({
                material: innerMaterial,
                position: {x, y, z},
                mesh: innerCube,
                distanceFromCenter: distanceFromCenter
            });

            cubeParent.add(cubeContainer);
        }
    }
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Animation parameters
const rotationSpeed = 0.003;
const innerRotationSpeed = 0.00055;
const colorSpeed = 0.001;
let colorPhase = 0;

// Adjust these two functions for better synchronization:

function getPulseOffset(distance, phase) {
    const pulseFreq = 0.5;
    const pulseAmplitude = 0.15; // Reduced for tighter synchronization
    const centerEmphasis = Math.pow(1 - distance, 1.5); // Adjusted power for smoother falloff
    const wave = Math.sin(phase * Math.PI * 2 * pulseFreq + distance * Math.PI * 2);
    return wave * pulseAmplitude * centerEmphasis;
}

function animate() {
    requestAnimationFrame(animate);
    
    cubeParent.rotation.y += rotationSpeed;
    cubeParent.rotation.x += rotationSpeed * 0.5;
    
    colorPhase = (colorPhase + colorSpeed * 0.345) % 1;
    
    innerCubes.forEach(cube => {
        const distanceFactor = Math.pow(1 - cube.distanceFromCenter, 1.5);
        const pulseOffset = getPulseOffset(cube.distanceFromCenter, colorPhase);
        // Adjust how distance affects the color phase
        const adjustedPhase = (colorPhase + pulseOffset * (1 - distanceFactor * 0.3)) % 1;
        
        const color = hslToColor(adjustedPhase, 0.9, 0.5);
        
        const emissiveIntensity = 0.6 * Math.pow(1 - cube.distanceFromCenter, 1.5);
        
        cube.material.color = color;
        cube.material.emissive.setRGB(
            color.r * emissiveIntensity,
            color.g * emissiveIntensity,
            color.b * emissiveIntensity
        );
        
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