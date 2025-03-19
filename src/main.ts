import * as THREE from "three";

// Setup Scene
const scene: THREE.Scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Handle Window Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Terrain settings
const CHUNK_SIZE = 50;
const CHUNK_RADIUS = 2; // Number of chunks to load in each direction
const chunks: Map<string, THREE.Group> = new Map();

// Create a chunk of terrain
function createChunk(chunkX: number, chunkZ: number): THREE.Group {
    const chunk = new THREE.Group();
    
    // Create ground for this chunk
    const groundGeometry = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7e3a,  // Green color for grass
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
    ground.receiveShadow = true;
    chunk.add(ground);

    // Add trees to this chunk
    const treesPerChunk = 10;
    for (let i = 0; i < treesPerChunk; i++) {
        const x = chunkX * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE;
        const z = chunkZ * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE;
        const tree = createTree(x, z);
        chunk.add(tree);
    }

    return chunk;
}

// Create Trees
function createTree(x: number, z: number) {
    const tree = new THREE.Group();
    
    // Randomize tree height and thickness
    const height = 2 + Math.random() * 1.5; // Height between 2 and 3.5
    const trunkRadius = 0.15 + Math.random() * 0.1; // Radius between 0.15 and 0.25
    
    // Tree trunk with varying thickness
    const trunkGeometry = new THREE.CylinderGeometry(
        trunkRadius * 0.8, // Top radius
        trunkRadius * 1.2, // Bottom radius
        height, // Height
        12 // Segments
    );
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a2f10,
        roughness: 0.8,
        metalness: 0.2
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Create multiple layers of leaves for more realistic look
    const leafLayers = 3;
    const leafColors = [0x2d5a27, 0x3a7e3a, 0x4a8f4a]; // Different shades of green
    
    for (let i = 0; i < leafLayers; i++) {
        const layerScale = 1 - (i * 0.2); // Each layer is slightly smaller
        const layerHeight = height * (0.6 + i * 0.2); // Stagger the heights
        
        // Main leaf cluster
        const leavesGeometry = new THREE.ConeGeometry(
            1.5 * layerScale,
            3 * layerScale,
            12
        );
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: leafColors[i],
            roughness: 0.7,
            metalness: 0.1
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = layerHeight;
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        tree.add(leaves);

        // Add smaller side clusters
        const sideClusters = 3;
        for (let j = 0; j < sideClusters; j++) {
            const angle = (j / sideClusters) * Math.PI * 2;
            const sideLeaves = new THREE.Mesh(
                new THREE.ConeGeometry(0.8 * layerScale, 1.5 * layerScale, 8),
                leavesMaterial
            );
            sideLeaves.position.y = layerHeight * 0.8;
            sideLeaves.position.x = Math.cos(angle) * 0.8;
            sideLeaves.position.z = Math.sin(angle) * 0.8;
            sideLeaves.castShadow = true;
            sideLeaves.receiveShadow = true;
            tree.add(sideLeaves);
        }
    }

    // Add some random rotation to make trees look more natural
    tree.rotation.y = Math.random() * Math.PI;
    tree.position.set(x, 0, z);
    return tree;
}

// Function to get chunk coordinates from world position
function getChunkCoords(x: number, z: number): [number, number] {
    return [
        Math.floor(x / CHUNK_SIZE),
        Math.floor(z / CHUNK_SIZE)
    ];
}

// Function to update visible chunks
function updateChunks(characterX: number, characterZ: number) {
    const [currentChunkX, currentChunkZ] = getChunkCoords(characterX, characterZ);
    
    // Remove chunks that are too far away
    for (const [key, chunk] of chunks.entries()) {
        const [chunkX, chunkZ] = key.split(',').map(Number);
        if (Math.abs(chunkX - currentChunkX) > CHUNK_RADIUS || 
            Math.abs(chunkZ - currentChunkZ) > CHUNK_RADIUS) {
            scene.remove(chunk);
            chunks.delete(key);
        }
    }
    
    // Add new chunks
    for (let x = currentChunkX - CHUNK_RADIUS; x <= currentChunkX + CHUNK_RADIUS; x++) {
        for (let z = currentChunkZ - CHUNK_RADIUS; z <= currentChunkZ + CHUNK_RADIUS; z++) {
            const key = `${x},${z}`;
            if (!chunks.has(key)) {
                const chunk = createChunk(x, z);
                chunks.set(key, chunk);
                scene.add(chunk);
            }
        }
    }
}

// Create Character
const character = new THREE.Group();

// Body
const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.4;
body.castShadow = true;
body.receiveShadow = true;
character.add(body);

// Head
const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1.2;
head.castShadow = true;
head.receiveShadow = true;
character.add(head);

// Arms
const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
const armMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.3, 0.8, 0);
leftArm.rotation.z = Math.PI / 4;
leftArm.castShadow = true;
leftArm.receiveShadow = true;
character.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.3, 0.8, 0);
rightArm.rotation.z = -Math.PI / 4;
rightArm.castShadow = true;
rightArm.receiveShadow = true;
character.add(rightArm);

// Legs
const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
const legMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
leftLeg.position.set(-0.15, 0, 0);
leftLeg.castShadow = true;
leftLeg.receiveShadow = true;
character.add(leftLeg);

const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
rightLeg.position.set(0.15, 0, 0);
rightLeg.castShadow = true;
rightLeg.receiveShadow = true;
character.add(rightLeg);

scene.add(character);

// Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Camera settings
const cameraOffset = new THREE.Vector3(0, 5, 10);
const cameraLerpFactor = 0.1; // Smoothing factor for camera movement

// Movement variables
const moveSpeed = 0.1;
const keys: { [key: string]: boolean } = {};

// Jump variables
let isJumping = false;
let verticalVelocity = 0;
const gravity = 0.015;
const jumpForce = 0.3;
const groundLevel = 0;

// Keyboard event listeners
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === ' ' && !isJumping) {
        isJumping = true;
        verticalVelocity = jumpForce;
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Initial chunk generation
updateChunks(0, 0);

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

    // Handle jumping
    if (isJumping) {
        character.position.y += verticalVelocity;
        verticalVelocity -= gravity;

        // Check if landed
        if (character.position.y <= groundLevel) {
            character.position.y = groundLevel;
            isJumping = false;
            verticalVelocity = 0;
        }
    }

    // Reset animations when not moving
    if (!keys['ArrowLeft'] && !keys['ArrowRight'] && !keys['ArrowUp'] && !keys['ArrowDown']) {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.z = Math.PI / 4;
        rightArm.rotation.z = -Math.PI / 4;
    }

    // Update chunks based on character position
    updateChunks(character.position.x, character.position.z);

    // Update camera position to follow character
    const targetCameraPosition = new THREE.Vector3(
        character.position.x + cameraOffset.x,
        character.position.y + cameraOffset.y,
        character.position.z + cameraOffset.z
    );

    // Smoothly move camera to target position
    camera.position.lerp(targetCameraPosition, cameraLerpFactor);

    // Make camera look at character
    camera.lookAt(character.position);

    renderer.render(scene, camera);
};
animate();

