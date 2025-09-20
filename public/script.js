//game state
let selectedArea = null;
let gameState = {
    hero: [],
    villain: [],
    board: [],
    usedCards: new Set()
};

const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const suitSymbols = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };

//card images
const cardImages = {
    'As': 'https://deckofcardsapi.com/static/img/AS.png',
    'Ah': 'https://deckofcardsapi.com/static/img/AH.png',
    'Ad': 'https://deckofcardsapi.com/static/img/AD.png',
    'Ac': 'https://deckofcardsapi.com/static/img/AC.png',
    'Ks': 'https://deckofcardsapi.com/static/img/KS.png',
    'Kh': 'https://deckofcardsapi.com/static/img/KH.png',
    'Kd': 'https://deckofcardsapi.com/static/img/KD.png',
    'Kc': 'https://deckofcardsapi.com/static/img/KC.png',
    'Qs': 'https://deckofcardsapi.com/static/img/QS.png',
    'Qh': 'https://deckofcardsapi.com/static/img/QH.png',
    'Qd': 'https://deckofcardsapi.com/static/img/QD.png',
    'Qc': 'https://deckofcardsapi.com/static/img/QC.png',
    'Js': 'https://deckofcardsapi.com/static/img/JS.png',
    'Jh': 'https://deckofcardsapi.com/static/img/JH.png',
    'Jd': 'https://deckofcardsapi.com/static/img/JD.png',
    'Jc': 'https://deckofcardsapi.com/static/img/JC.png',
    'Ts': 'https://deckofcardsapi.com/static/img/0S.png',
    'Th': 'https://deckofcardsapi.com/static/img/0H.png',
    'Td': 'https://deckofcardsapi.com/static/img/0D.png',
    'Tc': 'https://deckofcardsapi.com/static/img/0C.png',
    '9s': 'https://deckofcardsapi.com/static/img/9S.png',
    '9h': 'https://deckofcardsapi.com/static/img/9H.png',
    '9d': 'https://deckofcardsapi.com/static/img/9D.png',
    '9c': 'https://deckofcardsapi.com/static/img/9C.png',
    '8s': 'https://deckofcardsapi.com/static/img/8S.png',
    '8h': 'https://deckofcardsapi.com/static/img/8H.png',
    '8d': 'https://deckofcardsapi.com/static/img/8D.png',
    '8c': 'https://deckofcardsapi.com/static/img/8C.png',
    '7s': 'https://deckofcardsapi.com/static/img/7S.png',
    '7h': 'https://deckofcardsapi.com/static/img/7H.png',
    '7d': 'https://deckofcardsapi.com/static/img/7D.png',
    '7c': 'https://deckofcardsapi.com/static/img/7C.png',
    '6s': 'https://deckofcardsapi.com/static/img/6S.png',
    '6h': 'https://deckofcardsapi.com/static/img/6H.png',
    '6d': 'https://deckofcardsapi.com/static/img/6D.png',
    '6c': 'https://deckofcardsapi.com/static/img/6C.png',
    '5s': 'https://deckofcardsapi.com/static/img/5S.png',
    '5h': 'https://deckofcardsapi.com/static/img/5H.png',
    '5d': 'https://deckofcardsapi.com/static/img/5D.png',
    '5c': 'https://deckofcardsapi.com/static/img/5C.png',
    '4s': 'https://deckofcardsapi.com/static/img/4S.png',
    '4h': 'https://deckofcardsapi.com/static/img/4H.png',
    '4d': 'https://deckofcardsapi.com/static/img/4D.png',
    '4c': 'https://deckofcardsapi.com/static/img/4C.png',
    '3s': 'https://deckofcardsapi.com/static/img/3S.png',
    '3h': 'https://deckofcardsapi.com/static/img/3H.png',
    '3d': 'https://deckofcardsapi.com/static/img/3D.png',
    '3c': 'https://deckofcardsapi.com/static/img/3C.png',
    '2s': 'https://deckofcardsapi.com/static/img/2S.png',
    '2h': 'https://deckofcardsapi.com/static/img/2H.png',
    '2d': 'https://deckofcardsapi.com/static/img/2D.png',
    '2c': 'https://deckofcardsapi.com/static/img/2C.png'
};

//dom elements
const deck = document.getElementById('deck');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const errorMsg = document.getElementById('errorMsg');
const results = document.getElementById('results');

document.addEventListener('DOMContentLoaded', async () => {
    //only load history if we're on the history page
    if (document.getElementById('historyContent')) {
        const result = await getHistory();
        if (result.success) {
            displayHistory(result.data);
        } else {
            showError(result.error);
        }
    }
});

//initialize deck
function initializeDeck() {
    deck.innerHTML = '';
    suits.forEach(suit => {
        ranks.forEach(rank => {
            const cardDiv = document.createElement('div');
            cardDiv.className = `card ${suit}`;
            cardDiv.dataset.card = rank + suit.charAt(0).toLowerCase();
            
            //create image
            const img = document.createElement('img');
            img.src = cardImages[cardDiv.dataset.card];
            img.className = 'card-image';
            img.onerror = () => {
                cardDiv.innerHTML = `${rank}<br>${suitSymbols[suit]}`;
            };
            
            cardDiv.appendChild(img);
            cardDiv.addEventListener('click', () => selectCard(cardDiv.dataset.card));
            deck.appendChild(cardDiv);
        });
    });
}

//area selection
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-area]').forEach(area => {
        area.addEventListener('click', () => selectArea(area.dataset.area));
    });
});

function selectArea(areaName) {
    //remove  selection
    document.querySelectorAll('[data-area]').forEach(area => {
        area.classList.remove('selected');
    });
    
    //select new area
    selectedArea = areaName;
    document.querySelector(`[data-area="${areaName}"]`).classList.add('selected');
    updateStatus();
}

//card selection
function selectCard(cardCode) {
    if (!selectedArea) {
        showError('Please select an area first (Hero, Villain, or Board)');
        return;
    }

    if (gameState.usedCards.has(cardCode)) {
        showError('This card is already in use');
        return;
    }

    const area = gameState[selectedArea];
    const maxCards = selectedArea === 'board' ? 5 : 2;

    if (area.length >= maxCards) {
        showError(`${selectedArea} is already full`);
        return;
    }

    //add card to area
    area.push(cardCode);
    gameState.usedCards.add(cardCode);

    //update UI
    updateAreaDisplay(selectedArea);
    updateDeckDisplay();
    validateGame();
    clearError();
}

//update area display
function updateAreaDisplay(areaName) {
    const areaElement = document.querySelector(`[data-area="${areaName}"]`);
    const cards = gameState[areaName];
    
    areaElement.querySelectorAll('.card').forEach((cardEl, index) => {
        if (cards[index]) {
            const cardCode = cards[index];
            const rank = cardCode.charAt(0);
            const suit = getSuitFromCode(cardCode.charAt(1));
            
            cardEl.className = `card ${suit}`;
            
            cardEl.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = cardImages[cardCode];
            img.className = 'card-image';
            img.onerror = () => {
                cardEl.innerHTML = `${rank}<br>${suitSymbols[suit]}`;
            };
            
            cardEl.appendChild(img);
            cardEl.onclick = () => removeCard(areaName, index);
        } else {
            cardEl.className = 'card back';
            cardEl.innerHTML = '';
            cardEl.onclick = null;
        }
    });
}

function getSuitFromCode(suitCode) {
    const suitMap = { 's': 'spades', 'h': 'hearts', 'd': 'diamonds', 'c': 'clubs' };
    return suitMap[suitCode];
}

//remove card
function removeCard(areaName, index) {
    const card = gameState[areaName][index];
    gameState[areaName].splice(index, 1);
    gameState.usedCards.delete(card);
    
    updateAreaDisplay(areaName);
    updateDeckDisplay();
    validateGame();
}

//update deck display
function updateDeckDisplay() {
    document.querySelectorAll('#deck .card').forEach(cardEl => {
        if (gameState.usedCards.has(cardEl.dataset.card)) {
            cardEl.classList.add('grayed');
        } else {
            cardEl.classList.remove('grayed');
        }
    });
}

//validation
function validateGame() {
    const errors = [];
    
    // Check player hands
    if (gameState.hero.length === 1) {
        errors.push('Hero needs 2 cards or 0 cards');
    }
    if (gameState.villain.length === 1) {
        errors.push('Villain needs 2 cards or 0 cards');
    }
    
    // Check board
    const boardCount = gameState.board.length;
    if (boardCount === 1 || boardCount === 2) {
        errors.push('Board must have 0, 3, 4, or 5 cards');
    }
    
    // Check if we have enough for calculation
    const hasValidHands = gameState.hero.length === 2 && gameState.villain.length === 2;
    const hasValidBoard = [0, 3, 4, 5].includes(boardCount);
    
    if (errors.length > 0) {
        showError(errors.join('. '));
        calculateBtn.disabled = true;
    } else if (hasValidHands && hasValidBoard) {
        calculateBtn.disabled = false;
        clearError();
    } else {
        calculateBtn.disabled = true;
        clearError();
    }
}

//error handling
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

function clearError() {
    errorMsg.classList.remove('show');
}

//status updates
function updateStatus() {
    const statusBar = document.querySelector('.status-bar');
    if (selectedArea) {
        statusBar.textContent = `Selected: ${selectedArea.toUpperCase()} - Click cards below to add them`;
    } else {
        statusBar.textContent = 'Select an area and choose cards from the deck below';
    }
}

//calculate equity
calculateBtn.addEventListener('click', async () => {
    const simulations = parseInt(document.getElementById('simulations').value);
    
    if (simulations < 1000 || simulations > 100000) {
        showError('Simulations must be between 1,000 and 100,000');
        return;
    }

    calculateBtn.disabled = true;
    calculateBtn.textContent = 'Calculating...';

    try {
        const result = await calculateEquity(gameState.hero, gameState.villain, gameState.board, simulations);
        
        if (result.success) {
            displayResults(result.data);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Connection error: ' + error.message);
    }

    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Calculate Equity';
});

//calculate equity function
async function calculateEquity(heroCards, villainCards, boardCards, simulationsMonte) {
    let inputData = {
        heroCards: heroCards,
        villainCards: villainCards,
        boardCards: boardCards,
        simulationsMonte: simulationsMonte
    }

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputData)
        });

        if(response.ok) {
            const data = await response.json();
            return { success: true, data: data };
        } else {
            let message = 'Error receiving output:' + response.status + ", " + response.statusText;
            console.error(message);
            return { success: false, error: message };
        }

    } catch (error) {
        let message = 'Error sending input:' + error;
        console.error(message);
        return { success: false, error: message };
    }
}

async function getHistory() {
    try {
        const response = await fetch('/history', {
            method: 'GET'
        });

        if(response.ok) {
            const data = await response.json();
            return { success: true, data: data };
        } else {
            let message = 'Error receiving history:' + response.status + ", " + response.statusText;
            console.error(message);
            return { success: false, error: message };
        }

    } catch (error) {
        let message = 'Server error:' + error;
        console.error(message);
        return { success: false, error: message };
    }
}

//display history
function displayHistory(historyData) {
    const historyContent = document.getElementById('historyContent');
    
    if (!historyData || historyData.length === 0) {
        historyContent.innerHTML = '<div class="no-history">No calculation history available</div>';
        return;
    }

    // Generate history items
    historyContent.innerHTML = historyData.map(item => {
        const timestamp = new Date(item.created_at).toLocaleString();
        const heroCards = formatCardsForDisplay(item.hero_cards);
        const villainCards = formatCardsForDisplay(item.villain_cards);
        const boardCards = formatCardsForDisplay(item.board_cards);

        return `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-timestamp">${timestamp}</span>
                    <span class="history-simulations">${item.simulations_monte.toLocaleString()} simulations</span>
                </div>
                
                <div class="history-cards">
                    <div class="card-group">
                        <div class="card-group-label">Hero</div>
                        <div class="card-row">${heroCards.map(card => `<img src="${cardImages[card]}" class="history-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="history-card-fallback" style="display:none;">${card.charAt(0)}<br>${suitSymbols[getSuitFromCode(card.charAt(1))]}</div>`).join('')}</div>
                    </div>
                    
                    <div class="card-group">
                        <div class="card-group-label">Villain</div>
                        <div class="card-row">${villainCards.map(card => `<img src="${cardImages[card]}" class="history-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="history-card-fallback" style="display:none;">${card.charAt(0)}<br>${suitSymbols[getSuitFromCode(card.charAt(1))]}</div>`).join('')}</div>
                    </div>
                    
                    <div class="card-group">
                        <div class="card-group-label">Board</div>
                        <div class="card-row">${generateBoardDisplay(boardCards)}</div>
                    </div>
                </div>

                <div class="history-results">
                    <div class="result-group">
                        <div class="result-group-title">Hero Win</div>
                        <div class="result-values">
                            <span class="result-exact">Exact: ${item.hero_win_exact}%</span>
                            <span class="result-monte">MC: ${item.hero_win_monte}%</span>
                        </div>
                    </div>
                    
                    <div class="result-group">
                        <div class="result-group-title">Villain Win</div>
                        <div class="result-values">
                            <span class="result-exact">Exact: ${item.villain_win_exact}%</span>
                            <span class="result-monte">MC: ${item.villain_win_monte}%</span>
                        </div>
                    </div>
                    
                    <div class="result-group">
                        <div class="result-group-title">Tie</div>
                        <div class="result-values">
                            <span class="result-exact">Exact: ${item.tie_exact}%</span>
                            <span class="result-monte">MC: ${item.tie_monte}%</span>
                        </div>
                    </div>
                    
                    <div class="result-group">
                        <div class="result-group-title">Error</div>
                        <div class="result-values">
                            <span class="result-exact">Margin: ${item.error_margin}%</span>
                            <span class="result-monte">Actual: ${item.error_actual}%</span>
                        </div>
                    </div>
                    
                    <div class="result-group">
                        <div class="result-group-title">Timing</div>
                        <div class="result-values">
                            <span class="result-exact">Exact: ${Math.round(item.execution_time_exact)}ms</span>
                            <span class="result-monte">MC: ${Math.round(item.execution_time_monte)}ms</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

//format cards for display
function formatCardsForDisplay(cards) {
    if (!cards || cards.length === 0) return [];
    return cards;
}

//generate board display
function generateBoardDisplay(boardCards) {
    const totalSlots = 5;
    const cardsToShow = boardCards || [];
    const cardBacksNeeded = totalSlots - cardsToShow.length;
    
    let display = '';
    
    // Show actual cards first
    cardsToShow.forEach(card => {
        display += `<img src="${cardImages[card]}" class="history-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="history-card-fallback" style="display:none;">${card.charAt(0)}<br>${suitSymbols[getSuitFromCode(card.charAt(1))]}</div>`;
    });
    
    // Add card backs for empty slots
    for (let i = 0; i < cardBacksNeeded; i++) {
        display += `<div class="history-card-back"></div>`;
    }
    
    return display;
}

//display results
function displayResults(data) {
    // Update equity displays
    updateEquityDisplay('hero', data.heroWinExact, data.tieExact, data.heroWinMonte, data.tieMonte);
    updateEquityDisplay('villain', data.villainWinExact, data.tieExact, data.villainWinMonte, data.tieMonte);

    // Update results panel
    document.getElementById('exactTime').textContent = Math.round(data.executionTimeExact) + 'ms';
    document.getElementById('monteTime').textContent = Math.round(data.executionTimeMonte) + 'ms';
    document.getElementById('errorMargin').textContent = data.errorMargin + '%';
    document.getElementById('actualError').textContent = data.errorActual + '%';
    document.getElementById('withinRange').textContent = data.withinExpectedRange ? 'Yes' : 'No';
    document.getElementById('withinRange').style.color = data.withinExpectedRange ? '#4caf50' : '#f44336';

    document.getElementById('heroExact').textContent = data.heroWinExact + '%';
    document.getElementById('heroMonte').textContent = data.heroWinMonte + '%';
    document.getElementById('villainExact').textContent = data.villainWinExact + '%';
    document.getElementById('villainMonte').textContent = data.villainWinMonte + '%';
    document.getElementById('tieExact').textContent = data.tieExact + '%';
    document.getElementById('tieMonte').textContent = data.tieMonte + '%';

    results.style.display = 'grid';
}

function updateEquityDisplay(player, winExact, tieExact, winMonte, tieMonte) {
    const equityEl = document.getElementById(`${player}-equity`);
    const spans = equityEl.querySelectorAll('span');
    
    // Use the provided values directly since the server already sends correct per-player data
    spans[0].textContent = winExact + '%';
    spans[1].textContent = tieExact + '%';
    spans[2].textContent = winMonte + '%';
    spans[3].textContent = tieMonte + '%';
    
    equityEl.style.display = 'block';
}

//reset functions
resetBtn.addEventListener('click', () => {
    gameState = { hero: [], villain: [], board: [], usedCards: new Set() };
    selectedArea = null;
    
    document.querySelectorAll('[data-area]').forEach(area => {
        area.classList.remove('selected');
        updateAreaDisplay(area.dataset.area);
    });
    
    updateDeckDisplay();
    validateGame();
    clearError();
    updateStatus();
    
    document.querySelectorAll('.equity-display').forEach(el => el.style.display = 'none');
    results.style.display = 'none';
});


//initialize when loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDeck();
    updateStatus();
});