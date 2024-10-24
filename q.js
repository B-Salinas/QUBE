import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup remains the same...
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Updated setup for 6x6x6
const gridSize = 6;
const cubeSize = 0.5;  // Smaller cubes for larger grid
const innerCubeScale = 0.6;
const spacing = 0.7;   // Adjusted spacing
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

// Store references to inner cubes
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

            // Outer cube material logic
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

            // Modified inner cube creation within the grid creation loop
            const innerMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(1, 1, 1),
            transparent: true, // Enable transparency for all inner cubes
            shininess: 100,
            emissive: new THREE.Color(0.2, 0.2, 0.2)
            });

            const innerCube = new THREE.Mesh(innerCubeGeometry, innerMaterial);
            cubeContainer.add(innerCube);

            // Calculate distance from center for pulsing effect
            const centerX = (gridSize - 1) / 2;
            const centerY = (gridSize - 1) / 2;
            const centerZ = (gridSize - 1) / 2;
            
            const distanceFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + 
                Math.pow(y - centerY, 2) + 
                Math.pow(z - centerZ, 2)
            ) / (Math.sqrt(3) * gridSize / 2); // Normalize distance

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

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

camera.position.set(6, 6, 6); // Moved camera back for larger grid
camera.lookAt(0, 0, 0);

// Animation
const rotationSpeed = 0.003;
const innerRotationSpeed = 0.00055;
const colorSpeed = 0.001;
let colorPhase = 0;

// Enhanced pulsing function
function getPulseOffset(distance, phase) {
    const pulseFreq = 1.5;
    const pulseAmplitude = 0.8;
    const centerEmphasis = Math.pow(1 - distance, 2.5); // Increased power for sharper falloff
    const wave = Math.sin(phase * Math.PI * 2 * pulseFreq + distance * Math.PI * 3);
    return wave * pulseAmplitude * centerEmphasis;
};

function animate() {
    requestAnimationFrame(animate);
    
    cubeParent.rotation.y += rotationSpeed;
    cubeParent.rotation.x += rotationSpeed * 0.5;
    
    colorPhase = (colorPhase + colorSpeed) % 1;
    
    innerCubes.forEach(cube => {
        const pulseOffset = getPulseOffset(cube.distanceFromCenter, colorPhase);
        const adjustedPhase = (colorPhase + pulseOffset) % 1;
        
        // Enhance visibility of inner cubes
        const chromaColor = hslToColor(adjustedPhase, 1, 0.5);
        const centerStrength = Math.pow(1 - cube.distanceFromCenter, 2); // Reduced power for more gradual falloff
        
        // Blend colors with higher minimum color values
        const color = new THREE.Color(
            0.3 + (1 - chromaColor.r) * centerStrength * 0.7,
            0.3 + (1 - chromaColor.g) * centerStrength * 0.7,
            0.3 + (1 - chromaColor.b) * centerStrength * 0.7
        );
        
        // Adjust opacity range to keep inner cubes more visible
        const opacity = Math.pow(1 - cube.distanceFromCenter, 1.2); // Reduced power for more gradual transparency
        cube.material.opacity = 0.4 + opacity * 0.6; // Increased minimum opacity
        
        // Enhance emissive effect
        const emissiveIntensity = 0.4 * opacity + 0.1; // Added minimum emissive
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