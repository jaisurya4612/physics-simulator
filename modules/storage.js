// modules/storage.js
/**
 * Storage module for saving/loading simulations
 */

class StorageManager {
    static saveSimulation(name, data) {
        const simulations = JSON.parse(localStorage.getItem('physics_simulations')) || {};
        simulations[name] = {
            ...data,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('physics_simulations', JSON.stringify(simulations));
    }

    static loadSimulation(name) {
        const simulations = JSON.parse(localStorage.getItem('physics_simulations')) || {};
        return simulations[name];
    }

    static listSimulations() {
        return Object.keys(JSON.parse(localStorage.getItem('physics_simulations')) || {});
    }

    static deleteSimulation(name) {
        const simulations = JSON.parse(localStorage.getItem('physics_simulations')) || {};
        delete simulations[name];
        localStorage.setItem('physics_simulations', JSON.stringify(simulations));
    }

    static exportAsJSON(data) {
        return JSON.stringify(data, null, 2);
    }

    static importFromJSON(jsonString) {
        return JSON.parse(jsonString);
    }
}