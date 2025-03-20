import * as THREE from "three";
import { PowerUp } from "./PowerUp";
import { Baguette } from "./Baguette";
import { WineBottle } from "./WineBottle";
import { Arrow } from "./Arrow";

export class BaguetteAndWine extends PowerUp {
    protected createMesh(x: number, z: number): THREE.Group {
        const group = new THREE.Group();
        
        // Create baguette
        const baguette = Baguette.create();
        baguette.position.x += 0.4; // Offset to make room for wine bottle
        group.add(baguette);

        // Create wine bottle
        const bottle = WineBottle.create();
        bottle.position.x -= 0.4; // Offset to the other side
        group.add(bottle);

        // Create floating arrow
        const arrow = Arrow.create();
        arrow.position.y = 2.5; // Position above the items
        
        // Add bouncing animation to the arrow
        const arrowBounce = () => {
            arrow.position.y = 2.5 + Math.sin(Date.now() * 0.003) * 0.3; // Slower, larger bounce
            requestAnimationFrame(arrowBounce);
        };
        arrowBounce();
        
        group.add(arrow);

        // Position the entire group
        group.position.set(x, 1, z);
        group.rotation.y = Math.random() * Math.PI * 2; // Random rotation
        
        // Add floating animation
        this.addFloatingAnimation(group);

        return group;
    }

    public collect(): void {
        super.collect();
        // Make the arrow disappear when collected
        const arrow = this.mesh.children[2]; // The arrow is the third child
        if (arrow) {
            arrow.visible = false;
        }
    }
} 