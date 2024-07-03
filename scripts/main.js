// main.js
import Game from './game.js'; // Importujemy klasę Game

/**
 * Funkcja wyświetlająca formularz nowej gry.
 */
function showForm() {
        // Ukryj menu
        document.getElementById('menu').style.display = 'none';

        // Pokaż formularz
        document.getElementById('new-game-form').style.display = 'block';
}    

/**
 * Funkcja rozpoczynająca nową grę.
 */
function startNewGame() {
    document.getElementById('menu').style.display = 'block';

        // Pokaż formularz
    document.getElementById('new-game-form').style.display = 'none';
    // Pobierz imię gracza
    const player1Name = document.getElementById('player1Name').value;
    const player2Name = document.getElementById('player2Name').value;
    const player3Name = document.getElementById('player3Name').value;
    const player4Name = document.getElementById('player4Name').value;
    // Sprawdź czy imię nie jest puste
    if (player1Name === '' || player2Name === '' || player3Name === '' || player4Name === '') {
        alert('Musisz podać imiona graczy!');
        return;
    }
    document.getElementById('menu-modal').style.display = 'none';
    const game = new Game("newGame", player1Name, player2Name, player3Name, player4Name);
}

/**
 * Funkcja wczytująca poprzednią grę.
 */
function loadPreviousGame() {
    if (!localStorage.getItem('gameState')) {
        alert('Nie ma zapisanej gry!');
        return;
    }
    document.getElementById('menu-modal').style.display = 'none';
    const game = new Game();
}

/**
 * Funkcja otwierająca menu.
 */
function openMenu() {
    document.getElementById('menu-modal').style.display = 'block';
}

/**
 * Funkcja zamykająca menu.
 */
function closeMenu() {
    document.getElementById('menu-modal').style.display = 'none';
}

window.showForm = showForm;
window.startNewGame = startNewGame;
window.loadPreviousGame = loadPreviousGame;
window.openMenu = openMenu;
window.closeMenu = closeMenu;


