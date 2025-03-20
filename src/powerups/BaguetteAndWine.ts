import * as THREE from "three";
import { PowerUp } from "./PowerUp";
import { Baguette } from "./Baguette";
import { WineBottle } from "./WineBottle";

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

        // Position the entire group
        group.position.set(x, 1, z);
        group.rotation.y = Math.random() * Math.PI * 2; // Random rotation
        
        // Add floating animation
        this.addFloatingAnimation(group);

        return group;
    }
} 