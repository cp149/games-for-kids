import { MagicEffect } from './MagicEffect.js';

/**
 * Base class for stamp-type effects
 */
export class StampEffect extends MagicEffect {
    constructor(id, name, icon, description, isBigStamp = false) {
        super(id, name, icon, description);
        this.isBigStamp = isBigStamp;
    }

    getSpacingMultiplier() {
        return this.isBigStamp ? 5.0 : 3.5;
    }

    isStamp() {
        return true;
    }
}
