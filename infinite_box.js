import * as THREE from 'three';

// Scene setup remains the same until cubeMaterial
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create outer cube with more transparency
const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
const cubeMaterial = new THREE.MeshPhongMaterial({
  color: 0x000000,
  specular: 0xffffff,
  shininess: 100,
  side: THREE.BackSide,
  transparent: true,
  opacity: 0.3  // More transparent
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Enhanced reflection points
const createReflectionPoint = (depth, maxDepth, position) => {
  if (depth >= maxDepth) return;

  const pointGeometry = new THREE.SphereGeometry(0.1, 32, 32);  // Larger points
  const pointMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(depth / maxDepth, 1, 0.7),  // Brighter color
    emissive: new THREE.Color().setHSL(depth / maxDepth, 1, 0.5),  // Stronger emission
    transparent: true,
    opacity: 1 - (depth / maxDepth) * 0.3  // Less opacity falloff
  });
  const point = new THREE.Mesh(pointGeometry, pointMaterial);
  
  const reflections = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(-1, 1, 1),
    new THREE.Vector3(1, -1, 1),
    new THREE.Vector3(-1, -1, 1),
    new THREE.Vector3(1, 1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, -1, -1)
  ];

  reflections.forEach(reflection => {
    const newPosition = position.clone().multiply(reflection);
    const reflectedPoint = point.clone();
    reflectedPoint.position.copy(newPosition);
    scene.add(reflectedPoint);

    createReflectionPoint(
      depth + 1,
      maxDepth,
      newPosition.multiplyScalar(1.5)
    );
  });
};

// Create initial center point
createReflectionPoint(0, 4, new THREE.Vector3(0, 0, 0));

// Enhanced lighting setup
const centerLight = new THREE.PointLight(0xffffff, 2, 100);  // Strong center light
centerLight.position.set(0, 0, 0);
scene.add(centerLight);

const lights = [
  new THREE.PointLight(0xff0000, 1.5, 100),  // Increased intensity
  new THREE.PointLight(0x00ff00, 1.5, 100),
  new THREE.PointLight(0x0000ff, 1.5, 100)
];

lights[0].position.set(5, 5, 5);
lights[1].position.set(-5, -5, 5);
lights[2].position.set(0, 0, -5);
lights.forEach(light => scene.add(light));

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);  // Soft ambient light
scene.add(ambientLight);

camera.position.z = 6;

const animate = () => {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;

  const time = Date.now() * 0.001;
  lights.forEach((light, index) => {
    const angle = time + (index * Math.PI * 2 / 3);
    light.position.x = Math.cos(angle) * 5;
    light.position.y = Math.sin(angle) * 5;
  });

  renderer.render(scene, camera);
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();