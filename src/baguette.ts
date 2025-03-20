import * as THREE from "three";

export class Baguette {
    private mesh: THREE.Group;
    private isCollected: boolean = false;

    constructor(x: number, z: number) {
        this.mesh = this.createMesh(x, z);
    }

    private createMesh(x: number, z: number): THREE.Group {
        const baguette = new THREE.Group();
        
        // Create a curved path for the baguette
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.2, 0.1, 0),
            new THREE.Vector3(0.4, 0.15, 0),
            new THREE.Vector3(0.6, 0.1, 0),
            new THREE.Vector3(0.8, 0, 0)
        ]);

        // Main body of the baguette using tube geometry for the curved shape
        const bodyGeometry = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe6b17f, // Golden brown color
            roughness: 0.8,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(2, 1, 1);
        body.castShadow = true;
        body.receiveShadow = true;
        baguette.add(body);

        // Add diagonal slashes on top
        const slashCount = 5;
        for (let i = 0; i < slashCount; i++) {
            const slashGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.2);
            const slashMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xc49455, // Darker brown for the cuts
                roughness: 0.9,
                metalness: 0.1
            });
            const slash = new THREE.Mesh(slashGeometry, slashMaterial);
            
            // Position slashes diagonally along the baguette
            const t = (i + 1) / (slashCount + 1);
            const point = curve.getPoint(t);
            slash.position.set(point.x * 2, point.y + 0.15, 0);
            slash.rotation.z = Math.PI / 4; // 45-degree angle
            slash.rotation.y = Math.PI / 6; // Slight tilt
            baguette.add(slash);
        }

        // Add texture details (bumps and flour spots)
        const bumpCount = 15;
        for (let i = 0; i < bumpCount; i++) {
            const bumpGeometry = new THREE.SphereGeometry(0.03, 4, 4);
            const bumpMaterial = new THREE.MeshStandardMaterial({ 
                color: i % 2 === 0 ? 0xffffff : 0xd4a056, // Alternate between white (flour) and darker brown
                roughness: 0.9,
                metalness: 0.1
            });
            const bump = new THREE.Mesh(bumpGeometry, bumpMaterial);
            
            // Random position along the baguette
            const t = Math.random();
            const point = curve.getPoint(t);
            bump.position.set(
                point.x * 2,
                point.y + (Math.random() * 0.1),
                (Math.random() - 0.5) * 0.2
            );
            baguette.add(bump);
        }

        // Add ends of the baguette
        const endGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
        const endMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xd4a056, // Slightly darker for the ends
            roughness: 0.9,
            metalness: 0.1
        });
        
        const end1 = new THREE.Mesh(endGeometry, endMaterial);
        end1.rotation.z = Math.PI / 2;
        end1.position.set(0, 0, 0);
        baguette.add(end1);
        
        const end2 = new THREE.Mesh(endGeometry, endMaterial);
        end2.rotation.z = Math.PI / 2;
        end2.position.set(1.6, 0, 0);
        baguette.add(end2);

        // Position the entire baguette
        baguette.position.set(x, 1, z);
        baguette.rotation.y = Math.random() * Math.PI * 2; // Random rotation
        
        // Add floating animation
        const animate = () => {
            baguette.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.1;
            requestAnimationFrame(animate);
        };
        animate();

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
        return distance < 1.5; // Slightly larger collision radius to match the new size
    }
} 