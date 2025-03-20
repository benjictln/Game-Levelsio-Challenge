import * as THREE from "three";

export class Baguette {
    private mesh: THREE.Group;
    private isCollected: boolean = false;

    constructor(x: number, z: number) {
        this.mesh = this.createMesh(x, z);
    }

    private createMesh(x: number, z: number): THREE.Group {
        const baguette = new THREE.Group();
        
        // Main body of the baguette
        const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf4d03f,
            roughness: 0.7,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        body.receiveShadow = true;
        baguette.add(body);

        // Add some texture to make it look more like a baguette
        const textureGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const textureMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe67e22,
            roughness: 0.8,
            metalness: 0.1
        });
        const texture = new THREE.Mesh(textureGeometry, textureMaterial);
        texture.position.y = 0.75;
        texture.scale.set(0.95, 0.95, 0.95);
        texture.castShadow = true;
        texture.receiveShadow = true;
        baguette.add(texture);

        baguette.position.set(x, 0.75, z);
        return baguette;
    }

    public getMesh(): THREE.Group {
        return this.mesh;
    }

    public getPosition(): THREE.Vector3 {
        return this.mesh.position;
    }

    public collect(): void {
        this.isCollected = true;
    }

    public isCollectedStatus(): boolean {
        return this.isCollected;
    }

    public checkCollision(targetPosition: THREE.Vector3): boolean {
        const distance = this.mesh.position.distanceTo(targetPosition);
        return distance < 1; // Collision radius
    }
} 