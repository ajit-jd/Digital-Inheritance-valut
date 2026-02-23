import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// Scene with black background (change color if needed)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0A0A12); // #0A0A12 (eerie black)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(100, 100, 100);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.enableDamping = true;
controls.enableZoom = false; // scroll se page scroll hoga, zoom nahi
controls.target.set(0, 0.5, 0);

// Lights
// ===== BRIGHT CINEMATIC LIGHTING =====

// Strong Ambient Light (overall brightness)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Main Key Light (front strong white light)
const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(3, 5, 5);
keyLight.castShadow = true;
scene.add(keyLight);

// Fill Light (soft side light)
const fillLight = new THREE.DirectionalLight(0x88aaff, 2);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

// Back Light (rim glow effect)
const backLight = new THREE.DirectionalLight(0xffddaa, 2);
backLight.position.set(0, 4, -5);
scene.add(backLight);

// Extra Point Light (extra brightness boost)
const pointLight = new THREE.PointLight(0xffffff, 2, 50);
pointLight.position.set(0, 3, 2);
scene.add(pointLight);

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let model; // global reference

// Load GLTF
const loader = new GLTFLoader();
loader.load(
    './aslam6.glb',
    (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        // Store original scale and Y position for bounce animation
        model.userData.originalScale = model.scale.clone();
        model.userData.originalY = model.position.y;
        scene.add(model);
        console.log('✅ Model loaded successfully!');
    },
    (xhr) => {
        console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
    },
    (error) => {
        console.error('❌ Model load error:', error);
    }
);

// Click event listener
renderer.domElement.addEventListener('click', (event) => {
    if (!model) return; // model not loaded yet

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Check intersections with model (including children)
    const intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
        // Model clicked – trigger bounce animation
        // bounceModel();
    }
});

// --- BOUNCE ADDITION START ---
// Bounce animation function using easeOutBounce
function bounceModel() {
    if (!model) return;

    const startTime = performance.now();
    const duration = 600; // milliseconds (longer for a nice bounce)

    // Easing function: easeOutBounce
    function easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    function animateBounce() {
        const elapsed = performance.now() - startTime;
        let progress = Math.min(elapsed / duration, 1); // 0 to 1

        // Apply easeOutBounce for vertical movement
        const bounceFactor = easeOutBounce(progress); // starts at 0, ends at 1

        // Scale effect: slightly stretch on way up, squash on way down
        let scaleFactor;
        if (progress < 0.3) {
            // quick squash before jump
            scaleFactor = 1 - 0.1 * (progress / 0.3); // scale down a bit
        } else if (progress < 0.7) {
            // stretch upward
            const midProgress = (progress - 0.3) / 0.4;
            scaleFactor = 0.9 + 0.2 * Math.sin(midProgress * Math.PI); // 0.9 -> 1.1 -> 0.9
        } else {
            // settle back
            scaleFactor = 0.9 + 0.1 * (1 - (progress - 0.7) / 0.3); // back to 1.0
        }

        // Apply scale
        model.scale.set(
            model.userData.originalScale.x * scaleFactor,
            model.userData.originalScale.y * scaleFactor,
            model.userData.originalScale.z * scaleFactor
        );

        // Vertical bounce: go up to +0.8 and come back with bounce easing
        const maxHeight = 0.8;
        // Use bounceFactor to simulate a bounce (starts at 0, goes to 1, but we want peak at ~0.5)
        // For a classic bounce, we use a parabolic shape: height = sin(progress * PI) but with bounce easing we can just use bounceFactor on the way down.
        // Simpler: use a sine wave for the first half, then bounce ease for the second half.
        let yOffset;
        if (progress < 0.5) {
            // upward phase (smooth)
            const upProgress = progress * 2; // 0 to 1
            yOffset = maxHeight * Math.sin(upProgress * Math.PI / 2); // smooth rise
        } else {
            // downward phase with bounce easing
            const downProgress = (progress - 0.5) * 2; // 0 to 1
            yOffset = maxHeight * (1 - easeOutBounce(downProgress));
        }

        model.position.y = model.userData.originalY + yOffset;

        if (progress < 1) {
            requestAnimationFrame(animateBounce);
        } else {
            // restore original scale and position
            model.scale.copy(model.userData.originalScale);
            model.position.y = model.userData.originalY;
        }
    }

    animateBounce();
}
// --- BOUNCE ADDITION END ---

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});