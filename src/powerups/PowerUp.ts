import * as THREE from "three";

export abstract class PowerUp {
    protected mesh: THREE.Group;
    protected isCollected: boolean = false;

    constructor(x: number, z: number) {
        this.mesh = this.createMesh(x, z);
    }

    protected abstract createMesh(x: number, z: number): THREE.Group;

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
        return distance < 1.5;
    }

    protected addFloatingAnimation(group: THREE.Group): void {
        const animate = () => {
            group.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.1;
            requestAnimationFrame(animate);
        };
        animate();
    }
} 