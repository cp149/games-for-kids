/**
 * Obstacle Spawner
 * Spawns cactus obstacles that player must jump over
 */

export class ObstacleSpawner {
    constructor(k, groundY, speed, getGameSpeed) {
        this.k = k;
        this.groundY = groundY;
        this.speed = speed;
        this.getGameSpeed = getGameSpeed; // Function to get current gameSpeed
        this.spawnInterval = 1.5;
    }

    spawn() {
        const obstacle = this.k.add([
            this.k.sprite("obstacle"),
            this.k.pos(this.k.width(), this.groundY - 20),
            this.k.area({ scale: 0.3 }),
            this.k.scale(0.08),
            this.k.anchor("center"),
            this.k.offscreen({ destroy: true }),
            "obstacle",
            {
                baseSpeed: this.speed
            }
        ]);

        // Move based on current gameSpeed
        obstacle.onUpdate(() => {
            const currentSpeed = this.getGameSpeed ? this.getGameSpeed() : 1;
            obstacle.pos.x -= obstacle.baseSpeed * currentSpeed * this.k.dt();
        });

        return obstacle;
    }

    startSpawning() {
        return this.k.loop(this.spawnInterval, () => {
            this.spawn();
        });
    }
}
