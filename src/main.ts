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
    
    // Randomly select tree type
    const treeType = Math.random();
    
    // Common trunk properties
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

    if (treeType < 0.4) { // Pine tree (40% chance)
        // Create multiple layers of pine needles
        const pineLayers = 4;
        const pineColors = [0x1a4a1a, 0x2d5a27, 0x3a7e3a, 0x4a8f4a];
        
        for (let i = 0; i < pineLayers; i++) {
            const layerScale = 1 - (i * 0.15); // Each layer is slightly smaller
            const layerHeight = height * (0.5 + i * 0.15); // Stagger the heights
            
            // Main pine cluster
            const pineGeometry = new THREE.ConeGeometry(
                1.2 * layerScale,
                2.5 * layerScale,
                8
            );
            const pineMaterial = new THREE.MeshStandardMaterial({ 
                color: pineColors[i],
                roughness: 0.7,
                metalness: 0.1
            });
            const pine = new THREE.Mesh(pineGeometry, pineMaterial);
            pine.position.y = layerHeight;
            pine.castShadow = true;
            pine.receiveShadow = true;
            tree.add(pine);
        }
    } else if (treeType < 0.7) { // Round tree (30% chance)
        // Create a round, bushy tree
        const roundLayers = 3;
        const roundColors = [0x2d5a27, 0x3a7e3a, 0x4a8f4a];
        
        for (let i = 0; i < roundLayers; i++) {
            const layerScale = 1 - (i * 0.2);
            const layerHeight = height * (0.6 + i * 0.2);
            
            // Main round cluster
            const roundGeometry = new THREE.SphereGeometry(1.2 * layerScale, 12, 12);
            const roundMaterial = new THREE.MeshStandardMaterial({ 
                color: roundColors[i],
                roughness: 0.7,
                metalness: 0.1
            });
            const round = new THREE.Mesh(roundGeometry, roundMaterial);
            round.position.y = layerHeight;
            round.castShadow = true;
            round.receiveShadow = true;
            tree.add(round);
            
            // Add side clusters
            const sideClusters = 4;
            for (let j = 0; j < sideClusters; j++) {
                const angle = (j / sideClusters) * Math.PI * 2;
                const sideRound = new THREE.Mesh(
                    new THREE.SphereGeometry(0.6 * layerScale, 8, 8),
                    roundMaterial
                );
                sideRound.position.y = layerHeight * 0.8;
                sideRound.position.x = Math.cos(angle) * 0.8;
                sideRound.position.z = Math.sin(angle) * 0.8;
                sideRound.castShadow = true;
                sideRound.receiveShadow = true;
                tree.add(sideRound);
            }
        }
    } else { // Tall tree (30% chance)
        // Create a tall, slender tree with sparse foliage
        const tallLayers = 2;
        const tallColors = [0x2d5a27, 0x3a7e3a];
        
        for (let i = 0; i < tallLayers; i++) {
            const layerScale = 1 - (i * 0.3);
            const layerHeight = height * (0.7 + i * 0.3);
            
            // Main tall cluster
            const tallGeometry = new THREE.ConeGeometry(
                0.8 * layerScale,
                2 * layerScale,
                10
            );
            const tallMaterial = new THREE.MeshStandardMaterial({ 
                color: tallColors[i],
                roughness: 0.7,
                metalness: 0.1
            });
            const tall = new THREE.Mesh(tallGeometry, tallMaterial);
            tall.position.y = layerHeight;
            tall.castShadow = true;
            tall.receiveShadow = true;
            tree.add(tall);
            
            // Add sparse side clusters
            const sideClusters = 2;
            for (let j = 0; j < sideClusters; j++) {
                const angle = (j / sideClusters) * Math.PI * 2;
                const sideTall = new THREE.Mesh(
                    new THREE.ConeGeometry(0.4 * layerScale, 1 * layerScale, 6),
                    tallMaterial
                );
                sideTall.position.y = layerHeight * 0.8;
                sideTall.position.x = Math.cos(angle) * 0.6;
                sideTall.position.z = Math.sin(angle) * 0.6;
                sideTall.castShadow = true;
                sideTall.receiveShadow = true;
                tree.add(sideTall);
            }
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

