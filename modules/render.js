/**
 * Render Module
 * Handles all canvas rendering and visualization
 */

class Renderer {
    constructor(canvasId, width = 800, height = 600) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.scale = 30; // pixels per meter
        this.showTrajectory = true;
        this.showVectors = true;
        this.showGrid = true;
        this.centerX = this.width / 2;
        this.centerY = this.height - 50;
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Draw grid
     */
    drawGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x < this.width; x += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < this.height; y += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Draw axes
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;

        // Ground line
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.width, this.centerY);
        this.ctx.stroke();

        // Origin line
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, this.height);
        this.ctx.stroke();
    }

    /**
     * Convert world coordinates to canvas coordinates
     */
    worldToCanvas(x, y) {
        return {
            x: this.centerX + x * this.scale,
            y: this.centerY - y * this.scale
        };
    }

    /**
     * Draw a projectile
     */
    drawProjectile(obj) {
        const pos = this.worldToCanvas(obj.x, obj.y);

        // Draw trajectory
        if (this.showTrajectory && obj.trail.length > 1) {
            this.ctx.strokeStyle = obj.color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();

            const startPos = this.worldToCanvas(obj.trail[0].x, obj.trail[0].y);
            this.ctx.moveTo(startPos.x, startPos.y);

            for (let point of obj.trail) {
                const p = this.worldToCanvas(point.x, point.y);
                this.ctx.lineTo(p.x, p.y);
            }

            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        }

        // Draw object
        this.ctx.fillStyle = obj.color;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, obj.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw outline
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw velocity vector
        if (this.showVectors && (obj.vx !== 0 || obj.vy !== 0)) {
            this.drawVector(
                pos.x, pos.y,
                obj.vx * 2, -obj.vy * 2,
                '#ff6b6b', 'Velocity'
            );
        }
    }

    /**
     * Draw vector
     */
    drawVector(x, y, vx, vy, color, label = '') {
        const scale = 5;
        const endX = x + vx * scale;
        const endY = y + vy * scale;

        // Draw line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Draw arrowhead
        const headlen = 15;
        const angle = Math.atan2(vy, vx);

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draw all objects
     */
    render(objects) {
        this.clear();

        if (this.showGrid) {
            this.drawGrid();
        }

        // Draw ground
        this.ctx.fillStyle = '#8b7355';
        this.ctx.fillRect(0, this.centerY, this.width, this.height - this.centerY);

        // Draw objects
        for (let obj of objects) {
            this.drawProjectile(obj);
        }

        // Draw info text
        this.drawInfo();
    }

    /**
     * Draw info text
     */
    drawInfo() {
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(`Time: ${(window.simulationTime || 0).toFixed(2)}s`, 10, 20);
    }

    /**
     * Render graph
     */
    renderGraph(data, graphType, canvasId = 'graph-canvas') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        if (!data || data.length === 0) return;

        // Find min/max values
        let maxX = 0, minX = 0, maxY = 0, minY = 0;

        data.forEach(point => {
            maxX = Math.max(maxX, point.t);
            if (graphType === 'position') {
                maxY = Math.max(maxY, point.y);
                minY = Math.min(minY, point.y);
            } else if (graphType === 'velocity') {
                maxY = Math.max(maxY, point.vy);
                minY = Math.min(minY, point.vy);
            } else if (graphType === 'energy') {
                maxY = Math.max(maxY, point.energy || 0);
            }
        });

        // Draw axes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();

        // Draw data points
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + ((point.t - minX) / (maxX - minX || 1)) * (width - 2 * padding);
            let y;

            if (graphType === 'position') {
                y = height - padding - ((point.y - minY) / (maxY - minY || 1)) * (height - 2 * padding);
            } else if (graphType === 'velocity') {
                y = height - padding - ((point.vy - minY) / (maxY - minY || 1)) * (height - 2 * padding);
            } else {
                y = height - padding - ((point.energy || 0) / maxY || 1) * (height - 2 * padding);
            }

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', width / 2, height - 10);

        ctx.save();
        ctx.translate(10, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(graphType === 'position' ? 'Height (m)' : graphType === 'velocity' ? 'Velocity (m/s)' : 'Energy (J)', 0, 0);
        ctx.restore();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}