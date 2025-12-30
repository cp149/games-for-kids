/**
 * Universal Logger - Smart console wrapper
 * Automatically detects environment and controls logging
 *
 * Usage: Replace console with Logger
 * - console.log() -> Logger.log()
 * - console.error() -> Logger.error()
 *
 * Environment Detection:
 * - Development: localhost, 127.0.0.1, file://
 * - Production: Everything else (GitHub Pages, custom domain)
 */

class Logger {
    constructor() {
        this.isDevelopment = this.detectEnvironment();
        this.levels = {
            LOG: 'log',
            INFO: 'info',
            WARN: 'warn',
            ERROR: 'error',
            DEBUG: 'debug'
        };

        // Always show environment detection result
        if (this.isDevelopment) {
            console.log('%c[Logger] Development mode - logging enabled', 'color: #00ff00; font-weight: bold');
        }
    }

    /**
     * Detect if running in development environment
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        // Development indicators
        const isDev =
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '' ||  // file:// protocol
            protocol === 'file:' ||
            hostname.endsWith('.local') ||
            // Add custom dev domains here
            hostname.includes('dev.') ||
            hostname.includes('test.');

        return isDev;
    }

    /**
     * Format log message with timestamp and context
     */
    formatMessage(level, args) {
        if (!this.isDevelopment) return;

        const timestamp = new Date().toLocaleTimeString();
        const levelColors = {
            log: '#999999',
            info: '#00d4ff',
            warn: '#ffd700',
            error: '#ff0066',
            debug: '#ff00ff'
        };

        const color = levelColors[level] || '#999999';
        return [`%c[${timestamp}]`, `color: ${color}`, ...args];
    }

    /**
     * Log methods - only work in development
     */
    log(...args) {
        if (!this.isDevelopment) return;
        console.log(...this.formatMessage('log', args));
    }

    info(...args) {
        if (!this.isDevelopment) return;
        console.info(...this.formatMessage('info', args));
    }

    warn(...args) {
        if (!this.isDevelopment) return;
        console.warn(...this.formatMessage('warn', args));
    }

    error(...args) {
        // Errors always show (even in production)
        console.error(...this.formatMessage('error', args));
    }

    debug(...args) {
        if (!this.isDevelopment) return;
        console.debug(...this.formatMessage('debug', args));
    }

    /**
     * Group logging
     */
    group(label) {
        if (!this.isDevelopment) return;
        console.group(label);
    }

    groupEnd() {
        if (!this.isDevelopment) return;
        console.groupEnd();
    }

    /**
     * Table display
     */
    table(data) {
        if (!this.isDevelopment) return;
        console.table(data);
    }

    /**
     * Timing utilities
     */
    time(label) {
        if (!this.isDevelopment) return;
        console.time(label);
    }

    timeEnd(label) {
        if (!this.isDevelopment) return;
        console.timeEnd(label);
    }

    /**
     * Assert
     */
    assert(condition, ...args) {
        if (!this.isDevelopment) return;
        console.assert(condition, ...args);
    }

    /**
     * Force log (even in production) - use sparingly!
     */
    forceLog(...args) {
        console.log(...args);
    }

    /**
     * Get environment status
     */
    getEnvironment() {
        return this.isDevelopment ? 'development' : 'production';
    }

    /**
     * Manual environment override (for testing)
     * Add ?debug=true to URL to enable logging in production
     */
    enableDebugMode() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true') {
            this.isDevelopment = true;
            console.log('%c[Logger] Debug mode manually enabled', 'color: #ffd700; font-weight: bold');
        }
    }
}

// Create singleton instance
const LoggerInstance = new Logger();

// Check for debug parameter
LoggerInstance.enableDebugMode();

// ES Module exports
export { LoggerInstance as Logger };
export const setLogLevel = (isDev) => {
    LoggerInstance.isDevelopment = isDev;
};
export default LoggerInstance;

// Also expose globally for easy access (browser compatibility)
if (typeof window !== 'undefined') {
    window.Logger = LoggerInstance;
}
