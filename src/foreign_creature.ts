import * as THREE from "three";

export class ForeignCreature {
    private mesh: THREE.Group;
    private speed: number;

    constructor(x: number, z: number, speed: number = 0.02) {
        this.speed = speed;
        this.mesh = this.createMesh(x, z);
    }

    private createMesh(x: number, z: number): THREE.Group {
        const creature = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.3;
        body.castShadow = true;
        body.receiveShadow = true;
        creature.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.7;
        head.castShadow = true;
        head.receiveShadow = true;
        creature.add(head);

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 0.4, 6);
        const tailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.2
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.y = 0.2;
        tail.position.z = -0.3;
        tail.rotation.x = Math.PI / 4;
        tail.castShadow = true;
        tail.receiveShadow = true;
        creature.add(tail);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 6);
        const legMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.2
        });

        // Front legs
        const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontLeftLeg.position.set(-0.15, 0.1, 0.2);
        frontLeftLeg.rotation.x = Math.PI / 4;
        frontLeftLeg.castShadow = true;
        frontLeftLeg.receiveShadow = true;
        creature.add(frontLeftLeg);

        const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        frontRightLeg.position.set(0.15, 0.1, 0.2);
        frontRightLeg.rotation.x = Math.PI / 4;
        frontRightLeg.castShadow = true;
        frontRightLeg.receiveShadow = true;
        creature.add(frontRightLeg);

        // Back legs
        const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
        backLeftLeg.position.set(-0.15, 0.1, -0.2);
        backLeftLeg.rotation.x = -Math.PI / 4;
        backLeftLeg.castShadow = true;
        backLeftLeg.receiveShadow = true;
        creature.add(backLeftLeg);

        const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
        backRightLeg.position.set(0.15, 0.1, -0.2);
        backRightLeg.rotation.x = -Math.PI / 4;
        backRightLeg.castShadow = true;
        backRightLeg.receiveShadow = true;
        creature.add(backRightLeg);

        creature.position.set(x, 0, z);
        return creature;
    }

    public getMesh(): THREE.Group {
        return this.mesh;
    }

    public getPosition(): THREE.Vector3 {
        return this.mesh.position;
    }

    public update(targetPosition: THREE.Vector3): void {
        // Calculate direction to target
        const direction = new THREE.Vector3();
        direction.subVectors(targetPosition, this.mesh.position).normalize();
        
        // Move towards target
        this.mesh.position.x += direction.x * this.speed;
        this.mesh.position.z += direction.z * this.speed;
        
        // Make creature face the target
        this.mesh.lookAt(targetPosition);
    }

    public checkCollision(targetPosition: THREE.Vector3): boolean {
        const distance = this.mesh.position.distanceTo(targetPosition);
        return distance < 1; // Collision radius
    }
} 