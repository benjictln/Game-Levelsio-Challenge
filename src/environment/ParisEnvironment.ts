import * as THREE from "three";

export class ParisEnvironment {
    private buildings: THREE.Group[] = [];
    private street: THREE.Mesh;
    private seine: THREE.Mesh;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createStreet();
        this.createSeine();
        this.createBuildings();
    }

    private createStreet() {
        // Create the street with pavement
        const streetGeometry = new THREE.PlaneGeometry(100, 100);
        const streetMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333, // Dark gray for asphalt
            roughness: 0.8,
            metalness: 0.2
        });
        this.street = new THREE.Mesh(streetGeometry, streetMaterial);
        this.street.rotation.x = -Math.PI / 2;
        this.street.receiveShadow = true;
        this.scene.add(this.street);

        // Add pavement edges
        const pavementGeometry = new THREE.PlaneGeometry(100, 8); // Wider pavement
        const pavementMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc, // Light gray for pavement
            roughness: 0.7,
            metalness: 0.1
        });

        // Add pavement on both sides of the street
        const leftPavement = new THREE.Mesh(pavementGeometry, pavementMaterial);
        leftPavement.rotation.x = -Math.PI / 2;
        leftPavement.position.z = -46; // Adjusted position
        leftPavement.receiveShadow = true;
        this.scene.add(leftPavement);

        const rightPavement = new THREE.Mesh(pavementGeometry, pavementMaterial);
        rightPavement.rotation.x = -Math.PI / 2;
        rightPavement.position.z = 46; // Adjusted position
        rightPavement.receiveShadow = true;
        this.scene.add(rightPavement);

        // Add pavement texture details
        const detailGeometry = new THREE.PlaneGeometry(100, 0.2); // Thin lines for texture
        const detailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xbbbbbb, // Slightly darker gray for texture
            roughness: 0.6,
            metalness: 0.1
        });

        // Add texture lines to both pavements
        for (let i = 0; i < 10; i++) {
            // Left pavement lines
            const leftDetail = new THREE.Mesh(detailGeometry, detailMaterial);
            leftDetail.rotation.x = -Math.PI / 2;
            leftDetail.position.z = -46 + (i - 4) * 1.6; // Space lines evenly
            leftDetail.receiveShadow = true;
            this.scene.add(leftDetail);

            // Right pavement lines
            const rightDetail = new THREE.Mesh(detailGeometry, detailMaterial);
            rightDetail.rotation.x = -Math.PI / 2;
            rightDetail.position.z = 46 + (i - 4) * 1.6; // Space lines evenly
            rightDetail.receiveShadow = true;
            this.scene.add(rightDetail);
        }
    }

    private createSeine() {
        // Create the Seine river
        const seineGeometry = new THREE.PlaneGeometry(100, 20);
        const seineMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1e90ff, // River blue
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        this.seine = new THREE.Mesh(seineGeometry, seineMaterial);
        this.seine.rotation.x = -Math.PI / 2;
        this.seine.position.y = -0.1; // Slightly below street level
        this.seine.receiveShadow = true;
        this.scene.add(this.seine);
    }

    private createBuildings() {
        // Create Haussmannian buildings
        for (let i = 0; i < 20; i++) {
            const building = this.createHaussmannianBuilding();
            
            // Position buildings along the street
            const x = (Math.random() - 0.5) * 90;
            const z = Math.random() < 0.5 ? -55 : 55; // Place on either side of the street
            building.position.set(x, 0, z);
            
            this.buildings.push(building);
            this.scene.add(building);
        }
    }

    private createHaussmannianBuilding(): THREE.Group {
        const building = new THREE.Group();
        
        // Main building body
        const height = 10 + Math.random() * 5; // Random height between 10 and 15
        const width = 8 + Math.random() * 4; // Random width between 8 and 12
        const depth = 8 + Math.random() * 4; // Random depth between 8 and 12
        
        const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf5f5f5, // Light stone color
            roughness: 0.7,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = height / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        building.add(body);

        // Add windows
        const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x87ceeb, // Sky blue for windows
            transparent: true,
            opacity: 0.8
        });

        // Add windows in rows
        for (let y = 1; y < height - 1; y += 3) {
            for (let x = -width/2 + 1; x < width/2 - 1; x += 2.5) {
                // Front windows
                const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                frontWindow.position.set(x, y, depth/2 + 0.1);
                building.add(frontWindow);

                // Back windows
                const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                backWindow.position.set(x, y, -depth/2 - 0.1);
                building.add(backWindow);
            }
        }

        // Add roof
        const roofGeometry = new THREE.ConeGeometry(width/2, height/4, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513, // Brown for roof
            roughness: 0.8,
            metalness: 0.2
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height + height/8;
        roof.castShadow = true;
        roof.receiveShadow = true;
        building.add(roof);

        return building;
    }

    public checkCollision(position: THREE.Vector3): boolean {
        // Check if player is in the Seine
        if (position.y < 0) {
            return true; // Player is in water
        }

        // Check collision with buildings
        for (const building of this.buildings) {
            const buildingBox = new THREE.Box3().setFromObject(building);
            if (buildingBox.containsPoint(position)) {
                return true; // Player is inside a building
            }
        }

        return false; // No collision
    }
} 