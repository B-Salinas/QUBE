// Written with Claude 3.5 and Cursor
// By Bianca "B" Salinas
// Created on Monday, August 26, 2024
// Last updated on Wednesday, August 28, 2024

// QUBE stands for Quaternion-based Unified Boundary Element
// QUBE stands for Quantum U Bounded Energy ??

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

console.log("qube.js is running");

let scene, camera, renderer, controls, composer;
let qube, superpositionLayer, singularity, dynamicDimensionality, interfaceLayer, ethicalFramework, temporalDimension, markovParticles;

const colors = {
  x: new THREE.Color(0xff0000), // Red for X-axis
  y: new THREE.Color(0x00ff00), // Green for Y-axis
  z: new THREE.Color(0x0000ff), // Blue for Z-axis
  white: new THREE.Color(0xffffff), // White for diagonal lines
};

const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio, approximately 1.618033988749895

function init() {
  console.log("Initializing...");
  try {
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

    controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 10;

    createQube();
    composer = addGlowEffect(scene, camera, renderer);

    window.addEventListener("resize", onWindowResize, false);
    console.log("Initialization complete");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

function createGrid(size, divisions) {
  const vertices = [];
  const step = size / divisions;

  // Create grid lines
  for (let i = 0; i <= divisions; i++) {
    const pos = i * step - size / 2;

    // X-axis lines
    vertices.push(-size / 2, pos, -size / 2, size / 2, pos, -size / 2);
    vertices.push(-size / 2, pos, size / 2, size / 2, pos, size / 2);
    vertices.push(-size / 2, -size / 2, pos, -size / 2, size / 2, pos);
    vertices.push(size / 2, -size / 2, pos, size / 2, size / 2, pos);

    // Y-axis lines
    vertices.push(pos, -size / 2, -size / 2, pos, size / 2, -size / 2);
    vertices.push(pos, -size / 2, size / 2, pos, size / 2, size / 2);

    // Z-axis lines (added)
    vertices.push(-size / 2, pos, -size / 2, -size / 2, pos, size / 2);
    vertices.push(size / 2, pos, -size / 2, size / 2, pos, size / 2);
    vertices.push(pos, -size / 2, -size / 2, pos, -size / 2, size / 2);
    vertices.push(pos, size / 2, -size / 2, pos, size / 2, size / 2);
  }

  return new Float32Array(vertices);
}

function createQube() {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ vertexColors: true });

  const vertices = [];
  const colorAttributes = [];

  const qubeSize = 1; // Base size for the inner cube (Qube)
  const hausSize = qubeSize * PHI; // Size of the outer cube (Haus)

  // Create central cube (Qube)
  createCube(0, 0, 0, qubeSize, vertices, colorAttributes, false, true);

  // Create outer cube (Haus)
  createCube(0, 0, 0, hausSize, vertices, colorAttributes, true);

  // Connect Haus and Qube at 8 vertices
  const hausCorners = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ];

  hausCorners.forEach((corner) => {
    vertices.push(
      (corner[0] * hausSize) / 2, (corner[1] * hausSize) / 2, (corner[2] * hausSize) / 2,
      (corner[0] * qubeSize) / 2, (corner[1] * qubeSize) / 2, (corner[2] * qubeSize) / 2
    );

    // Check if the line is strictly along one axis
    if (corner.filter((coord) => coord !== 0).length === 1) {
      // The line is along a single axis
      let primaryColor;
      if (corner[0] !== 0) primaryColor = colors.x;
      else if (corner[1] !== 0) primaryColor = colors.y;
      else primaryColor = colors.z;
      colorAttributes.push(...primaryColor.toArray(), ...primaryColor.toArray());
    } else {
      // The line is diagonal, so use white
      colorAttributes.push(...colors.white.toArray(), ...colors.white.toArray());
    }
  });

  // Create Haus grid
  const hausGridDivisions = 5; // 5x5x5 grid for Haus
  const hausGridGeometry = new THREE.BufferGeometry();
  hausGridGeometry.setAttribute('position', new THREE.BufferAttribute(createGrid(hausSize, hausGridDivisions), 3));
  const hausGridMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3 });
  const hausGrid = new THREE.LineSegments(hausGridGeometry, hausGridMaterial);

  // Create Qube grid
  const qubeGridDivisions = 3; // 3x3x3 grid for Qube (adjust as needed)
  const qubeGridGeometry = new THREE.BufferGeometry();
  qubeGridGeometry.setAttribute('position', new THREE.BufferAttribute(createGrid(qubeSize, qubeGridDivisions), 3));
  const qubeGridMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.5 });
  const qubeGrid = new THREE.LineSegments(qubeGridGeometry, qubeGridMaterial);

  // Create cognitive regions (condensed within Qube)
  const cognitiveRegions = createCognitiveRegions(qubeSize);

  // Create superposition layer (condensed within Qube)
  superpositionLayer = createSuperpositionLayer(qubeSize);

  // Create singularity
  singularity = createSingularity();

  // Create interconnected networks
  const interconnectedNetworks = createInterconnectedNetworks(qubeSize);

  // Create dynamic dimensionality
  dynamicDimensionality = createDynamicDimensionality(hausSize);

  // Create interface layer
  interfaceLayer = createInterfaceLayer(qubeSize);

  // Create ethical framework
  ethicalFramework = createEthicalFramework(hausSize * 1.1);

  // Create temporal dimension
  temporalDimension = createTemporalDimension(hausSize);

  // Create Markov particles
  markovParticles = createMarkovParticles(qubeSize, 1000);

  // Create the main geometry
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorAttributes, 3));

  qube = new THREE.Group();
  qube.add(new THREE.LineSegments(geometry, material));
  qube.add(hausGrid);
  qube.add(qubeGrid);
  qube.add(cognitiveRegions);
  qube.add(superpositionLayer);
  qube.add(singularity);
  qube.add(interconnectedNetworks);
  qube.add(dynamicDimensionality);
  qube.add(interfaceLayer);
  qube.add(ethicalFramework);
  qube.add(temporalDimension);
  qube.add(markovParticles);
  scene.add(qube);

  const fractalHexagon = createFractalHexagon(5, 5);
  qube.userData.fractalHexagon = fractalHexagon;
  scene.add(fractalHexagon);
}

function createCube(
  x,
  y,
  z,
  size,
  vertices,
  colorAttributes,
  isHaus = false,
  isQube = false
) {
  const halfSize = size / 2;
  const corners = [
    [-halfSize, -halfSize, -halfSize],
    [halfSize, -halfSize, -halfSize],
    [halfSize, halfSize, -halfSize],
    [-halfSize, halfSize, -halfSize],
    [-halfSize, -halfSize, halfSize],
    [halfSize, -halfSize, halfSize],
    [halfSize, halfSize, halfSize],
    [-halfSize, halfSize, halfSize],
  ];

  // Function to add an edge with appropriate color
  function addEdge(start, end, axisColor) {
    vertices.push(
      x + corners[start][0],
      y + corners[start][1],
      z + corners[start][2],
      x + corners[end][0],
      y + corners[end][1],
      z + corners[end][2]
    );
    colorAttributes.push(...axisColor.toArray(), ...axisColor.toArray());
  }

  // Add edges with colors based on their orientation
  // X-axis edges (red)
  addEdge(0, 1, colors.x);
  addEdge(2, 3, colors.x);
  addEdge(4, 5, colors.x);
  addEdge(6, 7, colors.x);

  // Y-axis edges (green)
  addEdge(0, 3, colors.y);
  addEdge(1, 2, colors.y);
  addEdge(4, 7, colors.y);
  addEdge(5, 6, colors.y);

  // Z-axis edges (blue)
  addEdge(0, 4, colors.z);
  addEdge(1, 5, colors.z);
  addEdge(2, 6, colors.z);
  addEdge(3, 7, colors.z);
}

// Add this function to create a 3D Menger Sponge fractal
function createMengerSponge(size, iterations) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  const sponge = new THREE.Mesh(geometry, material);

  if (iterations > 0) {
    const newSize = size / 3;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 1) {
            const subSponge = createMengerSponge(newSize, iterations - 1);
            subSponge.position.set(x * newSize, y * newSize, z * newSize);
            sponge.add(subSponge);
          }
        }
      }
    }
  }

  return sponge;
}

// Modify createCognitiveRegions function
function createCognitiveRegions(size) {
  const regions = new THREE.Group();
  const regionColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  
  for (let i = 0; i < 6; i++) {
    const fractal = createMengerSponge(size / 4, 2);
    fractal.material.color.setHex(regionColors[i]);
    fractal.material.transparent = true;
    fractal.material.opacity = 0.3;
    fractal.position.set(
      (Math.random() - 0.5) * size * 0.8,
      (Math.random() - 0.5) * size * 0.8,
      (Math.random() - 0.5) * size * 0.8
    );
    regions.add(fractal);
  }
  
  return regions;
}

function createSuperpositionLayer(size) {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({ size: 0.03, vertexColors: true });

  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * size * 0.9;
    positions[i * 3 + 1] = (Math.random() - 0.5) * size * 0.9;
    positions[i * 3 + 2] = (Math.random() - 0.5) * size * 0.9;

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(geometry, material);
}

function createSingularity() {
  const geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec2 p = -1.0 + 2.0 * vUv;
        float r = sqrt(dot(p,p));
        float a = atan(p.y,p.x) + 1.0*sin(r*10.0-time*2.0);
        float h = 0.5 + 0.5*cos(a*3.0);
        float l = 0.5 + 0.5*cos(r*10.0-time*2.0);
        gl_FragColor = vec4(h,l,1.0,1.0);
      }
    `,
    transparent: true
  });
  return new THREE.Mesh(geometry, material);
}

// Modify createInterconnectedNetworks function
function createInterconnectedNetworks(size) {
  const network = new THREE.Group();
  const connectionCount = 6;

  function createRecursiveConnection(startPoint, endPoint, depth) {
    if (depth === 0) return;

    const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
    midPoint.add(new THREE.Vector3(
      (Math.random() - 0.5) * size * 0.2,
      (Math.random() - 0.5) * size * 0.2,
      (Math.random() - 0.5) * size * 0.2
    ));

    const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, midPoint, endPoint]);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 - (0.1 * (3 - depth)) });
    const line = new THREE.Line(geometry, material);
    network.add(line);

    createRecursiveConnection(startPoint, midPoint, depth - 1);
    createRecursiveConnection(midPoint, endPoint, depth - 1);
  }

  for (let i = 0; i < connectionCount; i++) {
    const startPoint = new THREE.Vector3(
      (Math.random() - 0.5) * size,
      (Math.random() - 0.5) * size,
      (Math.random() - 0.5) * size
    );
    const endPoint = new THREE.Vector3(
      (Math.random() - 0.5) * size,
      (Math.random() - 0.5) * size,
      (Math.random() - 0.5) * size
    );
    createRecursiveConnection(startPoint, endPoint, 3);
  }

  return network;
}

function createDynamicDimensionality(size) {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({ size: 0.02, vertexColors: true });

  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * size;
    positions[i * 3 + 1] = (Math.random() - 0.5) * size;
    positions[i * 3 + 2] = (Math.random() - 0.5) * size;

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(geometry, material);
}

// Modify createInterfaceLayer function
function createInterfaceLayer(size) {
  const geometry = new THREE.PlaneGeometry(size, size, 256, 256);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      
      // 2D Fractal Brownian Motion
      float fbm(vec2 p) {
        float f = 0.0;
        float w = 0.5;
        for (int i = 0; i < 5; i++) {
          f += w * sin(p.x + p.y + time);
          p = p * 2.0 + vec2(1.3, 1.7);
          w *= 0.5;
        }
        return f;
      }

      void main() {
        vUv = uv;
        vec3 pos = position;
        float displacement = fbm(vUv * 10.0 + time * 0.1) * 0.1;
        pos.z += displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        vec2 p = -1.0 + 2.0 * vUv;
        float r = sqrt(dot(p,p));
        float a = atan(p.y,p.x) + 0.5*sin(r*10.0-time*2.0);
        float h = 0.5 + 0.5*cos(a*3.0);
        float l = 0.5 + 0.5*cos(r*10.0-time*2.0);
        gl_FragColor = vec4(h,l,1.0,0.3);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.z = size / 2;
  return plane;
}

function createEthicalFramework(size) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2 });
  return new THREE.LineSegments(edges, material);
}

function createTemporalDimension(size) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-size/2, 0, 0),
    new THREE.Vector3(0, size/2, 0),
    new THREE.Vector3(size/2, 0, 0),
    new THREE.Vector3(0, -size/2, 0),
    new THREE.Vector3(-size/2, 0, 0)
  ]);
  const geometry = new THREE.TubeGeometry(curve, 100, size/20, 8, true);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.3 });
  return new THREE.Mesh(geometry, material);
}

function createMarkovParticles(size, particleCount) {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({ size: 0.02, vertexColors: true });

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const states = new Uint8Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * size;
    positions[i * 3 + 1] = (Math.random() - 0.5) * size;
    positions[i * 3 + 2] = (Math.random() - 0.5) * size;

    states[i] = Math.floor(Math.random() * 3); // 3 possible states
    const stateColor = new THREE.Color().setHSL(states[i] / 3, 1, 0.5);
    colors[i * 3] = stateColor.r;
    colors[i * 3 + 1] = stateColor.g;
    colors[i * 3 + 2] = stateColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particles = new THREE.Points(geometry, material);
  particles.userData.states = states;

  return particles;
}

function createFractalHexagon(size, depth) {
  const group = new THREE.Group();

  function createHexagon(radius, color) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
    return new THREE.Mesh(geometry, material);
  }

  function createLayer(radius, depth) {
    const layerGroup = new THREE.Group();

    if (depth <= 0) return layerGroup;

    const color = new THREE.Color().setHSL(0.6 - depth * 0.1, 1, 0.5);
    const hexagon = createHexagon(radius, color);
    layerGroup.add(hexagon);

    if (depth > 1) {
      const childRadius = radius * 0.38;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * radius * 0.5;
        const y = Math.sin(angle) * radius * 0.5;
        const childLayer = createLayer(childRadius, depth - 1);
        childLayer.position.set(x, y, 0.01 * depth);
        layerGroup.add(childLayer);
      }
    }

    return layerGroup;
  }

  return createLayer(size, depth);
}

function addGlowEffect(scene, camera, renderer) {
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 2;
  bloomPass.radius = 0;

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  return composer;
}

let animationFrameId;
let time = 0;

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  time += 0.01;

  if (qube) {
    // Rotate the entire structure
    qube.rotation.x = Math.sin(time * 0.5) * 0.2;
    qube.rotation.y = Math.cos(time * 0.4) * 0.2;

    // Animate cognitive regions
    qube.children[3].children.forEach((region, index) => {
      region.scale.setScalar(1 + 0.1 * Math.sin(time * 2 + index));
      // Orbit around center
      const orbitRadius = 0.3;
      region.position.x = Math.cos(time + index) * orbitRadius;
      region.position.y = Math.sin(time + index) * orbitRadius;
    });

    // Animate superposition layer
    const positions = superpositionLayer.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(time + i) * 0.001;
      positions[i + 1] += Math.cos(time + i) * 0.001;
      positions[i + 2] += Math.sin(time * 0.5 + i) * 0.001;
      
      // Contain within Qube
      positions[i] = Math.max(Math.min(positions[i], 0.5), -0.5);
      positions[i+1] = Math.max(Math.min(positions[i+1], 0.5), -0.5);
      positions[i+2] = Math.max(Math.min(positions[i+2], 0.5), -0.5);
    }
    superpositionLayer.geometry.attributes.position.needsUpdate = true;

    // Animate singularity
    singularity.material.uniforms.time.value = time;
    singularity.scale.setScalar(1 + 0.2 * Math.sin(time * 3));

    // Animate dynamic dimensionality
    if (dynamicDimensionality) {
      const positions = dynamicDimensionality.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 0.1 + i) * 0.001;
        positions[i + 1] += Math.cos(time * 0.1 + i) * 0.001;
        positions[i + 2] += Math.sin(time * 0.05 + i) * 0.001;
      }
      dynamicDimensionality.geometry.attributes.position.needsUpdate = true;
    }

    // Animate interface layer
    if (interfaceLayer) {
      interfaceLayer.material.uniforms.time.value = time;
    }

    // Animate temporal dimension
    if (temporalDimension) {
      temporalDimension.rotation.x += 0.01;
      temporalDimension.rotation.y += 0.01;
    }

    // Animate Markov particles
    if (markovParticles) {
      const positions = markovParticles.geometry.attributes.position.array;
      const colors = markovParticles.geometry.attributes.color.array;
      const states = markovParticles.userData.states;

      for (let i = 0; i < states.length; i++) {
        if (Math.random() < 0.01) { // 1% chance to change state
          states[i] = (states[i] + 1) % 3;
          const stateColor = new THREE.Color().setHSL(states[i] / 3, 1, 0.5);
          colors[i * 3] = stateColor.r;
          colors[i * 3 + 1] = stateColor.g;
          colors[i * 3 + 2] = stateColor.b;
        }

        // Move particles based on their state
        const speed = 0.001 * (states[i] + 1);
        positions[i * 3] += Math.sin(time + i) * speed;
        positions[i * 3 + 1] += Math.cos(time + i) * speed;
        positions[i * 3 + 2] += Math.sin(time * 0.5 + i) * speed;

        // Contain within Qube
        positions[i * 3] = Math.max(Math.min(positions[i * 3], 0.5), -0.5);
        positions[i * 3 + 1] = Math.max(Math.min(positions[i * 3 + 1], 0.5), -0.5);
        positions[i * 3 + 2] = Math.max(Math.min(positions[i * 3 + 2], 0.5), -0.5);
      }

      markovParticles.geometry.attributes.position.needsUpdate = true;
      markovParticles.geometry.attributes.color.needsUpdate = true;
    }

    // Rotate the fractal hexagon
    if (qube.userData.fractalHexagon) {
      qube.userData.fractalHexagon.rotation.z += 0.001;
    }
  }

  if (composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }

  // Safeguard against infinite recursion
  if (time > 600) {
    // Stop after about 1 minute
    cancelAnimationFrame(animationFrameId);
    console.log("Animation stopped after 1 minute as a safeguard");
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
  }
}

try {
  init();
  animate(0);
} catch (error) {
  console.error("Error starting the application:", error);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
