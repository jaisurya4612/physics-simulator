/**
 * UI Module
 * Handles all user interface interactions
 */

class UIController {
    constructor(physics, renderer) {
        this.physics = physics;
        this.renderer = renderer;
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        this.lastFrameTime = Date.now();
        this.graphData = [];
        this.currentGraphType = 'position';

        this.initializeElements();
        this.attachEventListeners();
        this.loadSavedSettings();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Control inputs
        this.simulationModeSelect = document.getElementById('simulation-mode');
        this.gravitySelect = document.getElementById('gravity-preset');
        this.gravityInput = document.getElementById('gravity');
        this.gravitySlider = document.getElementById('gravity-slider');
        this.velocityInput = document.getElementById('velocity');
        this.velocitySlider = document.getElementById('velocity-slider');
        this.angleInput = document.getElementById('angle');
        this.angleSlider = document.getElementById('angle-slider');
        this.accelerationInput = document.getElementById('acceleration');
        this.accelerationSlider = document.getElementById('acceleration-slider');
        this.massInput = document.getElementById('mass');
        this.airResistanceCheckbox = document.getElementById('air-resistance');
        this.dragCoefficientInput = document.getElementById('drag-coefficient');
        this.dragSlider = document.getElementById('drag-slider');
        this.dragGroup = document.getElementById('drag-group');
        this.collisionCheckbox = document.getElementById('collision');

        // Control buttons
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resumeBtn = document.getElementById('resume-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.loadBtn = document.getElementById('load-btn');

        // Display options
        this.showTrajectoryCheckbox = document.getElementById('show-trajectory');
        this.showVectorsCheckbox = document.getElementById('show-vectors');
        this.showGridCheckbox = document.getElementById('show-grid');
        this.showInfoCheckbox = document.getElementById('show-info');

        // Speed control
        this.speedSlider = document.getElementById('speed');
        this.speedValue = document.getElementById('speed-value');

        // Display panels
        this.infoPanel = document.getElementById('info-panel');
        this.graphCanvas = document.getElementById('graph-canvas');
        this.scriptPanel = document.getElementById('script-panel');
        this.customScriptInput = document.getElementById('custom-script');
        this.applyScriptBtn = document.getElementById('apply-script');

        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Simulation mode
        this.simulationModeSelect.addEventListener('change', (e) => {
            this.onSimulationModeChange(e.target.value);
        });

        // Gravity preset
        this.gravitySelect.addEventListener('change', (e) => {
            this.onGravityPresetChange(e.target.value);
        });

        // Gravity slider/input sync
        this.gravityInput.addEventListener('input', (e) => {
            this.gravitySlider.value = e.target.value;
            this.physics.setGravity(parseFloat(e.target.value));
        });

        this.gravitySlider.addEventListener('input', (e) => {
            this.gravityInput.value = e.target.value;
            this.physics.setGravity(parseFloat(e.target.value));
        });

        // Velocity sync
        this.velocityInput.addEventListener('input', (e) => {
            this.velocitySlider.value = e.target.value;
        });

        this.velocitySlider.addEventListener('input', (e) => {
            this.velocityInput.value = e.target.value;
        });

        // Angle sync
        this.angleInput.addEventListener('input', (e) => {
            this.angleSlider.value = e.target.value;
        });

        this.angleSlider.addEventListener('input', (e) => {
            this.angleInput.value = e.target.value;
        });

        // Acceleration sync
        this.accelerationInput.addEventListener('input', (e) => {
            this.accelerationSlider.value = e.target.value;
        });

        this.accelerationSlider.addEventListener('input', (e) => {
            this.accelerationInput.value = e.target.value;
        });

        // Air resistance toggle
        this.airResistanceCheckbox.addEventListener('change', (e) => {
            this.physics.airResistance = e.target.checked;
            this.dragGroup.style.display = e.target.checked ? 'block' : 'none';
        });

        // Drag coefficient sync
        this.dragCoefficientInput.addEventListener('input', (e) => {
            this.dragSlider.value = e.target.value;
            this.physics.dragCoefficient = parseFloat(e.target.value);
        });

        this.dragSlider.addEventListener('input', (e) => {
            this.dragCoefficientInput.value = e.target.value;
            this.physics.dragCoefficient = parseFloat(e.target.value);
        });

        // Collision toggle
        this.collisionCheckbox.addEventListener('change', (e) => {
            this.physics.collisionEnabled = e.target.checked;
        });

        // Control buttons
        this.startBtn.addEventListener('click', () => this.startSimulation());
        this.pauseBtn.addEventListener('click', () => this.pauseSimulation());
        this.resumeBtn.addEventListener('click', () => this.resumeSimulation());
        this.resetBtn.addEventListener('click', () => this.resetSimulation());
        this.saveBtn.addEventListener('click', () => this.saveSettings());
        this.loadBtn.addEventListener('click', () => this.loadSettings());

        // Display options
        this.showTrajectoryCheckbox.addEventListener('change', (e) => {
            this.renderer.showTrajectory = e.target.checked;
        });

        this.showVectorsCheckbox.addEventListener('change', (e) => {
            this.renderer.showVectors = e.target.checked;
        });

        this.showGridCheckbox.addEventListener('change', (e) => {
            this.renderer.showGrid = e.target.checked;
        });

        this.showInfoCheckbox.addEventListener('change', (e) => {
            this.infoPanel.style.display = e.target.checked ? 'block' : 'none';
        });

        // Speed control
        this.speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.speedValue.textContent = speed.toFixed(1) + 'x';
        });

        // Graph tabs
        document.querySelectorAll('.graph-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.graph-tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentGraphType = e.target.dataset.graph;
                this.updateGraph();
            });
        });

        // Script panel
        this.applyScriptBtn.addEventListener('click', () => this.applyCustomScript());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    /**
     * Start simulation
     */
    startSimulation() {
        this.physics.reset();
        this.graphData = [];

        const mode = this.simulationModeSelect.value;
        const velocity = parseFloat(this.velocityInput.value);
        const angle = parseFloat(this.angleInput.value);
        const mass = parseFloat(this.massInput.value);

        // Create projectile based on mode
        const projectile = this.physics.createProjectile({
            x: 0,
            y: 0,
            vx: velocity * Math.cos((angle * Math.PI) / 180),
            vy: velocity * Math.sin((angle * Math.PI) / 180),
            mass: mass,
            color: '#3498db'
        });

        this.physics.addObject(projectile);

        this.isRunning = true;
        this.isPaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.resumeBtn.disabled = true;

        this.animate();
    }

    /**
     * Pause simulation
     */
    pauseSimulation() {
        this.isPaused = true;
        this.pauseBtn.disabled = true;
        this.resumeBtn.disabled = false;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    /**
     * Resume simulation
     */
    resumeSimulation() {
        this.isPaused = false;
        this.pauseBtn.disabled = false;
        this.resumeBtn.disabled = true;
        this.lastFrameTime = Date.now();
        this.animate();
    }

    /**
     * Reset simulation
     */
    resetSimulation() {
        this.isRunning = false;
        this.isPaused = false;
        this.physics.reset();
        this.graphData = [];

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resumeBtn.disabled = true;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Clear display
        this.renderer.clear();
        if (this.renderer.showGrid) {
            this.renderer.drawGrid();
        }

        // Clear info
        this.updateInfo(0, 0, 0, 0, 0);
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.isRunning || this.isPaused) return;

        const now = Date.now();
        let dt = (now - this.lastFrameTime) / 1000;
        dt = Math.min(dt, 0.033); // Cap at 30ms

        // Apply speed multiplier
        const speed = parseFloat(this.speedSlider.value);
        dt *= speed;

        this.lastFrameTime = now;

        // Update physics
        this.physics.update(dt);

        // Record data for graph
        if (this.physics.objects.length > 0) {
            const obj = this.physics.objects[0];
            const stats = this.physics.getStats(obj);
            this.graphData.push({
                t: this.physics.time,
                x: obj.x,
                y: obj.y,
                vx: obj.vx,
                vy: obj.vy,
                energy: stats.totalEnergy
            });
        }

        // Render
        this.renderer.render(this.physics.objects);
        this.updateDisplay();

        // Check if simulation should stop
        const activeObjects = this.physics.getActiveObjects();
        if (activeObjects.length === 0) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            return;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Update display values
     */
    updateDisplay() {
        if (this.physics.objects.length === 0) return;

        const obj = this.physics.objects[0];
        const velocity = Math.sqrt(obj.vx ** 2 + obj.vy ** 2);
        const range = obj.x;
        const height = Math.max(0, obj.y);

        this.updateInfo(this.physics.time, obj.x, obj.y, velocity, height, range);
        this.updateGraph();
    }

    /**
     * Update info panel
     */
    updateInfo(time, x, y, velocity, height, range) {
        document.getElementById('time-display').textContent = time.toFixed(2) + ' s';
        document.getElementById('pos-x-display').textContent = x.toFixed(2) + ' m';
        document.getElementById('pos-y-display').textContent = y.toFixed(2) + ' m';
        document.getElementById('velocity-display').textContent = velocity.toFixed(2) + ' m/s';
        document.getElementById('height-display').textContent = height.toFixed(2) + ' m';
        document.getElementById('range-display').textContent = range.toFixed(2) + ' m';

        window.simulationTime = time;
    }

    /**
     * Update graph
     */
    updateGraph() {
        this.renderer.renderGraph(this.graphData, this.currentGraphType);
    }

    /**
     * Handle gravity preset change
     */
    onGravityPresetChange(preset) {
        const gravities = {
            earth: 9.81,
            moon: 1.62,
            mars: 3.71,
            jupiter: 24.79
        };

        if (gravities[preset]) {
            const g = gravities[preset];
            this.gravityInput.value = g;
            this.gravitySlider.value = g;
            this.physics.setGravity(g);
        }
    }

    /**
     * Handle simulation mode change
     */
    onSimulationModeChange(mode) {
        if (mode === 'custom') {
            this.scriptPanel.style.display = 'block';
        } else {
            this.scriptPanel.style.display = 'none';
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const settings = {
            gravity: parseFloat(this.gravityInput.value),
            velocity: parseFloat(this.velocityInput.value),
            angle: parseFloat(this.angleInput.value),
            mass: parseFloat(this.massInput.value),
            acceleration: parseFloat(this.accelerationInput.value),
            airResistance: this.airResistanceCheckbox.checked,
            dragCoefficient: parseFloat(this.dragCoefficientInput.value),
            collision: this.collisionCheckbox.checked,
            showTrajectory: this.showTrajectoryCheckbox.checked,
            showVectors: this.showVectorsCheckbox.checked,
            showGrid: this.showGridCheckbox.checked
        };

        localStorage.setItem('physicsSimulatorSettings', JSON.stringify(settings));
        alert('Settings saved!');
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('physicsSimulatorSettings'));
        if (!settings) {
            alert('No saved settings found!');
            return;
        }

        this.gravityInput.value = settings.gravity;
        this.gravitySlider.value = settings.gravity;
        this.velocityInput.value = settings.velocity;
        this.velocitySlider.value = settings.velocity;
        this.angleInput.value = settings.angle;
        this.angleSlider.value = settings.angle;
        this.massInput.value = settings.mass;
        this.accelerationInput.value = settings.acceleration;
        this.accelerationSlider.value = settings.acceleration;
        this.airResistanceCheckbox.checked = settings.airResistance;
        this.dragCoefficientInput.value = settings.dragCoefficient;
        this.dragSlider.value = settings.dragCoefficient;
        this.collisionCheckbox.checked = settings.collision;
        this.showTrajectoryCheckbox.checked = settings.showTrajectory;
        this.showVectorsCheckbox.checked = settings.showVectors;
        this.showGridCheckbox.checked = settings.showGrid;

        this.physics.setGravity(settings.gravity);
        this.physics.airResistance = settings.airResistance;
        this.physics.dragCoefficient = settings.dragCoefficient;
        this.physics.collisionEnabled = settings.collision;
        this.renderer.showTrajectory = settings.showTrajectory;
        this.renderer.showVectors = settings.showVectors;
        this.renderer.showGrid = settings.showGrid;

        alert('Settings loaded!');
    }

    /**
     * Load saved settings on initialization
     */
    loadSavedSettings() {
        const settings = JSON.parse(localStorage.getItem('physicsSimulatorSettings'));
        if (settings) {
            this.gravityInput.value = settings.gravity;
            this.gravitySlider.value = settings.gravity;
            this.velocityInput.value = settings.velocity;
            this.velocitySlider.value = settings.velocity;
            this.angleInput.value = settings.angle;
            this.angleSlider.value = settings.angle;
            this.physics.setGravity(settings.gravity);
        }
    }

    /**
     * Apply custom script
     */
    applyCustomScript() {
        const script = this.customScriptInput.value;
        // Custom script implementation would go here
        console.log('Custom script applied:', script);
        alert('Custom script applied! Check console for details.');
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isDarkMode = !document.body.classList.contains('light-mode');
        this.themeToggle.textContent = isDarkMode ? '🌙' : '☀️';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const physics = new PhysicsEngine();
    const renderer = new Renderer('simulation-canvas', 800, 600);
    const ui = new UIController(physics, renderer);

    // Load theme preference
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-toggle').textContent = '☀️';
    }

    // Initial render
    renderer.clear();
    if (renderer.showGrid) {
        renderer.drawGrid();
    }
});