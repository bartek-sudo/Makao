// card.js

/**
 * Klasa reprezentująca kartę.
 * @class
 */
class Card {
    /**
     * Konstruktor klasy Card.
     * @constructor
     * @param {string} suit - Kolor karty.
     * @param {string} value - Wartość karty.
     */
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.info = '';
    }
}

// Eksportujemy klasę Card
export default Card;