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
const MAX_DEPTH = 4;
const BASE_SIZE = 2;
const SCALE_FACTOR = 0.5;

// Store all cubes for animation
const allCubes = [];

function createSierpinskiCube(depth, size, position) {
    if (depth > MAX_DEPTH) return;

    // Create cube at this position
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x000000,
        shininess: 100,
        transparent: true,
        opacity: 0.8
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    scene.add(cube);
    
    // Store cube info for animation
    allCubes.push({
        mesh: cube,
        depth: depth,
        initialPosition: position.clone()
    });

    // Calculate new size for subcubes
    const newSize = size * SCALE_FACTOR;
    const offset = size / 2 - newSize / 2;

    // Create subcubes at each corner
    const corners = [
        new THREE.Vector3(-offset, -offset, -offset),
        new THREE.Vector3(-offset, -offset, offset),
        new THREE.Vector3(-offset, offset, -offset),
        new THREE.Vector3(-offset, offset, offset),
        new THREE.Vector3(offset, -offset, -offset),
        new THREE.Vector3(offset, -offset, offset),
        new THREE.Vector3(offset, offset, -offset),
        new THREE.Vector3(offset, offset, offset)
    ];

    corners.forEach(corner => {
        const newPosition = position.clone().add(corner);
        createSierpinskiCube(depth + 1, newSize, newPosition);
    });
}

// Create initial cube
createSierpinskiCube(1, BASE_SIZE, new THREE.Vector3(0, 0, 0));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Camera position
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation
let colorPhase = 0;
const colorSpeed = 0.005;
const rotationSpeed = 0.001;

function hslToColor(h, s, l) {
    return new THREE.Color().setHSL(h, s, l);
}

function animate() {
    requestAnimationFrame(animate);
    
    colorPhase = (colorPhase + colorSpeed) % 1;
    
    allCubes.forEach((cubeInfo, index) => {
        const { mesh, depth, initialPosition } = cubeInfo;
        
        // Color based on depth and position
        const depthFactor = depth / MAX_DEPTH;
        const distanceFromCenter = initialPosition.length();
        const maxDistance = BASE_SIZE * Math.sqrt(3);
        const distanceFactor = distanceFromCenter / maxDistance;
        
        // Calculate color with phase offset based on position and depth
        const hueOffset = (depthFactor * 0.2) + (distanceFactor * 0.3);
        const adjustedPhase = (colorPhase + hueOffset) % 1;
        
        const color = hslToColor(
            adjustedPhase,
            0.8,
            0.4 + (0.2 * (1 - depthFactor))
        );
        
        mesh.material.color = color;
        mesh.material.emissive.setRGB(
            color.r * 0.2,
            color.g * 0.2,
            color.b * 0.2
        );
        
        // Subtle rotation based on depth
        mesh.rotation.x += rotationSpeed * (1 + depth * 0.1);
        mesh.rotation.y += rotationSpeed * (1 - depth * 0.05);
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