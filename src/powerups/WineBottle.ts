import * as THREE from "three";

export class WineBottle {
    public static create(): THREE.Group {
        const bottle = new THREE.Group();

        // Bottle body
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a0404, // Deep red wine color
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        body.receiveShadow = true;
        bottle.add(body);

        // Bottle neck
        const neckGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 16);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.y = 1.4;
        neck.castShadow = true;
        neck.receiveShadow = true;
        bottle.add(neck);

        // Cork
        const corkGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16);
        const corkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown cork color
            roughness: 0.9,
            metalness: 0.1
        });
        const cork = new THREE.Mesh(corkGeometry, corkMaterial);
        cork.position.y = 1.65;
        cork.castShadow = true;
        cork.receiveShadow = true;
        bottle.add(cork);

        // Wine label
        const labelGeometry = new THREE.PlaneGeometry(0.4, 0.5);
        const labelMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5dc, // Beige color
            roughness: 0.9,
            metalness: 0.1
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(0, 0.6, 0.16);
        label.rotation.x = 0;
        bottle.add(label);

        // Add some decorative text-like details to the label
        const detailGeometry = new THREE.PlaneGeometry(0.3, 0.05);
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: 0x800000, // Dark red color
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Add three lines of "text"
        for (let i = 0; i < 3; i++) {
            const detail = new THREE.Mesh(detailGeometry, detailMaterial);
            detail.position.set(0, 0.7 - (i * 0.15), 0.17);
            bottle.add(detail);
        }

        return bottle;
    }
} 