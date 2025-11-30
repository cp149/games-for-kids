/**
 * Visual Constants
 * Centralized visual effect parameters for renderer
 */

export const VISUAL_CONSTANTS = {
  // Glow effects
  GLOW_SHADOW_BLUR: 20,
  GLOW_OPACITY: 0.1,

  // Hint arrow animation
  HINT_ARROW_BOUNCE_AMPLITUDE: 15,
  HINT_ARROW_GLOW_BLUR: 30,

  // Particle system
  MAX_PARTICLES: 500,

  // UI update throttling
  STATS_UPDATE_INTERVAL_MS: 100, // 10fps

  // Signal propagation timing
  SIGNAL_PROPAGATION_DELAY_MS: 1000,
  RIPPLE_EFFECT_DELAY_MS: 100,
  RIPPLE_EFFECT_COUNT: 3,
  RIPPLE_BASE_RADIUS: 60,
  RIPPLE_RADIUS_INCREMENT: 20,

  // Win animation
  WIN_OVERLAY_DELAY_MS: 2000,
  CONFETTI_COUNT: 20,
  SUCCESS_EXPLOSION_PARTICLES: 30
};

export default VISUAL_CONSTANTS;
