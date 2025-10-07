/**
 * Particle Effect Manager for KAPLAY games
 * Provides reusable particle effects
 */

export class ParticleEffectManager {
    constructor(k) {
        this.k = k;
    }

    /**
     * Coin burst effect - small coin sprites flying outward
     */
    coinBurst(pos, count = 8, coinSprite = "coin") {
        for (let i = 0; i < count; i++) {
            this.k.add([
                this.k.sprite(coinSprite),
                this.k.pos(pos),
                this.k.scale(0.03),
                this.k.opacity(1),
                this.k.lifespan(0.3),
                this.k.move(this.k.rand(0, 360), this.k.rand(100, 200)),
                this.k.z(10)
            ]);
        }
    }

    /**
     * Color burst - colored squares flying outward
     */
    colorBurst(pos, color, count = 12) {
        for (let i = 0; i < count; i++) {
            this.k.add([
                this.k.rect(6, 6),
                this.k.pos(pos),
                this.k.color(...color),
                this.k.opacity(1),
                this.k.anchor("center"),
                this.k.lifespan(0.5),
                this.k.move(this.k.rand(0, 360), this.k.rand(150, 250)),
                this.k.z(10)
            ]);
        }
    }

    /**
     * Expanding rings effect
     */
    expandingRings(pos, color, count = 3) {
        for (let i = 0; i < count; i++) {
            const delay = i * 0.1;
            this.k.wait(delay, () => {
                const ring = this.k.add([
                    this.k.circle(20 + i * 10),
                    this.k.pos(pos),
                    this.k.outline(4, color),
                    this.k.anchor("center"),
                    this.k.opacity(0.8),
                    this.k.z(99),
                    {
                        expandSpeed: 200
                    }
                ]);

                ring.onUpdate(() => {
                    if (!ring.exists()) return;
                    ring.radius += ring.expandSpeed * this.k.dt();
                    ring.opacity -= this.k.dt() * 2;
                    if (ring.opacity <= 0 && ring.exists()) {
                        this.k.destroy(ring);
                    }
                });
            });
        }
    }

    /**
     * Rainbow burst - multicolored particles
     * @param {Vec2} pos - Position
     * @param {number} count - Number of particles
     * @param {Function} hslToRgb - HSL to RGB converter function
     */
    rainbowBurst(pos, count = 30, hslToRgb) {
        for (let i = 0; i < count; i++) {
            const angle = this.k.rand(0, 360);
            const speed = this.k.rand(150, 400);
            const hue = (i * 12) % 360;
            const rgb = hslToRgb(hue / 360, 1, 0.5);

            this.k.add([
                this.k.rect(10, 10),
                this.k.pos(pos),
                this.k.color(rgb[0], rgb[1], rgb[2]),
                this.k.opacity(1),
                this.k.anchor("center"),
                this.k.lifespan(0.8),
                this.k.move(angle, speed),
                this.k.z(99)
            ]);
        }
    }

    /**
     * Rainbow screen flash
     */
    rainbowFlash() {
        const flashColors = [
            [255, 0, 0],
            [255, 127, 0],
            [255, 255, 0],
            [0, 255, 0],
            [0, 0, 255]
        ];

        for (let i = 0; i < flashColors.length; i++) {
            this.k.wait(i * 0.05, () => {
                this.k.add([
                    this.k.rect(this.k.width(), this.k.height()),
                    this.k.pos(0, 0),
                    this.k.color(flashColors[i]),
                    this.k.opacity(0.2),
                    this.k.z(97),
                    this.k.lifespan(0.05)
                ]);
            });
        }
    }

    /**
     * Landing dust effect
     */
    landingDust(pos, groundY, count = 6) {
        for (let i = 0; i < count; i++) {
            this.k.add([
                this.k.circle(this.k.rand(2, 5)),
                this.k.pos(pos.x + this.k.rand(-15, 15), groundY),
                this.k.color(200, 180, 150),
                this.k.opacity(0.6),
                this.k.lifespan(0.3),
                this.k.move(this.k.rand(0, 360), this.k.rand(50, 100)),
                this.k.z(5)
            ]);
        }
    }

    /**
     * Generic particle explosion
     */
    explosion(pos, {
        count = 20,
        color = [255, 255, 255],
        size = 6,
        speed = [100, 300],
        lifespan = 0.5,
        shape = "rect" // "rect" or "circle"
    } = {}) {
        for (let i = 0; i < count; i++) {
            const particleShape = shape === "circle"
                ? this.k.circle(size / 2)
                : this.k.rect(size, size);

            this.k.add([
                particleShape,
                this.k.pos(pos),
                this.k.color(...color),
                this.k.opacity(1),
                this.k.anchor("center"),
                this.k.lifespan(lifespan),
                this.k.move(this.k.rand(0, 360), this.k.rand(...speed)),
                this.k.z(10)
            ]);
        }
    }
}
