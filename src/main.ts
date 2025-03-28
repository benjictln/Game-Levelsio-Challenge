import * as THREE from "three";
import { AudioManager } from "./audio";
import { ForeignCreature } from "./foreign_creature";
import { BaguetteAndWine } from "./powerups/BaguetteAndWine";

// Setup Scene
const scene: THREE.Scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Create UI elements
const controlsPanel = document.createElement('div');
controlsPanel.style.position = 'fixed';
controlsPanel.style.top = '20px';
controlsPanel.style.left = '20px';
controlsPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
controlsPanel.style.padding = '15px';
controlsPanel.style.borderRadius = '10px';
controlsPanel.style.color = 'white';
controlsPanel.style.fontFamily = 'Arial, sans-serif';
controlsPanel.style.fontSize = '16px';
controlsPanel.style.lineHeight = '1.5';
controlsPanel.style.zIndex = '1000';
controlsPanel.innerHTML = `
    Space: jump<br>
    M: mute / unmute sound
`;
document.body.appendChild(controlsPanel);

const scorePanel = document.createElement('div');
scorePanel.style.position = 'fixed';
scorePanel.style.top = '20px';
scorePanel.style.right = '20px';
scorePanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
scorePanel.style.padding = '15px';
scorePanel.style.borderRadius = '10px';
scorePanel.style.color = 'white';
scorePanel.style.fontFamily = 'Arial, sans-serif';
scorePanel.style.fontSize = '16px';
scorePanel.style.lineHeight = '1.5';
scorePanel.style.zIndex = '1000';
scorePanel.innerHTML = `Score: 0`;
document.body.appendChild(scorePanel);

const timerPanel = document.createElement('div');
timerPanel.style.position = 'fixed';
timerPanel.style.top = '20px';
timerPanel.style.left = '50%';
timerPanel.style.transform = 'translateX(-50%)';
timerPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
timerPanel.style.padding = '15px';
timerPanel.style.borderRadius = '10px';
timerPanel.style.color = 'white';
timerPanel.style.fontFamily = 'Arial, sans-serif';
timerPanel.style.fontSize = '16px';
timerPanel.style.lineHeight = '1.5';
timerPanel.style.zIndex = '1000';
timerPanel.style.display = 'none';
timerPanel.innerHTML = `Superhuman Mode: 10s`;
document.body.appendChild(timerPanel);

const gameOverPanel = document.createElement('div');
gameOverPanel.style.position = 'fixed';
gameOverPanel.style.top = '50%';
gameOverPanel.style.left = '50%';
gameOverPanel.style.transform = 'translate(-50%, -50%)';
gameOverPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
gameOverPanel.style.padding = '30px';
gameOverPanel.style.borderRadius = '15px';
gameOverPanel.style.color = 'white';
gameOverPanel.style.fontFamily = 'Arial, sans-serif';
gameOverPanel.style.fontSize = '24px';
gameOverPanel.style.textAlign = 'center';
gameOverPanel.style.display = 'none';
gameOverPanel.style.zIndex = '1000';
gameOverPanel.innerHTML = `
    <h2 style="margin: 0 0 20px 0;">Game Over!</h2>
    <p style="margin: 0;">You were caught by a foreign creature!</p>
    <button style="margin-top: 20px; padding: 10px 20px; font-size: 18px; cursor: pointer;">Restart Game</button>
`;
document.body.appendChild(gameOverPanel);

// Add click handler for restart button
gameOverPanel.querySelector('button')?.addEventListener('click', () => {
    location.reload();
});

// Initialize game state
let isGameOver = false;
let isSuperhuman = false;
let superhumanTimer = 0;
let score = 0;
const baguettes: BaguetteAndWine[] = [];

// Initialize Audio Manager
const audioManager = new AudioManager();

// Add click listener to start music
document.addEventListener('click', () => {
    audioManager.playBackgroundMusic(
        'background_music.mp3',
        0.3 // Volume at 30%
    );
}, { once: true });

// Add mute toggle with 'M' key
window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'm') {
        audioManager.toggleMute();
    }
});

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
const CREATURES_PER_CHUNK = 3; // Number of creatures per chunk
const chunks: Map<string, THREE.Group> = new Map();
const foreignCreatures: ForeignCreature[] = [];

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

// Function to update visible chunks and items
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

                // Add creatures to this chunk
                for (let i = 0; i < CREATURES_PER_CHUNK; i++) {
                    const creatureX = x * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE;
                    const creatureZ = z * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE;
                    const creature = new ForeignCreature(creatureX, creatureZ);
                    scene.add(creature.getMesh());
                    foreignCreatures.push(creature);
                }

                // Add baguette and wine to this chunk (20% chance)
                if (Math.random() < 0.2) {
                    const powerupX = x * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE;
                    const powerupZ = z * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE;
                    const powerup = new BaguetteAndWine(powerupX, powerupZ);
                    scene.add(powerup.getMesh());
                    baguettes.push(powerup);
                }
            }
        }
    }
}

// Create Character
const character = new THREE.Group();

// Body - slightly rounder and shorter
const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 12);
const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.1
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.3;
body.castShadow = true;
body.receiveShadow = true;
character.add(body);

// Head - larger and rounder
const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const headMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.1
});
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 0.9;
head.castShadow = true;
head.receiveShadow = true;
character.add(head);

// Eyes
const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.12, 0.95, 0.25);
leftEye.castShadow = true;
leftEye.receiveShadow = true;
character.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(0.12, 0.95, 0.25);
rightEye.castShadow = true;
rightEye.receiveShadow = true;
character.add(rightEye);

// Pupils
const pupilGeometry = new THREE.SphereGeometry(0.04, 8, 8);
const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
leftPupil.position.set(-0.12, 0.95, 0.28);
leftPupil.castShadow = true;
leftPupil.receiveShadow = true;
character.add(leftPupil);

const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
rightPupil.position.set(0.12, 0.95, 0.28);
rightPupil.castShadow = true;
rightPupil.receiveShadow = true;
character.add(rightPupil);

// Smile
const smileGeometry = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI);
const smileMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const smile = new THREE.Mesh(smileGeometry, smileMaterial);
smile.position.set(0, 0.85, 0.25);
smile.rotation.x = Math.PI;
smile.castShadow = true;
smile.receiveShadow = true;
character.add(smile);

// Arms - shorter and rounder
const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8);
const armMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.1
});
const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.set(-0.35, 0.6, 0);
leftArm.rotation.z = Math.PI / 4;
leftArm.castShadow = true;
leftArm.receiveShadow = true;
character.add(leftArm);

const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.set(0.35, 0.6, 0);
rightArm.rotation.z = -Math.PI / 4;
rightArm.castShadow = true;
rightArm.receiveShadow = true;
character.add(rightArm);

// Hands
const handGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const handMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.1
});
const leftHand = new THREE.Mesh(handGeometry, handMaterial);
leftHand.position.set(-0.5, 0.6, 0);
leftHand.castShadow = true;
leftHand.receiveShadow = true;
character.add(leftHand);

const rightHand = new THREE.Mesh(handGeometry, handMaterial);
rightHand.position.set(0.5, 0.6, 0);
rightHand.castShadow = true;
rightHand.receiveShadow = true;
character.add(rightHand);

// Legs - shorter and rounder
const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8);
const legMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.1
});
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

// Feet
const footGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.2);
const footMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00,
    roughness: 0.5,
    metalness: 0.1
});
const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
leftFoot.position.set(-0.15, -0.15, 0);
leftFoot.castShadow = true;
leftFoot.receiveShadow = true;
character.add(leftFoot);

const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
rightFoot.position.set(0.15, -0.15, 0);
rightFoot.castShadow = true;
rightFoot.receiveShadow = true;
character.add(rightFoot);

// Create kill zone indicator
const killZoneGeometry = new THREE.RingGeometry(0, 5, 32);
const killZoneMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});
const killZone = new THREE.Mesh(killZoneGeometry, killZoneMaterial);
killZone.rotation.x = -Math.PI / 2;
killZone.visible = false;
scene.add(killZone);

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
let moveSpeed = 0.1;
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

// Function to activate superhuman mode
function activateSuperhumanMode() {
    isSuperhuman = true;
    superhumanTimer = 10;
    timerPanel.style.display = 'block';
    
    // Make character glow and bigger
    const glowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        roughness: 0.5,
        metalness: 0.1,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
    });
    
    character.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            child.material = glowMaterial;
        }
    });

    // Double character size
    character.scale.set(2, 2, 2);

    // Show and animate kill zone
    killZone.visible = true;
    const pulseKillZone = () => {
        if (!isSuperhuman) return;
        killZone.material.opacity = 0.2 + Math.sin(Date.now() * 0.003) * 0.1;
        requestAnimationFrame(pulseKillZone);
    };
    pulseKillZone();

    // Double movement speed
    moveSpeed *= 2;

    // Make creatures flee
    foreignCreatures.forEach(creature => {
        creature.setFleeing(true);
    });
}

// Function to deactivate superhuman mode
function deactivateSuperhumanMode() {
    isSuperhuman = false;
    timerPanel.style.display = 'none';
    
    // Reset character appearance and size
    const normalMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        roughness: 0.5,
        metalness: 0.1
    });
    
    character.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            child.material = normalMaterial;
        }
    });

    // Hide kill zone
    killZone.visible = false;

    // Reset character size
    character.scale.set(1, 1, 1);

    // Reset movement speed
    moveSpeed /= 2;

    // Make creatures chase again
    foreignCreatures.forEach(creature => {
        creature.setFleeing(false);
    });
}

// Update animation loop
const animate = (): void => {
    requestAnimationFrame(animate);

    if (!isGameOver) {
        // Update superhuman timer
        if (isSuperhuman) {
            superhumanTimer -= 1/60; // Assuming 60 FPS
            timerPanel.innerHTML = `Superhuman Mode: ${Math.ceil(superhumanTimer)}s`;
            
            if (superhumanTimer <= 0) {
                deactivateSuperhumanMode();
            }
        }

        // Update kill zone position to follow character
        killZone.position.copy(character.position);

        // Handle movement
        if (keys['ArrowLeft']) {
            character.position.x -= moveSpeed;
            // Add walking animation
            leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
            rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
            leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
            rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
            leftHand.rotation.z = Math.sin(Date.now() * 0.01) * 0.3;
            rightHand.rotation.z = -Math.sin(Date.now() * 0.01) * 0.3;
            leftFoot.rotation.x = Math.sin(Date.now() * 0.01) * 0.3;
            rightFoot.rotation.x = -Math.sin(Date.now() * 0.01) * 0.3;
        }
        if (keys['ArrowRight']) {
            character.position.x += moveSpeed;
            // Add walking animation
            leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
            rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
            leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
            rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
            leftHand.rotation.z = Math.sin(Date.now() * 0.01) * 0.3;
            rightHand.rotation.z = -Math.sin(Date.now() * 0.01) * 0.3;
            leftFoot.rotation.x = Math.sin(Date.now() * 0.01) * 0.3;
            rightFoot.rotation.x = -Math.sin(Date.now() * 0.01) * 0.3;
        }
        if (keys['ArrowUp']) {
            character.position.z -= moveSpeed;
            // Add walking animation
            leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
            rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
            leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
            rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
            leftHand.rotation.z = Math.sin(Date.now() * 0.01) * 0.3;
            rightHand.rotation.z = -Math.sin(Date.now() * 0.01) * 0.3;
            leftFoot.rotation.x = Math.sin(Date.now() * 0.01) * 0.3;
            rightFoot.rotation.x = -Math.sin(Date.now() * 0.01) * 0.3;
        }
        if (keys['ArrowDown']) {
            character.position.z += moveSpeed;
            // Add walking animation
            leftLeg.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
            rightLeg.rotation.x = -Math.sin(Date.now() * 0.01) * 0.5;
            leftArm.rotation.z = Math.PI / 4 + Math.sin(Date.now() * 0.01) * 0.2;
            rightArm.rotation.z = -Math.PI / 4 - Math.sin(Date.now() * 0.01) * 0.2;
            leftHand.rotation.z = Math.sin(Date.now() * 0.01) * 0.3;
            rightHand.rotation.z = -Math.sin(Date.now() * 0.01) * 0.3;
            leftFoot.rotation.x = Math.sin(Date.now() * 0.01) * 0.3;
            rightFoot.rotation.x = -Math.sin(Date.now() * 0.01) * 0.3;
        }

        // Handle jumping
        if (isJumping) {
            character.position.y += verticalVelocity;
            verticalVelocity -= gravity;

            // Add jumping animation
            leftLeg.rotation.x = -0.3;
            rightLeg.rotation.x = -0.3;
            leftArm.rotation.z = Math.PI / 4 - 0.3;
            rightArm.rotation.z = -Math.PI / 4 + 0.3;

            // Check if landed
            if (character.position.y <= groundLevel) {
                character.position.y = groundLevel;
                isJumping = false;
                verticalVelocity = 0;
                // Reset to default pose
                leftLeg.rotation.x = 0;
                rightLeg.rotation.x = 0;
                leftArm.rotation.z = Math.PI / 4;
                rightArm.rotation.z = -Math.PI / 4;
            }
        }

        // Reset animations when not moving
        if (!keys['ArrowLeft'] && !keys['ArrowRight'] && !keys['ArrowUp'] && !keys['ArrowDown'] && !isJumping) {
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
            leftArm.rotation.z = Math.PI / 4;
            rightArm.rotation.z = -Math.PI / 4;
            leftHand.rotation.z = 0;
            rightHand.rotation.z = 0;
            leftFoot.rotation.x = 0;
            rightFoot.rotation.x = 0;
        }

        // Check for baguette collection
        baguettes.forEach((baguette, index) => {
            if (!baguette.isCollectedStatus() && baguette.checkCollision(character.position)) {
                baguette.collect();
                scene.remove(baguette.getMesh());
                baguettes.splice(index, 1);
                activateSuperhumanMode();
            }
        });

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

        // Update foreign creatures
        const creaturesToRemove: number[] = [];
        foreignCreatures.forEach((creature, index) => {
            creature.update(character.position);
            
            // Calculate bubble radius based on character size
            const characterRadius = 0.5; // Base character radius
            const bubbleRadius = characterRadius * (isSuperhuman ? 4 : 2); // 2x in normal mode, 4x in superhuman mode
            const maxCheckDistance = 5; // Maximum distance to check for collisions
            
            // Check for collision with bubble
            const distanceToPlayer = creature.getMesh().position.distanceTo(character.position);
            
            // Only process creatures within maxCheckDistance
            if (distanceToPlayer > maxCheckDistance) {
                return;
            }
            
            if (isSuperhuman) {
                if (distanceToPlayer < bubbleRadius) {
                    creaturesToRemove.push(index);
                    score += 100;
                    scorePanel.innerHTML = `Score: ${score}`;
                } else if (distanceToPlayer > bubbleRadius * 2) {
                    creaturesToRemove.push(index);
                    score += 50;
                    scorePanel.innerHTML = `Score: ${score}`;
                }
            } else if (distanceToPlayer < bubbleRadius) {
                isGameOver = true;
                gameOverPanel.style.display = 'block';
            }
        });

        // Remove creatures in reverse order to maintain correct indices
        for (let i = creaturesToRemove.length - 1; i >= 0; i--) {
            const index = creaturesToRemove[i];
            scene.remove(foreignCreatures[index].getMesh());
            foreignCreatures.splice(index, 1);
        }
    }

    renderer.render(scene, camera);
};
animate();

