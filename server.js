//setup dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { CardGroup, OddsCalculator } = require('poker-odds-calculator');
const { evaluateWinner } = require('./evaluateWinner');

//setup app and database
const db = new sqlite3.Database('./database.db');
const app = express();
const PORT = 1414;

//middleware
app.use(express.json());
app.use(express.static('public'));

//create database
db.run(`CREATE TABLE IF NOT EXISTS handHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    hero_cards TEXT NOT NULL,
    villain_cards TEXT NOT NULL,
    board_cards TEXT NOT NULL,

    hero_win_monte DECIMAL(5,2) NOT NULL,
    villain_win_monte DECIMAL(5,2) NOT NULL,
    tie_monte DECIMAL(5,2) NOT NULL,
    hero_win_exact DECIMAL(5,2) NOT NULL,
    villain_win_exact DECIMAL(5,2) NOT NULL,
    tie_exact DECIMAL(5,2) NOT NULL,

    simulations_monte INTEGER NOT NULL,
    execution_time_monte INTEGER NOT NULL,
    execution_time_exact INTEGER NOT NULL,

    error_margin DECIMAL(6,2) NOT NULL,
    error_actual DECIMAL(6,2) NOT NULL,
    within_expected_range BOOLEAN NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hero_cards, villain_cards, board_cards, simulations_monte)
)`);

//endpoints
app.post('/calculate', async (req, res) => {

    try{

        const heroCards = req.body.heroCards;
        const villainCards = req.body.villainCards;
        const boardCards = req.body.boardCards;
        const simulationsMonte = req.body.simulationsMonte;

        //calculate exact with api
        const resultsExact = await calculateEquityExact(heroCards, villainCards, boardCards);

        const heroWinExact = Math.round(resultsExact.heroWinExact * 100) / 100;
        const villainWinExact = Math.round(resultsExact.villainWinExact * 100) / 100;
        const tieExact = Math.round(resultsExact.tieExact * 100) / 100;
        const executionTimeExact = Math.round(resultsExact.executionTimeExact);

        //calculate monte method
        const resultsMonte = await calculateEquityMonteCarlo(heroCards, villainCards, boardCards, simulationsMonte);

        const heroWinMonte = Math.round(resultsMonte.heroWinMonte * 100) / 100;
        const villainWinMonte = Math.round(resultsMonte.villainWinMonte * 100) / 100;
        const tieMonte = Math.round(resultsMonte.tieMonte * 100) / 100;
        const executionTimeMonte = Math.round(resultsMonte.executionTimeMonte);

        //calculate error
        const resultsError = await calculateError(heroWinExact, heroWinMonte, villainWinExact, villainWinMonte, tieExact, tieMonte, simulationsMonte);

        const errorMargin = Math.round(resultsError.errorMargin * 100) / 100;
        const errorActual = Math.round(resultsError.errorActual * 100) / 100;
        const withinExpectedRange = resultsError.withinExpectedRange;

        let results = {
            heroWinExact: heroWinExact,
            villainWinExact: villainWinExact,
            tieExact: tieExact,
            executionTimeExact: executionTimeExact,
            heroWinMonte: heroWinMonte,
            villainWinMonte: villainWinMonte,
            tieMonte: tieMonte,
            executionTimeMonte: executionTimeMonte,
            errorMargin: errorMargin,
            errorActual: errorActual,
            withinExpectedRange: withinExpectedRange
        };

        const heroCardsString = JSON.stringify(heroCards);
        const villainCardsString = JSON.stringify(villainCards);
        const boardCardsString = JSON.stringify(boardCards);

        db.run(`INSERT INTO handHistory (
            hero_cards, 
            villain_cards, 
            board_cards, 
            simulations_monte,
            hero_win_exact,
            villain_win_exact,
            tie_exact,
            execution_time_exact,
            hero_win_monte,
            villain_win_monte,
            tie_monte,
            execution_time_monte,
            error_margin,
            error_actual,
            within_expected_range
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [
            heroCardsString, 
            villainCardsString, 
            boardCardsString, 
            simulationsMonte,
            heroWinExact,
            villainWinExact,
            tieExact,
            executionTimeExact,
            heroWinMonte,
            villainWinMonte,
            tieMonte,
            executionTimeMonte,
            errorMargin,
            errorActual,
            withinExpectedRange
        ], function(err) {
            if (err) {
                console.error('Database error:', err.message);
            } else {
                console.log('Hand history registered with ID:', this.lastID);
            }
        });

        res.json(results);

    } catch (error) {
        console.error('Error in /calculate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

app.get('/history', (req, res) => {  //get history

    db.all(`SELECT * FROM handHistory ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
        } else {
            try {
                const hands = rows.map(row => ({
                    ...row,
                    hero_cards: JSON.parse(row.hero_cards),
                    villain_cards: JSON.parse(row.villain_cards),
                    board_cards: JSON.parse(row.board_cards)
                }));
                res.json(hands);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).json({ error: 'Data parsing error' });
            }
        }
    });
});


//functions
function calculateEquityExact(heroCards, villainCards, boardCards) {

    heroCards = arrayToCardGroup(heroCards);
    villainCards = arrayToCardGroup(villainCards);
    boardCards = arrayToCardGroup(boardCards);

    const result = OddsCalculator.calculate([heroCards, villainCards], boardCards);

    const heroEquity = result.equities[0];
    const villainEquity = result.equities[1];

    const heroPossibleHands = heroEquity.possibleHandsCount;
    const heroWin = heroEquity.bestHandCount;
    const heroTie = heroEquity.tieHandCount;

    const villainPossibleHands = villainEquity.possibleHandsCount;
    const villainWin = villainEquity.bestHandCount;

    const heroWinExact = heroWin/heroPossibleHands * 100;
    const tieExact = heroTie/heroPossibleHands * 100;
    const villainWinExact = villainWin/villainPossibleHands * 100;
    const executionTimeExact = result.elapsedTime;

    return {
        heroWinExact: heroWinExact,
        villainWinExact: villainWinExact,
        tieExact: tieExact,
        executionTimeExact: executionTimeExact
    };
}

function calculateEquityMonteCarlo(heroCardsArray, villainCardsArray, boardCardsArray, simulationsMonte) {

    const startTime = performance.now();
    
    let heroWins = 0;
    let villainWins = 0;
    let ties = 0;

    let deckSet = new Set([
        'As', 'Ks', 'Qs', 'Js', 'Ts', '9s', '8s', '7s', '6s', '5s', '4s', '3s', '2s',
        'Ah', 'Kh', 'Qh', 'Jh', 'Th', '9h', '8h', '7h', '6h', '5h', '4h', '3h', '2h',
        'Ad', 'Kd', 'Qd', 'Jd', 'Td', '9d', '8d', '7d', '6d', '5d', '4d', '3d', '2d',
        'Ac', 'Kc', 'Qc', 'Jc', 'Tc', '9c', '8c', '7c', '6c', '5c', '4c', '3c', '2c'
    ]);

    let boardCardsSet = new Set(boardCardsArray);
    let deckArray = Array.from(deckSet);  

    for(let i = 0; i < heroCardsArray.length; i++) {
        deckSet.delete(heroCardsArray[i]);
    }
    for(let i = 0; i < villainCardsArray.length; i++) {
        deckSet.delete(villainCardsArray[i]);
    }
    for(let i = 0; i < boardCardsArray.length; i++) {
        deckSet.delete(boardCardsArray[i]);
    }

    let boardCardsArraySaved = Array.from(boardCardsSet);  
    let deckArraySaved = Array.from(deckSet);

    for(let i = 0; i < simulationsMonte; i++) {

        boardCardsSet = new Set(boardCardsArraySaved);
        boardCardsArray = Array.from(boardCardsArraySaved);
        deckArray = Array.from(deckArraySaved);

        while(boardCardsSet.size < 5) {
            let randomIndex = Math.floor(Math.random() * deckArray.length);
            boardCardsSet.add(deckArray[randomIndex]);
            deckArray.splice(randomIndex, 1);
        }

        boardCardsArray = Array.from(boardCardsSet);

        let result = evaluateWinner(heroCardsArray, villainCardsArray, boardCardsArray);
        //references evaluate winner

        if(result == "hero") {
            heroWins++;
        } else if (result == "villain") {
            villainWins++;
        } else if (result == "tie") {
            ties++;
        }

    }

    let heroWinMonte = heroWins/simulationsMonte * 100;
    let villainWinMonte = villainWins/simulationsMonte * 100;
    let tieMonte = ties/simulationsMonte * 100;

    const endTime = performance.now();
    const executionTimeMonte = endTime - startTime;

    return {
        heroWinMonte: heroWinMonte,
        villainWinMonte: villainWinMonte,
        tieMonte: tieMonte,
        executionTimeMonte: executionTimeMonte
    };

}

function calculateError(heroWinExact, heroWinMonte, villainWinExact, villainWinMonte, tieExact, tieMonte, simulationsMonte) {

    let heroErrorActual = Math.abs(heroWinExact - heroWinMonte);
    let villainErrorActual = Math.abs(villainWinExact - villainWinMonte);
    let tieErrorActual = Math.abs(tieExact - tieMonte);


    let zScore = 1.96;

    let heroWinMonteProbability = heroWinMonte / 100;
    let villainWinMonteProbability = villainWinMonte / 100;
    let tieMonteProbability = tieMonte / 100;

    let heroErrorMargin = zScore * Math.sqrt(heroWinMonteProbability * (1 - heroWinMonteProbability) / simulationsMonte) * 100;
    let villainErrorMargin = zScore * Math.sqrt(villainWinMonteProbability * (1 - villainWinMonteProbability) / simulationsMonte) * 100;
    let tieErrorMargin = zScore * Math.sqrt(tieMonteProbability * (1 - tieMonteProbability) / simulationsMonte) * 100;
    
    let errorActual = Math.max(heroErrorActual, villainErrorActual, tieErrorActual);
    let errorMargin = Math.max(heroErrorMargin, villainErrorMargin, tieErrorMargin);

    let withinExpectedRange = errorActual < errorMargin;

    return {
        errorMargin: errorMargin,
        errorActual: errorActual,
        withinExpectedRange: withinExpectedRange
    };
}

function arrayToCardGroup(cardArray) {
    return CardGroup.fromString(cardArray.join(''));
}

//start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});