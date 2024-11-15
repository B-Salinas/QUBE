import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

const createNestedCube = (depth = 0, maxDepth = 15, scale = 1) => {
    if (depth >= maxDepth) return;

    const geometry = new THREE.BoxGeometry(scale, scale, scale);
    const material = new THREE.LineBasicMaterial({ 
        color: new THREE.Color().setHSL(depth / maxDepth, 1, 0.5),
        transparent: true,
        opacity: 1 - (depth / maxDepth) * 0.5
    });
    
    const cube = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry), 
        material
    );
    
    scene.add(cube);
    createNestedCube(depth + 1, maxDepth, scale * 0.8);
};

createNestedCube();
camera.position.z = 1.5;

const animate = () => {
    requestAnimationFrame(animate);

    scene.children.forEach((cube, index) => {
        cube.rotation.x += 0.01 * (1 + index * 0.1);
        cube.rotation.y += 0.01 * (1 + index * 0.1);
    });

    controls.update(); // Required for damping
    renderer.render(scene, camera);
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();