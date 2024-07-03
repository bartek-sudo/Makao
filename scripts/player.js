// player.js

/**
 * Klasa reprezentująca gracza.
 * @class
 */
class Player {
    /**
     * Konstruktor klasy Player.
     * @constructor
     * @param {string} name - Imię gracza.
     */
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.skipTurns = 0;
    }
}

// Eksportujemy klasę Player
export default Player;