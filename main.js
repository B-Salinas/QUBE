import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';

import { OrbitControls } from 'three/addons/controlls/OrbitControls.js';

if (!WebGL.isWebGLAvailable()){
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
}

//

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer();

// const controls = new OrbitControls();
// const axis = new THREE.AxesHelper();