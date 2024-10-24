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
const innerCubeScale = 0.65; // Reduced from 0.8 to prevent clipping
const spacing = 0.7;
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

            // Outer cube with increased transparency
            let outerMaterial;
            if (x === 0 && y === 0 && z === 0) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.2  // More transparent
                });
            } else if (x === gridSize - 1 && y === gridSize - 1 && z === gridSize - 1) {
                outerMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.2  // More transparent
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
                    opacity: 0.2  // More transparent
                });
            }

            const outerCube = new THREE.Mesh(outerCubeGeometry, outerMaterial);
            cubeContainer.add(outerCube);

            // Calculate distance from center
            const centerX = (gridSize - 1) / 2;
            const centerY = (gridSize - 1) / 2;
            const centerZ = (gridSize - 1) / 2;
            
            const distanceFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + 
                Math.pow(y - centerY, 2) + 
                Math.pow(z - centerZ, 2)
            ) / (Math.sqrt(3) * gridSize / 2);

            // Create inner cube with solid material
            const innerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(1, 0, 0),  // Start with red for debugging
                transparent: false,  // Make solid
                shininess: 100,
                emissive: new THREE.Color(0.5, 0, 0)  // Add strong emissive
            });

            const innerCube = new THREE.Mesh(innerCubeGeometry, innerMaterial);
            cubeContainer.add(innerCube);

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

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increased intensity
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Position camera closer
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Animation
const rotationSpeed = 0.003;
const innerRotationSpeed = 0.00055;
const colorSpeed = 0.001;
let colorPhase = 0;

function getPulseOffset(distance, phase) {
    const pulseFreq = 1.5;
    const pulseAmplitude = 0.8;
    const centerEmphasis = Math.pow(1 - distance, 2);
    const wave = Math.sin(phase * Math.PI * 2 * pulseFreq + distance * Math.PI * 3);
    return wave * pulseAmplitude * centerEmphasis;
}

function animate() {
    requestAnimationFrame(animate);
    
    cubeParent.rotation.y += rotationSpeed;
    cubeParent.rotation.x += rotationSpeed * 0.5;
    
    colorPhase = (colorPhase + colorSpeed) % 1;
    
    innerCubes.forEach(cube => {
        const pulseOffset = getPulseOffset(cube.distanceFromCenter, colorPhase);
        const adjustedPhase = (colorPhase + pulseOffset) % 1;
        
        // Enhanced center-focused color and transparency
        const color = hslToColor(adjustedPhase, 1, 0.5);
        
        // Calculate opacity based on distance from center
        const distanceFactor = Math.pow(1 - cube.distanceFromCenter, 3); // Sharper falloff
        const baseOpacity = 0.2; // Minimum opacity for outer cubes
        const maxOpacity = 1.0; // Full opacity at center
        cube.material.opacity = baseOpacity + (maxOpacity - baseOpacity) * distanceFactor;
        
        // Enhanced center glow
        const centerGlow = Math.pow(1 - cube.distanceFromCenter, 2);
        const emissiveIntensity = 0.5 * centerGlow;
        
        // Set final colors
        cube.material.transparent = true;
        cube.material.color = color;
        cube.material.emissive.setRGB(
            color.r * emissiveIntensity,
            color.g * emissiveIntensity,
            color.b * emissiveIntensity
        );
        
        // Rotation remains the same
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