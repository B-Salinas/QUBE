import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CatmullRomCurve3 } from 'three';

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
const PHI = 1.618033988749895;
const SCALE_FACTOR = 1 / PHI;

// Color mapping
const LEVEL_COLORS = {
    1: 0xffd700,  // Gold
    2: 0xffa500,  // Orange
    3: 0xff4500,  // Red-Orange
    4: 0xff1493,  // Deep Pink
    5: 0x9400d3   // Violet
};

const entireStructure = new THREE.Object3D();
scene.add(entireStructure);

// Store points for the spiral
const spiralPoints = [];

function createGoldenCube(depth, size, position, isGoldenPath = true) {
    if (depth > MAX_DEPTH) return;

    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
        color: LEVEL_COLORS[depth],
        wireframe: true,
        transparent: true,
        opacity: isGoldenPath ? 1.0 : 0.15
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.copy(position);
    entireStructure.add(cube);

    // Store points for golden path cubes
    if (isGoldenPath) {
        spiralPoints.push(position.clone());
    }

    if (depth < MAX_DEPTH) {
        const newSize = size * SCALE_FACTOR;
        const offset = size * SCALE_FACTOR / 2;

        let nextGoldenPos;
        switch (depth % 3) {
            case 0:
                nextGoldenPos = new THREE.Vector3(offset, -offset, -offset);
                break;
            case 1:
                nextGoldenPos = new THREE.Vector3(-offset, offset, -offset);
                break;
            case 2:
                nextGoldenPos = new THREE.Vector3(-offset, -offset, offset);
                break;
        }

        const newGoldenPosition = position.clone().add(nextGoldenPos);
        createGoldenCube(depth + 1, newSize, newGoldenPosition, true);

        const octants = [
            new THREE.Vector3(-offset, -offset, -offset),
            new THREE.Vector3(-offset, -offset, offset),
            new THREE.Vector3(-offset, offset, -offset),
            new THREE.Vector3(-offset, offset, offset),
            new THREE.Vector3(offset, -offset, -offset),
            new THREE.Vector3(offset, -offset, offset),
            new THREE.Vector3(offset, offset, -offset),
            new THREE.Vector3(offset, offset, offset)
        ];

        octants.forEach(octant => {
            if (!octant.equals(nextGoldenPos)) {
                const newPosition = position.clone().add(octant);
                createGoldenCube(depth + 1, newSize, newPosition, false);
            }
        });
    }
}

// Create initial structure
createGoldenCube(1, BASE_SIZE, new THREE.Vector3(0, 0, 0));

// Create the spiral curve
function createSpiral() {
    // Create a smooth curve through the points
    const curve = new CatmullRomCurve3(spiralPoints, false, 'centripetal', 0.5);
    
    // Generate points along the curve
    const points = curve.getPoints(200);
    
    // Create geometry from points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create glowing line material
    const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,  // Cyan color for contrast
        transparent: true,
        opacity: 0.8,
        linewidth: 1
    });
    
    // Create the line
    const spline = new THREE.Line(geometry, material);
    entireStructure.add(spline);
}

// Create the spiral after all points are collected
createSpiral();

// Camera setup
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;

// Animation
const rotationSpeed = 0.005;

function animate() {
    requestAnimationFrame(animate);
    
    entireStructure.rotation.y += rotationSpeed;
    entireStructure.rotation.x += rotationSpeed * 0.5;
    
    controls.update();
    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();