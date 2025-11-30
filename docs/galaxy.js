import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Timer } from 'three/examples/jsm/misc/Timer.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

/**
 * Scene and Debug
 */
const scene = new THREE.Scene();
const gui = new GUI({ width: 400 });
// Debug Parameters
let debugParameters = {
    particleCount: 4000,
    size: 0.02,
    radius: 5,
    spin: 1,
    branches: 5,
    randomness: 0.2,
    randomnessPower: 3
};

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Create galaxy
 */
let geometry = null
let material = null
let points = null
let positions = null

const generateGalaxy = () => {
    // Dispose of previous Galaxy to avoid memory leaks
    if (points) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry();
    positions = new Float32Array(debugParameters.particleCount * 3);

    for (let i = 0; i < debugParameters.particleCount; i++) {
        const i3 = i * 3;

        const radius = Math.random() * debugParameters.radius;
        const spinAngle = radius * debugParameters.spin;
        const branchAngle = (i % debugParameters.branches) / debugParameters.branches * Math.PI * 2;

        const randomX = (Math.random() - 0.5) * debugParameters.randomness * radius;
        const randomY = (Math.random() - 0.5) * debugParameters.randomness * radius;
        const randomZ = (Math.random() - 0.5) * debugParameters.randomness * radius;

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = -5 * Math.exp(-1.842 * radius )+ randomY + 2;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    material = new THREE.PointsMaterial({
        size: debugParameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

generateGalaxy();
// GUI Controls
gui.add(debugParameters, 'particleCount').min(100).max(10000).step(100).onFinishChange(generateGalaxy).name('count');
gui.add(debugParameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(debugParameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(debugParameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
gui.add(debugParameters, 'branches').min(2).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(debugParameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
// The examples I see pass in a canvas element to renderer, the appendChild route is interesting...
document.body.appendChild(renderer.domElement);
const canvas = renderer.domElement

// Create and add the axes helper
const axesHelper = new THREE.AxesHelper(1); // Adjust size as needed
scene.add(axesHelper);

camera.position.set(2, 2, 4);

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

/**
 * Timer Loop
 */
const timer = new Timer()

const tick = () => {
    timer.update()
    const elapsedTime = timer.getElapsed()

    if (points) {
        points.rotation.y = elapsedTime * 0.1;
    }

    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()