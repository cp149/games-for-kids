/**
 * Ground Decorator Spawner
 * Spawns decorative elements on the ground (grass, bushes, pebbles, mushrooms)
 */

import { DECO_CONFIGS } from '../core/config.js';

export class GroundDecorator {
    constructor(k, groundY, speed) {
        this.k = k;
        this.groundY = groundY;
        this.speed = speed;
        this.decoConfigs = DECO_CONFIGS;
        this.spawnInterval = 0.5;
        this.minScale = 0.13;
        this.maxScale = 0.19;
    }

    spawn() {
        const config = this.k.choose(this.decoConfigs);
        const scale = this.k.rand(this.minScale, this.maxScale);
        const yOffset = config.offset;

        this.k.add([
            this.k.sprite("ground-deco", { frame: config.frame }),
            this.k.pos(this.k.width(), this.groundY + yOffset),
            this.k.scale(scale),
            this.k.anchor("center"),
            this.k.move(this.k.LEFT, this.speed),
            this.k.offscreen({ destroy: true }),
            this.k.z(-1),
            `ground-deco-${config.name}`
        ]);
    }

    startSpawning() {
        return this.k.loop(this.spawnInterval, () => {
            this.spawn();
        });
    }
}
