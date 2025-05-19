import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let fractalHexagon;

function init() {
  // Set up scene, camera, renderer, and controls
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 10;
  controls = new OrbitControls(camera, renderer.domElement);

  // Create and add fractal hexagon
  fractalHexagon = createFractalHexagon(5, 5);
  scene.add(fractalHexagon);

  // Add some light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);

  // Start animation loop
  animate();
}

function createFractalHexagon(size, depth) {
  const group = new THREE.Group();

  function createHexagonShape(radius) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.lineTo(radius, 0); // Close the shape
    return shape;
  }

  function createLayer(radius, depth) {
    if (depth === 0) return null;

    const layerGroup = new THREE.Group();

    // Create main hexagon
    const shape = createHexagonShape(radius);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.2,
      bevelEnabled: false,
    });
    const color = new THREE.Color().setHSL(0.6 - depth * 0.1, 1, 0.5);
    const material = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.7,
    });
    const hexMesh = new THREE.Mesh(geometry, material);
    layerGroup.add(hexMesh);

    // Create child hexagons
    if (depth > 1) {
      const childRadius = radius * 0.38;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * radius * 0.5;
        const y = Math.sin(angle) * radius * 0.5;
        const childLayer = createLayer(childRadius, depth - 1);
        if (childLayer) {
          childLayer.position.set(x, y, 0.2);
          layerGroup.add(childLayer);
        }
      }
    }

    return layerGroup;
  }

  return createLayer(size, depth);
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate the fractal hexagon
  if (fractalHexagon) {
    fractalHexagon.rotation.z += 0.005;
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the scene
init();
