/**
 * Coin Spawner
 * Spawns different types of coins with varying values and special effects
 */

import { COIN_TYPES } from '../core/config.js';

export class CoinSpawner {
    constructor(k, groundY, speed, getGameSpeed) {
        this.k = k;
        this.groundY = groundY;
        this.speed = speed;
        this.getGameSpeed = getGameSpeed;
        this.coinTypes = COIN_TYPES;
    }

    selectCoinType() {
        const rand = this.k.rand(0, 100);
        let cumulative = 0;

        for (const type of this.coinTypes) {
            cumulative += type.probability;
            if (rand < cumulative) {
                return type;
            }
        }

        return this.coinTypes[this.coinTypes.length - 1];
    }

    spawn() {
        const yPos = this.k.rand(this.groundY - 180, this.groundY - 80);
        const coinType = this.selectCoinType();

        const coin = this.k.add([
            this.k.sprite("coin"),
            this.k.pos(this.k.width(), yPos),
            this.k.area({ scale: 0.8 }),
            this.k.scale(coinType.scale),
            this.k.anchor("center"),
            this.k.color(...coinType.color),
            this.k.offscreen({ destroy: true }),
            "collectible",
            {
                baseSpeed: this.speed
            }
        ]);

        // Move based on current gameSpeed
        coin.onUpdate(() => {
            const currentSpeed = this.getGameSpeed ? this.getGameSpeed() : 1;
            const speed = coin.baseSpeed * currentSpeed;
            coin.pos.x -= speed * this.k.dt();

            if (coin.glowEffect && coin.glowEffect.exists()) {
                coin.glowEffect.pos.x -= speed * this.k.dt();
            }
        });

        // Set custom properties
        coin.coinType = coinType.name;
        coin.coinValue = coinType.value;
        coin.isSpecial = coinType.special;

        // Special effects for star
        if (coinType.name === "star") {
            coin.sparkleTimer = 0;
            coin.onUpdate(() => {
                if (!coin.exists() || coin.pos.x < -100) return;

                coin.angle += 360 * this.k.dt();

                if (coin.pos.x < this.k.width() + 50) {
                    coin.sparkleTimer += this.k.dt();
                    if (coin.sparkleTimer >= 0.25) {
                        coin.sparkleTimer = 0;
                        const angle = this.k.rand(0, 360);
                        const dist = this.k.rand(15, 25);
                        const sparklePos = coin.pos.add(this.k.Vec2.fromAngle(angle).scale(dist));

                        this.k.add([
                            this.k.rect(4, 4),
                            this.k.pos(sparklePos),
                            this.k.color(255, 255, 200),
                            this.k.opacity(1),
                            this.k.anchor("center"),
                            this.k.lifespan(0.3),
                            this.k.z(5)
                        ]);
                    }
                }
            });
        } else if (coinType.rotate) {
            coin.onUpdate(() => {
                if (!coin.exists()) return;
                coin.angle += 360 * this.k.dt();
            });
        }

        // Glow effect for special coins
        if (coinType.special) {
            const glow = this.k.add([
                this.k.circle(coinType.name === "star" ? 20 : 15),
                this.k.pos(coin.pos),
                this.k.color(...coinType.color),
                this.k.opacity(0.35),
                this.k.anchor("center"),
                this.k.z(-1),
                this.k.offscreen({ destroy: true })
            ]);

            const pulseSpeed = coinType.name === "star" ? 3 : 2;
            glow.onUpdate(() => {
                if (!coin.exists()) {
                    if (glow.exists()) this.k.destroy(glow);
                    return;
                }
                glow.pos = coin.pos;
                const pulse = 1 + Math.sin(this.k.time() * pulseSpeed) * 0.3;
                glow.scale = pulse;
            });

            coin.glowEffect = glow;
        }

        return coin;
    }

    startSpawning(interval = 3) {
        return this.k.loop(interval, () => {
            this.spawn();
        });
    }
}
