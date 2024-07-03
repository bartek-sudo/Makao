    import Player from './player.js'; // Importujemy klasę Player
    import Card from './card.js'; // Importujemy klasę Card
    import Deck from './deck.js'; // Importujemy klasę Deck


    /**
     * Klasa reprezentująca grę
     * @param {boolean} isNewGame - czy gra jest nowa
     * @param {string} player1Name - nazwa pierwszego gracza
     * @param {string} player2Name - nazwa drugiego gracza
     * @param {string} player3Name - nazwa trzeciego gracza
     * @param {string} player4Name - nazwa czwartego gracza
     * @property {Player[]} players - tablica z graczami
     * @property {number} currentPlayerIndex - indeks aktualnego gracza
     * @property {Player} currentPlayer - aktualny gracz
     * @property {Deck} deck - talia kart
     * @property {Card[]} stack - stos kart
     * @property {number} skipTurns - liczba tur do pominięcia
     * @property {number} extraCards - liczba kart do dołożenia
     * @property {string} deckStatus - status talii
     * @method {void} saveGameStateToLocal - zapisuje stan gry do localStorage
     * @method {void} loadGameStateFromLocal - wczytuje stan gry z localStorage
     * @method {void} dealCards - rozdaje karty
     * @method {boolean} isFirstCardValid - sprawdza, czy pierwsza karta na stosie jest poprawna
     * @method {void} updateUI - aktualizuje interfejs
     * @method {void} updatePlayersHands - aktualizuje ręce graczy
     * @method {void} updateStack - aktualizuje stos kart
     * @method {void} updateDeck - aktualizuje talię kart
     * @method {void} enableDeck - aktywuje talię kart
     * @method {void} disableDeck - dezaktywuje talię kart
     * @method {void} attachCardClickHandlers - dodaje obsługę kliknięcia do kart
     * @method {void} handleCardClick - obsługuje kliknięcie w kartę
     * @method {boolean} isValidPlay - sprawdza, czy karta może zostać zagrana
     * @method {void} playCard - zagraj kartę
     * @method {void} pushCard - dodaje kartę na stos
     * @method {number} findCardIndexInHand - znajduje indeks karty w ręce gracza
     * @method {void} switchToNextPlayer - przełącza na następnego gracza
     * @method {void} switchToPreviousPlayer - przełącza na poprzedniego gracza
     * @method {void} displayMessage - wyświetla komunikat
     * @method {void} createCardElement - tworzy element karty
     * @method {void} createReversedCardElement - tworzy element odwróconej karty
     * @method {void} getCardFromElement - pobiera kartę z elementu
     * @class
     * @global
     * @public
     * @name Game
     * @see Player
     * @see Card
     * @see Deck
     * @example
     * const game = new Game(true, 'Gracz 1', 'Gracz 2', 'Gracz 3', 'Gracz 4');
     */
    class Game {
        constructor(isNewGame, player1Name, player2Name, player3Name, player4Name) {
            if (localStorage.getItem('gameState') && isNewGame !== "newGame")
                this.loadGameStateFromLocal();
            else{
                this.players = [new Player(player1Name), new Player(player2Name), new Player(player3Name), new Player(player4Name)];
                this.currentPlayerIndex = 0;
                this.currentPlayer = this.players[0];   
                this.deck = new Deck();
                this.stack = [];
                this.dealCards();
                this.skipTurns = 0;
                this.extraCards = 0;
                this.deckStatus = 'enabled';
            }
            this.updateDeck();

            this.updateUI();

        }

        /**
         * Zapisuje stan gry do localStorage
         * @method
         * @private
         * @name Game#saveGameStateToLocal
         * @returns {void}
         * @example
         * game.saveGameStateToLocal();
         */
        saveGameStateToLocal() {
            const gameState = {
                players: this.players,
                currentPlayerIndex: this.currentPlayerIndex,
                currentPlayer: this.currentPlayer,   
                deck: this.deck,
                stack: this.stack,
                skipTurns: this.skipTurns,
                extraCards: this.extraCards,
                deckStatus: this.deckStatus
            };

            const jsonState = JSON.stringify(gameState);

            localStorage.setItem('gameState', jsonState);
        }

        /**
         * Wczytuje stan gry z localStorage
         * @method
         * @private
         * @name Game#loadGameStateFromLocal
         * @returns {void}
         * @example
         * game.loadGameStateFromLocal();
         */
        loadGameStateFromLocal() {
            const jsonState = localStorage.getItem('gameState');
            const gameState = JSON.parse(jsonState);

            // Przywróć stan gry na podstawie danych z jsonState
            this.players = gameState.players;
            this.currentPlayerIndex = gameState.currentPlayerIndex;
            this.currentPlayer = gameState.currentPlayer;
            this.deck = new Deck();
            this.deck.cards = gameState.deck.cards.map(cardData => new Card(cardData.suit, cardData.value));
            this.stack = gameState.stack;
            this.skipTurns = gameState.skipTurns;
            this.extraCards = gameState.extraCards;
            this.deckStatus = gameState.deckStatus;
            this.updateDeck();
            this.updateUI();
        }

        /**
         * Rozdaje karty
         * @method
         * @private
         * @name Game#dealCards
         * @returns {void}
         * @example
         * game.dealCards();
         */
        dealCards() {
            this.deck.shuffleDeck();

            for (let i = 0; i < 5; i++) {
                this.players.forEach(player => player.hand.push(this.deck.drawCard()));
            }

            // Pierwsza karta na stosie musi być 5, 6, 7, 8, 9 lub 10
            let firstCard = this.deck.drawCard();
            while (!this.isFirstCardValid(firstCard)) {
                this.deck.addToBottom(firstCard); // Umieść kartę z powrotem na dół talii
                firstCard = this.deck.drawCard();
            }
            this.stack.push(firstCard);

            this.updateUI();
        }

        /**
         * Sprawdza, czy pierwsza karta na stosie jest poprawna
         * @method
         * @private
         * @name Game#isFirstCardValid
         * @param {Card} card - karta
         * @returns {boolean} - czy karta jest poprawna
         * @example
         * const card = new Card('hearts', '5');
         */
        isFirstCardValid(card) {
            // Sprawdź, czy karta ma wartość 5, 6, 7, 8, 9 lub 10
            const validValues = ['5', '6', '7', '8', '9', '10'];
            return validValues.includes(card.value);
        }

        /**
         * Aktualizuje interfejs
         * @method
         * @private
         * @name Game#updateUI
         * @returns {void}
         * @example
         * game.updateUI();
         */
        updateUI() {
            this.updatePlayersHands();
            this.updateStack();
            this.attachCardClickHandlers();
            this.saveGameStateToLocal();
        }

        /**
         * Aktualizuje ręce graczy
         * @method
         * @private
         * @name Game#updatePlayersHands
         * @returns {void}
         * @example
         * game.updatePlayersHands();
         */
        updatePlayersHands() {
            document.getElementById('player1-name').innerHTML = `Gracz ${this.currentPlayerIndex + 1}`;
            document.getElementById('player1-name').innerHTML = `Gracz ${this.players[this.currentPlayerIndex].name}`;
            const playerHandElement = document.getElementById(`player1-hand`);
            playerHandElement.innerHTML = '';
            this.players[this.currentPlayerIndex].hand.forEach(card => {
                const cardElement = this.createCardElement(card);
                cardElement.dataset.playerIndex = this.currentPlayerIndex;
                playerHandElement.appendChild(cardElement);
            });
            for (let i = 1; i < this.players.length; i++) {
                document.getElementById(`player${i+1}-name`).innerHTML = `Gracz ${(this.currentPlayerIndex + i ) % this.players.length + 1}`;
                document.getElementById(`player${i+1}-name`).innerHTML = `Gracz ${this.players[(this.currentPlayerIndex + i ) % this.players.length].name}`;

                const playerHandElement = document.getElementById(`player${i+1}-hand`);
                playerHandElement.innerHTML = '';
                this.players[(this.currentPlayerIndex + i) % this.players.length].hand.forEach(card => {
                    const cardElement = this.createReversedCardElement(card);
                    cardElement.dataset.playerIndex = (this.currentPlayerIndex + i) % this.players.length;
                    playerHandElement.appendChild(cardElement);
                });
            }
        }


        /**
         * Aktualizuje stos kart
         * @method
         * @private
         * @name Game#updateStack
         * @returns {void}
         * @example
         * game.updateStack();
         */
        updateStack() {
            if (this.stack.length > 5) {
                let cardsToMove = this.stack.splice(0, this.stack.length - 5);
                cardsToMove.forEach(card => {
                    card.info = '';
                });
                this.deck.addToBottom(cardsToMove);
            }
            const stackElement = document.getElementById('stack');
            stackElement.innerHTML = '';
            const fragment = document.createDocumentFragment();
            let i=0;
            this.stack.forEach(card=> {
                const cardElement = this.createCardElement(card);
                if (i === this.stack.length - 1) {
                    cardElement.style.border = '3px solid red';
                }
                i++;
                fragment.appendChild(cardElement);
            });
            stackElement.appendChild(fragment);
        }

        /**
         * Aktualizuje talię kart
         * @method
         * @private
         * @name Game#updateDeck
         * @returns {void}
         * @example
         * game.updateDeck();
         */
        updateDeck() {
            // Pobierz element karty w talii
            document.getElementById('deck').style.display = 'flex';
            const deckCard = document.querySelector('#deck .reversedCard');
        
            // Dodaj zdarzenie kliknięcia do karty w talii
            deckCard.addEventListener('click', async () => {
                if (this.deckStatus === 'disabled') {
                    if (this.stack[this.stack.length - 1].info === 'active') {
                        console.log(this.stack[this.stack.length - 1]);
                        console.log("Nie możesz pominąć kolejki bo grozi ci dobranie karty.");
                        await this.displayMessage("Nie możesz pominąć kolejki bo grozi ci dobranie karty.", 1000);
                        return;
                    }
                    this.switchToNextPlayer();
                    return;
                }
                if (this.deck.isEmpty()) {
                    console.log("Brak kart w talii.");
                    await this.displayMessage("Brak kart w talii.", 1000);
                } else if (this.stack[this.stack.length - 1].info === 'active4') {
                    console.log("Nie możesz dobrać karty bo grozi ci 4.");
                    await this.displayMessage("Nie możesz dobrać karty bo grozi ci 4.", 1000);
                    return;
                } else {
                    const card = this.deck.drawCard();

                    // Dodaj kartę do ręki aktualnego gracza
                    this.currentPlayer.hand.push(card);
                    this.currentPlayer.hand.forEach(async card => {
                        if (this.isValidPlay(card, this.stack[this.stack.length - 1])) {
                            console.log("Możesz dołożyć kartę: " + card);
                            await this.displayMessage("Możesz dołożyć kartę", 1000);
                        }
                    });
                    this.disableDeck();
                    this.updateUI();
                    return;
                }

                this.switchToNextPlayer();
        
                // Zaktualizuj interfejs
                this.updateUI();
            });
        }

        /**
         * Aktywuje talię kart
         * @method
         * @private
         * @name Game#enableDeck
         * @returns {void}
         * @example
         * game.enableDeck();
         */
        enableDeck() {
            const deckCard = document.querySelector('#deck .reversedCard');
            deckCard.style.background = 'linear-gradient(45deg, #5120ff , #b11515 )';
            this.deckStatus = 'enabled';
        }

        /**
         * Dezaktywuje talię kart
         * @method
         * @private
         * @name Game#disableDeck
         * @returns {void}
         * @example
         * game.disableDeck();
         */
        disableDeck() {
            const deckCard = document.querySelector('#deck .reversedCard');
            deckCard.style.background = 'linear-gradient(45deg, #30139b , #630c0c )';
            this.deckStatus = 'disabled';
        }

        /**
         * Dodaje obsługę kliknięcia do kart
         * @method
         * @private
         * @name Game#attachCardClickHandlers
         * @returns {void}
         * @example
         * game.attachCardClickHandlers();
         */
        attachCardClickHandlers() {
            const cards = document.querySelectorAll(`#player1-hand .card`);
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    this.handleCardClick(card);
                });
            });
        }

        /**
         * Obsługuje kliknięcie w kartę
         * @method
         * @private
         * @async
         * @name Game#handleCardClick
         * @param {HTMLElement} cardElement - element karty
         * @returns {void}
         * @example
         * game.handleCardClick(cardElement);
         */
        async handleCardClick(cardElement) {
            const card = this.getCardFromElement(cardElement);
            const topCard = this.stack[this.stack.length - 1];
            
            if (this.isValidPlay(card, topCard)) {
                this.playCard(card, topCard);
            } else {
                console.log("Nie możesz dołożyć tej karty.");
                await this.displayMessage("Nie możesz dołożyć tej karty.", 1000);
            }
        
            cardElement.style.backgroundColor = '#7e7e7e';
        }

        /**
         * Sprawdza, czy karta może zostać zagrana
         * @method
         * @private
         * @name Game#isValidPlay
         * @param {Card} card - karta
         * @param {Card} topCard - karta na szczycie stosu
         * @returns {boolean} - czy karta może zostać zagrana
         * @example
         * const card = new Card('hearts', '5');
         * const topCard = new Card('hearts', '6');
         * game.isValidPlay(card, topCard);
         */
        isValidPlay(card, topCard) {
            const specialRules = {
                'A_active': (card, topCard) => topCard.info === card.suit || topCard.value === card.value, //giit
                'K_hearts_active': (card, topCard) => (card.suit === topCard.suit && (card.value === '3' || card.value === '2') || (card.value === 'K' && card.suit === 'spades')),
                'K_spades_active': (card, topCard) => (card.suit === topCard.suit && (card.value === '3' || card.value === '2') || (card.value === 'K' && card.suit === 'hearts')),
                'J_active': (card, topCard) => topCard.info === card.value || topCard.value === card.value, // giit
                '4_active4': (card) => card.value === '4' ,
                '3_active': (card, topCard) => card.value === '3' || ((card.value === '2' || card.value === 'K') && card.suit === topCard.suit),
                '2_active': (card, topCard) => card.value === '2' || ((card.value === '3' || card.value === 'K') && card.suit === topCard.suit)
            };
        
            let key = `${topCard.value}`;
            if (topCard.value === 'K') {
                key += `_${topCard.suit}`;
            }
            key += `_${topCard.info}`;
            console.log(key);
            if (specialRules[key]) {
                return specialRules[key](card, topCard);
            } 

            return card.suit === topCard.suit || card.value === topCard.value || topCard.info === card.value || topCard.info === card.suit || card.value === 'Q' || topCard.value === 'Q';
        }

        /**
         * Zagraj kartę
         * @method
         * @private
         * @async
         * @name Game#playCard
         * @param {Card} card - karta
         * @returns {void}
         * @example
         * const card = new Card('hearts', '5');
         * game.playCard(card);
         */
        async playCard(card) {

            if (card.value === 'A') {
                this.pushCard(card);
                await this.chooseSuitAsync();
                this.switchToNextPlayer();
                return;
            } else if (card.value === 'J') {
                this.pushCard(card);
                await this.chooseValueAsync();
                this.switchToNextPlayer();
                return;
                
            } else if (card.value === '4') {
                this.skipTurns++;
                card.info = 'active4';
                if (!this.nextPlayerhasFour()) {
                    this.players[(this.currentPlayerIndex + 1) % this.players.length].skipTurns = this.skipTurns;
                    this.skipTurns = 0;
                    card.info = 'disabled';
                }
            } else if (card.value === '3' || card.value === '2' || (card.value === 'K' && (card.suit === 'hearts' || card.suit === 'spades'))) {
                let newExtras = 0;
                card.info = 'active';
                switch (card.value) {
                    case '3':
                        newExtras = 3;
                        break;
                    case '2':
                        newExtras = 2;
                        break;
                    case 'K':
                        newExtras = 5;
                        break;
                }
                this.extraCards += newExtras;
                console.log(`+ ${newExtras} karty.`);
                await this.displayMessage(`+ ${newExtras} karty.`, 1000);
                if (card.suit === 'spades' && card.value === 'K') {
                    const prevPlayer = this.players[(this.currentPlayerIndex + 3) % this.players.length];
                    this.pushCard(card);
                    if (!this.prevPlayerhasMove(card)) { // jeśli poprzedni gracz nie ma ruchu to dobiera karty
                        for (let i = 0; i < this.extraCards; i++) {
                            if (this.deck.isEmpty()) {
                                console.log("Brak kart w talii.");
                                await this.displayMessage("Brak kart w talii.", 1000);
                                break;
                            }
                            prevPlayer.hand.push(this.deck.drawCard());
                        }
                        console.log(`Gracz ${prevPlayer.name} dobiera ${this.extraCards} kart.`);
                        await this.displayMessage(`Gracz ${prevPlayer.name} dobiera ${this.extraCards} kart.`, 1000);
                        this.extraCards = 0;
                        card.info = 'disabled';
                        this.switchToNextPlayer();
                    }
                    this.switchToPreviousPlayer();
                    return;
                } else {
                    this.pushCard(card);
                    if (!this.nextPlayerhasMove(card)) {
                        const nextPlayer = this.players[(this.currentPlayerIndex + 1) % this.players.length];
                        for (let i = 0; i < this.extraCards; i++) {
                            if (this.deck.isEmpty()) {
                                console.log("Brak kart w talii.");
                                await this.displayMessage("Brak kart w talii.", 1000);
                                break;
                            }
                            nextPlayer.hand.push(this.deck.drawCard());
                        }
                        console.log(`Gracz ${nextPlayer.name} dobiera ${this.extraCards} kart.`);
                        await this.displayMessage(`Gracz ${nextPlayer.name} dobiera ${this.extraCards} kart.`, 1000);
                        this.extraCards = 0;
                        card.info = 'disabled';
                        this.switchToNextPlayer();
                    }
                    this.switchToNextPlayer();
                    return;
                }
            }
            this.pushCard(card);
            this.switchToNextPlayer();
        }

        /**
         * Sprawdza, czy następny gracz ma 4
         * @method
         * @private
         * @name Game#nextPlayerhasFour
         * @returns {boolean} - czy następny gracz ma 4
         * @example
         * game.nextPlayerhasFour();
         */
        nextPlayerhasFour() {
            const nextPlayer = this.players[(this.currentPlayerIndex + 1) % this.players.length];
            for (const card of nextPlayer.hand) {
                if (card.value === '4') {
                    return true;
                }
            }
            return false;
        }

        /**
         * Sprawdza, czy poprzedni gracz ma ruch
         * @method
         * @private
         * @name Game#prevPlayerhasMove
         * @returns {boolean} - czy poprzedni gracz ma ruch
         * @example
         * game.prevPlayerhasMove();
         */
        nextPlayerhasMove(playedCard) {
            const nextPlayer = this.players[(this.currentPlayerIndex + 1) % this.players.length];
            for (const card of nextPlayer.hand) {
                if (this.isValidPlay(card, playedCard)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Sprawdza, czy poprzedni gracz ma ruch
         * @method
         * @private
         * @name Game#prevPlayerhasMove
         * @returns {boolean} - czy poprzedni gracz ma ruch
         * @example
         * game.prevPlayerhasMove();
         */
        prevPlayerhasMove(playedCard) {
            const prevPlayer = this.players[(this.currentPlayerIndex + 3) % this.players.length];
            for (const card of prevPlayer.hand) {
                if (this.isValidPlay(card, playedCard)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Wybiera kolor
         * @method
         * @private
         * @async
         * @name Game#chooseSuitAsync
         * @returns {void}
         * @example
         * game.chooseSuitAsync();
         * @example
         * await game.chooseSuitAsync();
         */
        chooseSuitAsync() {
            return new Promise((resolve) => {
                // Stworzenie modala
                const modal = document.createElement('div');
                modal.className = 'suit-modal';
        
                // Dodanie opcji kolorów do modalu
                const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
                suits.forEach(suit => {
                    const suitOption = document.createElement('div');
                    suitOption.className = 'suit-option';
                    let symbol;
                    let color;
                    switch (suit) {
                        case 'hearts':
                            symbol = '♥';
                            color = '#b03737';
                            break;
                        case 'diamonds':
                            symbol = '♦';
                            color = '#b03737';
                            break;
                        case 'clubs':
                            symbol = '♣';
                            color = 'black';
                            break;
                        case 'spades':
                            symbol = '♠';
                            color = 'black';
                            break;
                    }
                    suitOption.textContent = symbol;
                    suitOption.style.color = color;
                    suitOption.addEventListener('click', () => {
                        // Usunięcie modala z elementu body
                        const modal = document.querySelector('.suit-modal');
                        modal.parentNode.removeChild(modal);
        
                        // Ustaw nowy kolor ostatniej zagrywanej karty
                        this.stack[this.stack.length - 1].info = suit;
        
                        this.updateStack();
        
                        // Rozwiązanie obietnicy, gdy kolor zostanie wybrany
                        resolve();
                    });
                    modal.appendChild(suitOption);
                });
        
                // Dodanie modalu do elementu body
                document.body.appendChild(modal);
            });
        }

        /**
         * Wybiera wartość
         * @method
         * @private
         * @async
         * @name Game#chooseValueAsync
         * @returns {void}
         * @example
         * game.chooseValueAsync();
         */
        chooseValueAsync() {
            return new Promise((resolve) => {
                // Stworzenie modala
                const modal = document.createElement('div');
                modal.className = 'value-modal';
        
                const values = ['5', '6', '7', '8', '9', '10'];
                values.forEach(value => {
                    const valueOption = document.createElement('div');
                    valueOption.className = 'value-option';
                    valueOption.textContent = value;
                    valueOption.addEventListener('click', () => {
                        // Usunięcie modala z elementu body
                        const modal = document.querySelector('.value-modal');
                        modal.parentNode.removeChild(modal);
        
                        // Ustaw nową wartość ostatniej zagrywanej karty
                        this.stack[this.stack.length - 1].info = value;
        
                        this.updateStack();
        
                        // Rozwiązanie obietnicy, gdy wartość zostanie wybrana
                        resolve();
                    });
                    modal.appendChild(valueOption);
                });
        
                // Dodanie modalu do elementu body
                document.body.appendChild(modal);
            });
        }

        /**
         * Dodaje kartę na stos
         * @method
         * @private
         * @name Game#pushCard
         * @param {Card} card - karta
         * @returns {void}
         * @example
         * const card = new Card('hearts', '5');
         * game.pushCard(card);
         */
        pushCard(card) {
            this.stack.push(card);            
            // Usuń kartę z ręki gracza
            const cardIndex = this.findCardIndexInHand(this.currentPlayer.hand, card);            
            this.currentPlayer.hand.splice(cardIndex, 1);
        }

        /**
         * Znajduje indeks karty w ręce gracza
         * @method
         * @private
         * @name Game#findCardIndexInHand
         * @param {Card[]} hand - ręka gracza
         * @param {Card} card - karta
         * @returns {number} - indeks karty w ręce gracza
         * @example
         * const card = new Card('hearts', '5');
         * game.findCardIndexInHand(hand, card);
         */
        findCardIndexInHand(hand, card) {
            for (let i = 0; i < hand.length; i++) {
                if (hand[i].suit === card.suit && hand[i].value === card.value) {
                    return i;
                }
            }
            return -1; // Zwróć -1, jeśli karta nie została znaleziona
        }

        async switchToNextPlayer() {
            
            if (this.deckStatus === 'disabled') {
                this.enableDeck();           
            }
            if (this.currentPlayer.hand.length === 0) {
                // Gracz wygrywa grę
                console.log(`Gracz ${this.currentPlayer.name} wygrywa grę!`);
                await this.displayMessage(`Gracz ${this.currentPlayer.name} wygrywa grę!`, 30000);
                return;
            }
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            this.currentPlayer = this.players[this.currentPlayerIndex];
            if (this.currentPlayer.skipTurns > 0) {
                this.currentPlayer.skipTurns--;
                console.log(`Gracz ${this.currentPlayer.name} traci kolejkę!`);
                await this.displayMessage(`Gracz ${this.currentPlayer.name} traci kolejkę!`, 1000);
                setTimeout(() => this.switchToNextPlayer(), 1000); // Opóźnienie 1 sekundy
            }
            document.title = `${this.currentPlayer.name}`;
            await this.displayMessage(`Tura gracza ${this.currentPlayer.name}!`, 3000);
                
        }

        async switchToPreviousPlayer() {
            if (this.deckStatus === 'disabled') {
                this.enableDeck();           
            }
            if (this.currentPlayer.hand.length === 0) {
                // Gracz wygrywa grę
                console.log(`Gracz ${this.currentPlayer.name} wygrywa grę!`);
                await this.displayMessage(`Gracz ${this.currentPlayer.name} wygrywa grę!`, 30000);
                return;
            }
            this.currentPlayerIndex = (this.currentPlayerIndex + 3) % this.players.length;
            this.currentPlayer = this.players[this.currentPlayerIndex];
            this.updateUI();
        }

        /**
         * Wyświetla komunikat
         * @method
         * @private
         * @async
         * @name Game#displayMessage
         * @param {string} message - komunikat
         * @param {number} delay - opóźnienie
         * @returns {void}
         * @example
         * game.displayMessage('Komunikat', 1000);
         */
        displayMessage(message, delay) {
            const messageElement = document.getElementById('message');
    
            // Ustawienie tekstu i klasy komunikatu
            messageElement.className = 'message';
            messageElement.textContent = message;
    
            return new Promise((resolve) => {
                // Odliczanie
                let countdown = Math.ceil((delay + 1000) / 1000);
                const countdownInterval = setInterval(() => {
                    countdown--;
    
                    // Aktualizacja tekstu z odliczaniem
                    messageElement.innerHTML = `${message}<br>za ${countdown} sekund${countdown !== 1 ? 'y' : ''}!`;
    
                    if (countdown <= 0) {
                        // Czyszczenie tekstu i klasy po zakończeniu odliczania
                        clearInterval(countdownInterval);
                        messageElement.textContent = '';
                        messageElement.className = '';
                        this.updateUI();  
                        resolve(); // Rozwiązanie obietnicy po zakończeniu odliczania
                    }
                }, 1000);
            });
        }
        

        /**
         * Tworzy element karty
         * @method
         * @private
         * @name Game#createCardElement
         * @param {Card} card - karta
         * @returns {HTMLElement} - element karty
         * @example
         * const card = new Card('hearts', '5');
         * game.createCardElement(card);
         */
        createCardElement(card) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            let symbol;
            let color;
            switch (card.suit) {
                case 'hearts':
                    symbol = '♥';
                    color = '#b03737';
                    break;
                case 'diamonds':
                    symbol = '♦';
                    color = '#b03737';
                    break;
                case 'clubs':
                    symbol = '♣';
                    color = 'black';
                    break;
                case 'spades':
                    symbol = '♠';
                    color = 'black';
                    break;
            }

            let info;
            let infoColor;
            switch (card.info) {
                case 'hearts':
                    info = '♥';
                    infoColor = '#b03737';
                    break;
                case 'diamonds':
                    info = '♦';
                    infoColor = '#b03737';
                    break;
                case 'clubs':
                    info = '♣';
                    infoColor = 'black';
                    break;
                case 'spades':
                    info = '♠';
                    infoColor = 'black';
                    break;
                case '5':
                    info = '5';
                    infoColor = 'black';
                    break;
                case '6':
                    info = '6';
                    infoColor = 'black';
                    break;
                case '7':
                    info = '7';
                    infoColor = 'black';
                    break;
                case '8':
                    info = '8';
                    infoColor = 'black';
                    break;
                case '9':
                    info = '9';
                    infoColor = 'black';
                    break;
                case '10':
                    info = '10';
                    infoColor = 'black';
                    break;
                case 'active4':
                    info = '<i class="fas fa-ban"></i>'; // Ikona "ban" z Font Awesome
                    break;
                default:
                    info = '';
                    infoColor = '';
                    break;
            }

            cardElement.innerHTML = `${card.value} <br> ${symbol} <br>`;
            cardElement.style.color = color;
            const infoElement = document.createElement('div');
            infoElement.innerHTML = info;
            infoElement.style.color = infoColor;
            cardElement.appendChild(infoElement);
            // Ustawienie atrybutów danych na elemencie karty
            cardElement.dataset.value = card.value;
            cardElement.dataset.suit = card.suit;

            cardElement.dataset.playerIndex = -1; // Ustawienie dowolnego indeksu gracza, bo nie jest to powiązane z graczem
            return cardElement;
        }

        /**
         * Tworzy element odwróconej karty
         * @method
         * @private
         * @name Game#createReversedCardElement
         * @returns {HTMLElement} - element odwróconej karty
         * @example
         * game.createReversedCardElement();
         */
        createReversedCardElement() {
            const cardElement = document.createElement('div');
            cardElement.className = 'card reversedCard';
            cardElement.innerHTML = '&#1421;';
            return cardElement;
        }

        /**
         * Pobiera kartę z elementu
         * @method
         * @private
         * @name Game#getCardFromElement
         * @param {HTMLElement} cardElement - element karty
         * @returns {Card} - karta
         * @example
         * const cardElement = document.querySelector('#player1-hand .card');
         * game.getCardFromElement(cardElement);
         */
        getCardFromElement(cardElement) {
            const card = new Card(cardElement.dataset.suit, cardElement.dataset.value);
            card.info = 'disabled';
            return card;
        }

    }

    // Eksportujemy klasę Game
    export default Game;