import Card from './card.js';

// Deck.js

/**
 * Klasa reprezentująca talię kart.
 * @class
 */
class Deck {
    /**
     * Konstruktor klasy Deck.
     * Inicjalizuje talię kart.
     * @constructor
     */
    constructor() {
        this.cards = this.createDeck();
    }

    /**
     * Tworzy nową talię kart.
     * @private
     * @returns {Array} - Nowa talia kart.
     */
    createDeck() {
        // Tworzenie talii kart
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck = [];

        for (const suit of suits) {
            for (const value of values) {
                const card = new Card(suit, value);
                deck.push(card);
            }
        }

        return deck;
    }

    /**
     * Tasuje talię kart.
     */
    shuffleDeck() {
        // Prosta implementacja tasowania algorytmem Fisher-Yates
        let currentIndex = this.cards.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // Zamiana elementów
            [this.cards[currentIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currentIndex]];
        }
        
    }

    /**
     * Pobiera kartę z wierzchu talii.
     * @returns {Card} - Karta z wierzchu talii.
     */
    drawCard() {
        if (this.cards.length > 0) {
            return this.cards.pop();
        } else {
            console.error("Błąd: Brak kart do pobrania z talii.");
            return null;
        }
    }

    /**
     * Sprawdza, czy talia jest pusta.
     * @returns {boolean} - `true`, jeśli talia jest pusta, w przeciwnym razie `false`.
     */
    isEmpty() {
        return this.cards.length === 0;
    }

    /**
     * Dodaje kartę na spód talii.
     * @param {Card} card - Dodawana karta.
     */
    addToBottom(card) {
        this.cards.unshift(card);
    }

}

export default Deck;