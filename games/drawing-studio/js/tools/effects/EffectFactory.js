/**
 * Factory for creating magic effect instances
 */

// Basic effects
import { RainbowEffect } from './basic/RainbowEffect.js';
import { StarEffect } from './basic/StarEffect.js';
import { FireworkEffect } from './basic/FireworkEffect.js';
import { CoinEffect } from './basic/CoinEffect.js';
import { SandEffect } from './basic/SandEffect.js';
import { RainbowSandEffect } from './basic/RainbowSandEffect.js';

// Stamp effects
import { ButterflyStamp } from './stamps/ButterflyStamp.js';
import { FlowerStamp } from './stamps/FlowerStamp.js';
import { CatFaceStamp } from './stamps/CatFaceStamp.js';
import { DogFaceStamp } from './stamps/DogFaceStamp.js';
import { RabbitStamp } from './stamps/RabbitStamp.js';
import { HeartStamp } from './stamps/HeartStamp.js';
import { FrogStamp } from './stamps/FrogStamp.js';
import { SnowflakeStamp } from './stamps/SnowflakeStamp.js';
import { DinosaurStamp } from './stamps/DinosaurStamp.js';
import { StarfishStamp } from './stamps/StarfishStamp.js';
import { ParrotStamp } from './stamps/ParrotStamp.js';
import { MushroomStamp } from './stamps/MushroomStamp.js';
import { IcecreamStamp } from './stamps/IcecreamStamp.js';
import { LightningStamp } from './stamps/LightningStamp.js';
import { GoldStamp } from './stamps/GoldStamp.js';
import { GrassStamp } from './stamps/GrassStamp.js';
import { TreeStamp } from './stamps/TreeStamp.js';

export class EffectFactory {
    static effectRegistry = new Map();

    /**
     * Initialize factory with all available effects
     */
    static initialize() {
        // Register basic effects
        this.register(new RainbowEffect());
        this.register(new StarEffect());
        this.register(new FireworkEffect());
        this.register(new CoinEffect());
        this.register(new SandEffect());
        this.register(new RainbowSandEffect());

        // Register stamp effects
        this.register(new ButterflyStamp());
        this.register(new FlowerStamp());
        this.register(new CatFaceStamp());
        this.register(new DogFaceStamp());
        this.register(new RabbitStamp());
        this.register(new HeartStamp());
        this.register(new FrogStamp());
        this.register(new SnowflakeStamp());
        this.register(new DinosaurStamp());
        this.register(new StarfishStamp());
        this.register(new ParrotStamp());
        this.register(new MushroomStamp());
        this.register(new IcecreamStamp());
        this.register(new LightningStamp());
        this.register(new GoldStamp());
        this.register(new GrassStamp());
        this.register(new TreeStamp());
    }

    /**
     * Register an effect instance
     */
    static register(effectInstance) {
        this.effectRegistry.set(effectInstance.id, effectInstance);
    }

    /**
     * Get effect instance by ID
     */
    static getEffect(effectId) {
        const effect = this.effectRegistry.get(effectId);
        if (!effect) {
            console.warn(`Effect "${effectId}" not found, using rainbow as default`);
            return this.effectRegistry.get('rainbow');
        }
        return effect;
    }

    /**
     * Get all registered effects
     */
    static getAllEffects() {
        return Array.from(this.effectRegistry.values());
    }

    /**
     * Get all effect info for UI
     */
    static getAllEffectInfo() {
        return this.getAllEffects().map(effect => effect.getInfo());
    }
}

// Initialize factory when module loads
EffectFactory.initialize();
