import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.z = 5;

// Create 4D vertices of a tesseract
const vertices4D = [
    [-1, -1, -1, -1], [1, -1, -1, -1], [-1, 1, -1, -1], [1, 1, -1, -1],
    [-1, -1, 1, -1], [1, -1, 1, -1], [-1, 1, 1, -1], [1, 1, 1, -1],
    [-1, -1, -1, 1], [1, -1, -1, 1], [-1, 1, -1, 1], [1, 1, -1, 1],
    [-1, -1, 1, 1], [1, -1, 1, 1], [-1, 1, 1, 1], [1, 1, 1, 1]
];

// Define edges connecting vertices
const edges = [
    [0,1], [0,2], [0,4], [0,8], [1,3], [1,5], [1,9],
    [2,3], [2,6], [2,10], [3,7], [3,11], [4,5], [4,6],
    [4,12], [5,7], [5,13], [6,7], [6,14], [7,15], [8,9],
    [8,10], [8,12], [9,11], [9,13], [10,11], [10,14],
    [11,15], [12,13], [12,14], [13,15], [14,15]
];

// Create line segments for edges
const geometry = new THREE.BufferGeometry();
const material = new THREE.LineBasicMaterial({ vertexColors: true });
const positions = [];
const colors = [];

// Function to project 4D to 3D
const project4Dto3D = (point4D, w_rotation, xy_rotation, zw_rotation) => {
    // Rotate in 4D
    let x = point4D[0], y = point4D[1], z = point4D[2], w = point4D[3];
    
    // XY rotation
    let temp_x = x * Math.cos(xy_rotation) - y * Math.sin(xy_rotation);
    let temp_y = x * Math.sin(xy_rotation) + y * Math.cos(xy_rotation);
    x = temp_x;
    y = temp_y;
    
    // ZW rotation
    temp_x = z * Math.cos(zw_rotation) - w * Math.sin(zw_rotation);
    let temp_w = z * Math.sin(zw_rotation) + w * Math.cos(zw_rotation);
    z = temp_x;
    w = temp_w;
    
    // W rotation
    let distance = 2;
    let w_factor = 1 / (distance - w);
    
    // Project to 3D
    return {
        x: x * w_factor,
        y: y * w_factor,
        z: z * w_factor,
        w: w
    };
};

// Update positions and colors based on 4D rotation
const updateGeometry = (time) => {
    const w_rotation = time * 0.001;
    const xy_rotation = time * 0.0005;
    const zw_rotation = time * 0.0007;
    
    positions.length = 0;
    colors.length = 0;
    
    edges.forEach(edge => {
        const start4D = vertices4D[edge[0]];
        const end4D = vertices4D[edge[1]];
        
        const start = project4Dto3D(start4D, w_rotation, xy_rotation, zw_rotation);
        const end = project4Dto3D(end4D, w_rotation, xy_rotation, zw_rotation);
        
        positions.push(start.x, start.y, start.z);
        positions.push(end.x, end.y, end.z);
        
        // Color based on w-coordinate
        const startColor = new THREE.Color().setHSL((start.w + 1) / 2, 1, 0.5);
        const endColor = new THREE.Color().setHSL((end.w + 1) / 2, 1, 0.5);
        
        colors.push(startColor.r, startColor.g, startColor.b);
        colors.push(endColor.r, endColor.g, endColor.b);
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
};

const lines = new THREE.LineSegments(geometry, material);
scene.add(lines);

const animate = () => {
    requestAnimationFrame(animate);
    updateGeometry(Date.now());
    controls.update();
    renderer.render(scene, camera);
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();