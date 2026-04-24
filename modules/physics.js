/**
 * Physics Engine Module
 * Handles all physics calculations for kinematics simulation
 */

class PhysicsEngine {
    constructor() {
        this.objects = [];
        this.time = 0;
        this.deltaTime = 0.016; // ~60 FPS
        this.gravity = 9.81;
        this.airResistance = false;
        this.dragCoefficient = 0.1;
        this.collisionEnabled = true;
    }

    /**
     * Create a projectile object
     */
    createProjectile(config) {
        return {
            x: config.x || 0,
            y: config.y || 0,
            vx: config.vx || 0,
            vy: config.vy || 0,
            ax: config.ax || 0,
            ay: -this.gravity,
            mass: config.mass || 1,
            radius: config.radius || 5,
            color: config.color || '#3498db',
            trail: [],
            active: true,
            id: Math.random()
        };
    }

    /**
     * Update object motion using kinematic equations
     */
    updateObject(obj, dt) {
        if (!obj.active) return;

        // Apply air resistance
        if (this.airResistance) {
            const velocity = Math.sqrt(obj.vx ** 2 + obj.vy ** 2);
            if (velocity > 0) {
                const dragForce = this.dragCoefficient * velocity;
                const dragAx = -(dragForce / obj.mass) * (obj.vx / velocity);
                const dragAy = -(dragForce / obj.mass) * (obj.vy / velocity);
                obj.ax += dragAx;
                obj.ay -= (this.gravity - dragAy);
            }
        }

        // Update velocity: v = v + a*t
        obj.vx += obj.ax * dt;
        obj.vy += obj.ay * dt;

        // Update position: x = x + v*t
        obj.x += obj.vx * dt;
        obj.y += obj.vy * dt;

        // Store trail for visualization
        obj.trail.push({ x: obj.x, y: obj.y, t: this.time });
        if (obj.trail.length > 500) {
            obj.trail.shift();
        }

        // Check ground collision
        if (obj.y >= 0) {
            obj.active = false;
        }
    }

    /**
     * Projectile motion equations
     * x = u*cos(θ)*t
     * y = u*sin(θ)*t - (1/2)*g*t²
     */
    calculateProjectilePosition(initialVelocity, angle, time) {
        const angleRad = (angle * Math.PI) / 180;
        const u = initialVelocity;
        const g = this.gravity;

        const x = u * Math.cos(angleRad) * time;
        const y = u * Math.sin(angleRad) * time - 0.5 * g * time * time;

        return { x, y };
    }

    /**
     * Calculate velocity at time t
     */
    calculateVelocity(initialVelocity, angle, time) {
        const angleRad = (angle * Math.PI) / 180;
        const u = initialVelocity;
        const g = this.gravity;

        const vx = u * Math.cos(angleRad);
        const vy = u * Math.sin(angleRad) - g * time;

        const velocity = Math.sqrt(vx ** 2 + vy ** 2);
        const direction = Math.atan2(vy, vx) * (180 / Math.PI);

        return { vx, vy, velocity, direction };
    }

    /**
     * Calculate maximum height
     */
    calculateMaxHeight(initialVelocity, angle) {
        const angleRad = (angle * Math.PI) / 180;
        const u = initialVelocity;
        const g = this.gravity;

        const h = (u * Math.sin(angleRad)) ** 2 / (2 * g);
        return h;
    }

    /**
     * Calculate range (horizontal distance)
     */
    calculateRange(initialVelocity, angle) {
        const angleRad = (angle * Math.PI) / 180;
        const u = initialVelocity;
        const g = this.gravity;

        const range = (u ** 2 * Math.sin(2 * angleRad)) / g;
        return range;
    }

    /**
     * Calculate time of flight
     */
    calculateTimeOfFlight(initialVelocity, angle) {
        const angleRad = (angle * Math.PI) / 180;
        const u = initialVelocity;
        const g = this.gravity;

        const t = (2 * u * Math.sin(angleRad)) / g;
        return Math.max(0, t);
    }

    /**
     * Free fall simulation
     */
    calculateFreefall(initialHeight, time) {
        const g = this.gravity;
        const y = initialHeight - 0.5 * g * time * time;
        const vy = -g * time;
        const velocity = Math.abs(vy);

        return { y: Math.max(0, y), vy, velocity };
    }

    /**
     * Horizontal projection
     */
    calculateHorizontalProjection(initialVelocity, initialHeight, time) {
        const g = this.gravity;
        const x = initialVelocity * time;
        const y = initialHeight - 0.5 * g * time * time;
        const vy = -g * time;
        const velocity = Math.sqrt(initialVelocity ** 2 + vy ** 2);

        return { x, y: Math.max(0, y), vx: initialVelocity, vy, velocity };
    }

    /**
     * Two-body gravitational attraction
     */
    calculateTwoBodyGravity(obj1, obj2, dt, G = 6.674e-11) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist === 0) return;

        const force = (G * obj1.mass * obj2.mass) / distSq;
        const ax = (force / obj1.mass) * (dx / dist);
        const ay = (force / obj1.mass) * (dy / dist);

        obj1.ax += ax;
        obj1.ay += ay;
    }

    /**
     * Elastic collision detection and response
     */
    checkCollision(obj1, obj2) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = obj1.radius + obj2.radius;

        return dist < minDist;
    }

    /**
     * Handle elastic collision
     */
    resolveCollision(obj1, obj2) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return;

        // Normal vector
        const nx = dx / dist;
        const ny = dy / dist;

        // Relative velocity
        const dvx = obj2.vx - obj1.vx;
        const dvy = obj2.vy - obj1.vy;

        // Relative velocity along collision normal
        const dvn = dvx * nx + dvy * ny;

        // Don't resolve if objects are separating
        if (dvn >= 0) return;

        // Impulse scalar for elastic collision
        const m1 = obj1.mass;
        const m2 = obj2.mass;
        const j = -(1 + 0.8) * dvn / (1 / m1 + 1 / m2);

        // Apply impulse
        obj1.vx -= (j / m1) * nx;
        obj1.vy -= (j / m1) * ny;
        obj2.vx += (j / m2) * nx;
        obj2.vy += (j / m2) * ny;

        // Separate objects
        const overlap = obj1.radius + obj2.radius - dist;
        const sepx = (overlap / 2) * nx;
        const sepy = (overlap / 2) * ny;

        obj1.x -= sepx;
        obj1.y -= sepy;
        obj2.x += sepx;
        obj2.y += sepy;
    }

    /**
     * Update all objects
     */
    update(dt) {
        this.time += dt;
        this.deltaTime = dt;

        // Update each object
        for (let obj of this.objects) {
            this.updateObject(obj, dt);
        }

        // Check collisions
        if (this.collisionEnabled) {
            for (let i = 0; i < this.objects.length; i++) {
                for (let j = i + 1; j < this.objects.length; j++) {
                    if (this.checkCollision(this.objects[i], this.objects[j])) {
                        this.resolveCollision(this.objects[i], this.objects[j]);
                    }
                }
            }
        }
    }

    /**
     * Reset simulation
     */
    reset() {
        this.objects = [];
        this.time = 0;
    }

    /**
     * Set gravity
     */
    setGravity(g) {
        this.gravity = g;
        for (let obj of this.objects) {
            obj.ay = -this.gravity;
        }
    }

    /**
     * Add object to simulation
     */
    addObject(obj) {
        this.objects.push(obj);
    }

    /**
     * Get active objects
     */
    getActiveObjects() {
        return this.objects.filter(obj => obj.active);
    }

    /**
     * Get object statistics
     */
    getStats(obj) {
        const velocity = Math.sqrt(obj.vx ** 2 + obj.vy ** 2);
        const kinetic = 0.5 * obj.mass * velocity ** 2;
        const potential = obj.mass * this.gravity * Math.max(0, obj.y);
        const total = kinetic + potential;

        return {
            velocity,
            kinetic,
            potential,
            totalEnergy: total
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}