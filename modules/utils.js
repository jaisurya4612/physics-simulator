// modules/utils.js
/**
 * Utility functions
 */

class MathUtils {
    static degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    static radiansToDegrees(radians) {
        return (radians * 180) / Math.PI;
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    static magnitude(vx, vy) {
        return Math.sqrt(vx ** 2 + vy ** 2);
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
}