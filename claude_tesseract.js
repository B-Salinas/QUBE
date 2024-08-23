// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the tesseract geometry
const vertices = [
  [-1, -1, -1, 1],
  [1, -1, -1, 1],
  [1, 1, -1, 1],
  [-1, 1, -1, 1],
  [-1, -1, 1, 1],
  [1, -1, 1, 1],
  [1, 1, 1, 1],
  [-1, 1, 1, 1],
  [-1, -1, -1, -1],
  [1, -1, -1, -1],
  [1, 1, -1, -1],
  [-1, 1, -1, -1],
  [-1, -1, 1, -1],
  [1, -1, 1, -1],
  [1, 1, 1, -1],
  [-1, 1, 1, -1],
];

const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 8],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 12],
  [8, 12],
  [9, 13],
  [10, 14],
  [11, 15],
  [0, 8],
  [1, 9],
  [2, 10],
  [3, 11],
  [4, 12],
  [5, 13],
  [6, 14],
  [7, 15],
];

const geometry = new THREE.BufferGeometry();
const material = new THREE.LineBasicMaterial({ color: 0xffffff });

// Function to project 4D points to 3D
function project4Dto3D(point, w = 2) {
  const scale = 1 / (w - point[3]);
  return new THREE.Vector3(
    point[0] * scale,
    point[1] * scale,
    point[2] * scale
  );
}

// Function to update the tesseract's rotation
function updateTesseract(time) {
  const rotatedVertices = vertices.map((v) => {
    let [x, y, z, w] = v;

    // Rotate in 4D
    const t = time * 0.001;
    const newX = x * Math.cos(t) - w * Math.sin(t);
    const newW = x * Math.sin(t) + w * Math.cos(t);

    return project4Dto3D([newX, y, z, newW]);
  });

  const positions = [];
  edges.forEach((edge) => {
    positions.push(
      rotatedVertices[edge[0]].x,
      rotatedVertices[edge[0]].y,
      rotatedVertices[edge[0]].z
    );
    positions.push(
      rotatedVertices[edge[1]].x,
      rotatedVertices[edge[1]].y,
      rotatedVertices[edge[1]].z
    );
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.attributes.position.needsUpdate = true;
}

const tesseract = new THREE.LineSegments(geometry, material);
scene.add(tesseract);

camera.position.z = 5;

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  updateTesseract(time);
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
