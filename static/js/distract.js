// OneTrack — Distraction Zone Game Logic
// Game data

const EMOJIS = [
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼'
];

const DOG_API = 'https://dog.ceo/api/breeds/image/random';
const CAT_API = 'https://api.thecatapi.com/v1/images/search';

let cards = [];
let flipped = [];
let matched = 0;
let lockBoard = false;
let gameWon = false;

// Helpers

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}

// Dog API Reward
async function fetchAnimalBoost(choice) {
    const container = document.getElementById('dogImage');
    container.innerHTML = '<p>🐾 Fetching your reward...</p>';

    try {
        let imgUrl, apiSource;

        if (choice === 'cat') {
            const response = await fetch(CAT_API);
            if (!response.ok) throw new Error('Cat API failed');
            const data = await response.json();
            imgUrl = data[0].url;
            apiSource = 'thecatapi.com';
        } else {
            const response = await fetch(DOG_API);
            if (!response.ok) throw new Error('Dog API failed');
            const data = await response.json();
            imgUrl = data.message;
            apiSource = 'dog.ceo';
        }

        container.innerHTML = `
            <p>🎉 You beat the craving!</p>
            <img src="${imgUrl}" alt="Cute ${choice} reward">
            <p style="font-size:0.7rem;color:#888;">📡 External API: ${apiSource}</p>
        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>🐾 Could not fetch a reward, but you still won! 🎉</p>';
    }
}

// Game Setup

function initGame() {

    let deck =
        [...EMOJIS, ...EMOJIS];

    deck = shuffle(deck);

    cards = deck.map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
    }));

    flipped = [];
    matched = 0;
    lockBoard = false;
    gameWon = false;

    document.getElementById('dogImage')
        .innerHTML = '';

    updateStatus();

    renderBoard();
}

function updateStatus() {

    document.getElementById('status')
        .textContent =
        `Matches: ${matched} / ${EMOJIS.length}`;
}

// Board Rendering

function renderBoard() {

    const grid =
        document.getElementById('cardGrid');

    grid.innerHTML = '';

    cards.forEach((card, index) => {

        const div =
            document.createElement('div');

        div.className = 'card';

        div.setAttribute(
            'aria-label',
            'Memory game card'
        );

        if (card.flipped || card.matched) {

            div.classList.add('flipped');

            div.textContent =
                card.emoji;

        } else {

            div.textContent = '?';
        }

        if (card.matched) {
            div.classList.add('matched');
        }

        div.addEventListener(
            'click',
            () => flipCard(index)
        );

        grid.appendChild(div);
    });
}

// Game Logic

function flipCard(index) {

    if (lockBoard) return;

    if (cards[index].matched) return;

    if (cards[index].flipped) return;

    cards[index].flipped = true;

    flipped.push(index);

    renderBoard();

    if (flipped.length === 2) {

        lockBoard = true;

        setTimeout(checkMatch, 700);
    }
}

function checkMatch() {

    const [a, b] = flipped;

    const isMatch =
        cards[a].emoji === cards[b].emoji;

    if (isMatch) {

        cards[a].matched = true;
        cards[b].matched = true;

        matched++;

        updateStatus();

        if (
            matched === EMOJIS.length &&
            !gameWon
        ) {

            gameWon = true;
            showAnimalPicker();
        }

    } else {

        cards[a].flipped = false;
        cards[b].flipped = false;
    }

    flipped = [];

    lockBoard = false;

    renderBoard();
}

function showAnimalPicker() {
    const container = document.getElementById('dogImage');
    container.innerHTML = `
        <p>🎉 You won! Choose your reward:</p>
        <button onclick="fetchAnimalBoost('dog')">🐶 Dog</button>
        <button onclick="fetchAnimalBoost('cat')">🐱 Cat</button>
    `;
}


// Reset

function resetGame() {

    if (confirm('Reset game?')) {
        initGame();
    }
}

// App Start

document.addEventListener(
    'DOMContentLoaded',
    () => {

        initGame();

        document
            .getElementById('resetBtn')
            .addEventListener(
                'click',
                resetGame
            );
    }
);