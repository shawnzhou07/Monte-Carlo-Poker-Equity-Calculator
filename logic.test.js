//imports all functions
const { 
    evaluateWinner, 
    getHandRankVector,
    rankCharToValue,
    countValues,
    countSuits,
    compareRankVectors
} = require('./evaluateWinner');

    //getHandRankVector

test('properly evaluates A-5 straight flush with messy array', () => {

    const hand = getHandRankVector([ '4s', 'As', '2s', 'Kh', '5s', 'Qd', '3s']);
    const expectedResult = [9, 5, 0, 0, 0, 0];
    expect(hand).toEqual(expectedResult);

})

test('properly evaluates four of a kind', () => {
    const hand = getHandRankVector(['7s', '7h', '7d', '7c', 'Ah', '3c', '2d']);
    const expectedResult = [8, 7, 14, 0, 0, 0];
    expect(hand).toEqual(expectedResult);
})

test('properly evaluates two pair', () => {
    const hand = getHandRankVector(['As', 'Ah', 'Kd', 'Kc', 'Qh', '3c', '2d']);
    const expectedResult = [3, 14, 13, 12, 0, 0];
    expect(hand).toEqual(expectedResult);
})

    //evaluateWinner

test('hero wins with flush over straight', () => {
    const hero = ['Ah', '8h'];
    const villain = ['9c', 'Td'];
    const board = ['Kh', 'Qh', '3h', 'Jd', '2c'];
    expect(evaluateWinner(hero, villain, board)).toBe('hero');
})

test('villain wins with full house over flush', () => {
    const hero = ['Ah', '8h'];
    const villain = ['Kd', 'Kc'];
    const board = ['Kh', 'Qh', '3h', 'Ks', '2c'];
    expect(evaluateWinner(hero, villain, board)).toBe('villain');
})

test('tie with same straight on board', () => {
    const hero = ['2h', '3c'];
    const villain = ['4d', '5s'];
    const board = ['6s', '7h', '8d', '9c', 'Tc'];
    expect(evaluateWinner(hero, villain, board)).toBe('tie');
})

test('hero wins with higher kicker', () => {
    const hero = ['As', 'Kh'];
    const villain = ['Ac', 'Qd'];
    const board = ['Ad', '7h', '5c', '3s', '2d'];
    expect(evaluateWinner(hero, villain, board)).toBe('hero');
})

test('villain wins with better two pair', () => {
    const hero = ['Jh', 'Tc'];
    const villain = ['Ah', 'Kd'];
    const board = ['As', 'Kc', 'Js', '5h', '3d'];
    expect(evaluateWinner(hero, villain, board)).toBe('villain');
})

    //rankCharToValue

test('rankCharToValue converts all ranks correctly', () => {
    expect(rankCharToValue('A')).toBe(14);
    expect(rankCharToValue('K')).toBe(13);
    expect(rankCharToValue('Q')).toBe(12);
    expect(rankCharToValue('J')).toBe(11);
    expect(rankCharToValue('T')).toBe(10);
    expect(rankCharToValue('9')).toBe(9);
    expect(rankCharToValue('2')).toBe(2);
});

    //countValues & countSuits

test('countValues counts card values correctly', () => {
    const values = [14, 14, 13, 12, 11];
    const counted = countValues(values);
    expect(counted.get(14)).toBe(2);
    expect(counted.get(13)).toBe(1);
    expect(counted.get(12)).toBe(1);
});

test('countSuits counts suits correctly', () => {
    const suits = ['h', 'h', 's', 'd', 'h'];
    const counted = countSuits(suits);
    expect(counted.get('h')).toBe(3);
    expect(counted.get('s')).toBe(1);
    expect(counted.get('d')).toBe(1);
});

    //compareRankVectors

test('compareRankVectors identifies winner correctly', () => {
    const royalFlush = [10, 0, 0, 0, 0, 0];
    const straightFlush = [9, 5, 0, 0, 0, 0];
    const quads = [8, 7, 14, 0, 0, 0];
    
    expect(compareRankVectors(royalFlush, straightFlush)).toBe(1);
    expect(compareRankVectors(straightFlush, royalFlush)).toBe(-1);
    expect(compareRankVectors(quads, quads)).toBe(0);
});

test('compareRankVectors handles kicker comparison', () => {
    const pairWithAceKicker = [2, 10, 14, 13, 12, 0];
    const pairWithKingKicker = [2, 10, 13, 12, 11, 0];
    
    expect(compareRankVectors(pairWithAceKicker, pairWithKingKicker)).toBe(1);
});
