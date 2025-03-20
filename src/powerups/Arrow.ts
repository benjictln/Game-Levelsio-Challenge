import * as THREE from "three";

export class Arrow {
    public static create(): THREE.Group {
        const arrow = new THREE.Group();

        // Create arrow head (triangle)
        const headGeometry = new THREE.ConeGeometry(0.4, 0.8, 4);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffff00, // Bright yellow
            emissive: 0xffff00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const head = new THREE.Mesh(headGeometry, material);
        head.position.y = 0.4;
        head.rotation.x = Math.PI; // Point downward
        arrow.add(head);

        // Create arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const shaft = new THREE.Mesh(shaftGeometry, material);
        shaft.position.y = 0.8;
        arrow.add(shaft);

        // Add pulsing animation
        const animate = () => {
            const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2; // Slower pulse
            arrow.scale.set(scale, scale, scale);
            requestAnimationFrame(animate);
        };
        animate();

        return arrow;
    }
} 