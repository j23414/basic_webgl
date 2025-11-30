import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Timer } from 'three/examples/jsm/misc/Timer.js'
// import { atomicXor } from 'three/tsl' // for advanced shaders... not yet

// For a Debug UI
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);

// The examples I see pass in a canvas element to renderer, the appendChild route is interesting...
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);
const canvas = renderer.domElement

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const material = new THREE.MeshNormalMaterial()
material.side = THREE.DoubleSide
material.flatShading = true

// Geometry is used once for instantiating the Mesh, ergo can reuse geometry
// So changes to size need to applied to Mesh, not Geometry
const geo_ball = new THREE.SphereGeometry(0.5, 6, 6)
const sphere = new THREE.Mesh(
  geo_ball,
  material
)

const sphere2 = new THREE.Mesh(
  geo_ball,
  material
)

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(0.5, 0.5),
  material
)

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.15, 12, 48, Math.PI * 2),
  material
)

scene.add(sphere, plane, torus, sphere2)
// Create and add the axes helper
const axesHelper = new THREE.AxesHelper(1); // Adjust size as needed

scene.add(axesHelper);

sphere.position.x = -1
torus.position.x = 1
sphere2.position.set(-1, 1, 0)

camera.position.set(1, 1, 2);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Update size
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
// }
// animate();

/**
 * Animate
 */
const timer = new Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()

  sphere.rotation.y = elapsedTime * 0.2
  plane.rotation.y = elapsedTime * 0.2
  torus.rotation.y = elapsedTime * 0.2

  sphere.rotation.x = -elapsedTime * 0.15
  plane.rotation.x = -elapsedTime * 0.15
  torus.rotation.x = -elapsedTime * 0.15

  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()