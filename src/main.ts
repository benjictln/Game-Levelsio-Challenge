import * as THREE from "three";

// Setup Scene
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handle Window Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create Character
const character = new THREE.Group();

// Body
const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.4;
character.add(body);

// Head
const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1.2;
character.add(head);

// Arms
const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
const armMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.3, 0.8, 0);
leftArm.rotation.z = Math.PI / 4;
character.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.3, 0.8, 0);
rightArm.rotation.z = -Math.PI / 4;
character.add(rightArm);

// Legs
const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
const legMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
leftLeg.position.set(-0.15, 0, 0);
character.add(leftLeg);

const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
rightLeg.position.set(0.15, 0, 0);
character.add(rightLeg);

scene.add(character);

// Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Camera Position
camera.position.z = 5;

// Movement variables
const moveSpeed = 0.1;
const keys: { [key: string]: boolean } = {};

// Keyboard event listeners
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Animation Loop
const animate = (): void => {
    requestAnimationFrame(animate);

    // Handle movement
    if (keys['ArrowLeft']) {
        character.position.x -= moveSpeed;
        // Add walking animation
        leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
        rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
        leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
        rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
    }
    if (keys['ArrowRight']) {
        character.position.x += moveSpeed;
        // Add walking animation
        leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
        rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
        leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
        rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
    }
    if (keys['ArrowUp']) {
        character.position.z -= moveSpeed;
        // Add walking animation
        leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
        rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
        leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
        rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
    }
    if (keys['ArrowDown']) {
        character.position.z += moveSpeed;
        // Add walking animation
        leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
        rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
        leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
        rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
    }

    // Reset animations when not moving
    if (!keys['ArrowLeft'] && !keys['ArrowRight'] && !keys['ArrowUp'] && !keys['ArrowDown']) {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.z = Math.PI / 4;
        rightArm.rotation.z = -Math.PI / 4;
    }

    renderer.render(scene, camera);
};
animate();

