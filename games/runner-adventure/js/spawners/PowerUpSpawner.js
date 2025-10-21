/**
 * Power-Up Spawner
 * Spawns power-ups (speed boost, slow motion, super jump)
 */

import { POWERUP_TYPES } from '../core/config.js';

export class PowerUpSpawner {
    constructor(k, groundY, speed, getGameSpeed) {
        this.k = k;
        this.groundY = groundY;
        this.speed = speed;
        this.getGameSpeed = getGameSpeed;
        this.powerUpTypes = POWERUP_TYPES;
    }

    spawn() {
        const powerUpType = this.k.choose(this.powerUpTypes);
        const yPos = this.k.choose([
            this.groundY - 40,  // Low
            this.groundY - 100, // Mid
            this.groundY - 160  // High
        ]);

        const powerUp = this.k.add([
            this.k.text(powerUpType.emoji, { size: 40 }),
            this.k.pos(this.k.width(), yPos),
            this.k.area({ scale: 0.8 }),
            this.k.anchor("center"),
            this.k.offscreen({ destroy: true }),
            this.k.z(2),
            "powerup",
            {
                powerUpType: powerUpType.name,
                duration: powerUpType.duration,
                description: powerUpType.description,
                floatTime: 0,
                baseSpeed: this.speed,
                baseYPos: yPos
            }
        ]);

        // Glow effect
        const glow = this.k.add([
            this.k.circle(30),
            this.k.pos(this.k.width(), yPos),
            this.k.color(powerUpType.color[0], powerUpType.color[1], powerUpType.color[2]),
            this.k.opacity(0.5),
            this.k.anchor("center"),
            this.k.offscreen({ destroy: true }),
            this.k.z(1),
            {
                pulseTime: 0
            }
        ]);

        // Movement and floating animation
        powerUp.onUpdate(() => {
            if (!powerUp.exists()) return;

            const currentSpeed = this.getGameSpeed ? this.getGameSpeed() : 1;
            const speed = powerUp.baseSpeed * currentSpeed;
            powerUp.pos.x -= speed * this.k.dt();

            powerUp.floatTime += this.k.dt();
            const floatOffset = Math.sin(powerUp.floatTime * 3) * 5;
            powerUp.pos.y = powerUp.baseYPos + floatOffset;

            if (glow.exists()) {
                glow.pos.x -= speed * this.k.dt();
                glow.pos.y = powerUp.baseYPos + floatOffset;
            }
        });

        // Pulsing glow
        glow.onUpdate(() => {
            if (!glow.exists()) return;
            glow.pulseTime += this.k.dt();
            glow.opacity = 0.2 + Math.sin(glow.pulseTime * 5) * 0.15;
            const scale = 1 + Math.sin(glow.pulseTime * 5) * 0.2;
            glow.scale = this.k.vec2(scale, scale);
        });

        powerUp.glowEffect = glow;
        return powerUp;
    }

    startSpawning(interval = 12) {
        return this.k.loop(interval, () => {
            this.spawn();
        });
    }
}
