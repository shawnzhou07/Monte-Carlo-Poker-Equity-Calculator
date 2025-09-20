//exports evaluateWinner(heroCardsArray, villainCardsArray, boardCardsArray)

function rankCharToValue(ch) {

	switch (ch) {
		case 'A': return 14;
		case 'K': return 13;
		case 'Q': return 12;
		case 'J': return 11;
		case 'T': return 10;
		case '9': return 9;
		case '8': return 8;
		case '7': return 7;
		case '6': return 6;
		case '5': return 5;
		case '4': return 4;
		case '3': return 3;
		case '2': return 2;
		default: return 0;
	}
}

function countValues(values) {
	const map = new Map();
	for (const v of values) {
		map.set(v, (map.get(v) || 0) + 1);
	}
	return map; //map<number, count>
}

function countSuits(suits) {
	const map = new Map();
	for (const s of suits) {
		map.set(s, (map.get(s) || 0) + 1);
	}
	return map; //map<string, count>
}

function getHandRankVector(allCards) {
	
	const ranksUnsorted = [];
	const suitsUnsorted = [];
	for (const c of allCards) {
		ranksUnsorted.push(c[0]);
		suitsUnsorted.push(c[1]);
	}
	const valuesUnsorted = ranksUnsorted.map(rankCharToValue);

	//sort by ascending value
	const idxs = valuesUnsorted.map((_, i) => i).sort((a, b) => valuesUnsorted[a] - valuesUnsorted[b]);
	const values = idxs.map(i => valuesUnsorted[i]);
	const suits = idxs.map(i => suitsUnsorted[i]);

	const countedValues = countValues(values); //map value
	const countedSuits = countSuits(suits); //map suit

	//flush
	let flush = false;
	let flushSuit = '';
	for (const [s, cnt] of countedSuits.entries()) {
		if (cnt >= 5) {
			flush = true;
			flushSuit = s;
			break;
		}
	}

	//collect flush values
	const flushValues = [];
	if (flush) {
		for (let i = 0; i < suits.length; i++) {
			if (suits[i] === flushSuit) flushValues.push(values[i]);
		}
	}

	//straight flush 
	let straightFlush = false;
	let straightFlushHeight = 0;
	if (flush) {
		//remove duplicates
		const uniqueFlush = Array.from(new Set(flushValues));
		//already ascending
		let consec = 0;
		for (let i = 0; i < uniqueFlush.length - 1; i++) {
			if (uniqueFlush[i + 1] - uniqueFlush[i] === 1) {
				consec++;
				if (consec >= 4) {
					straightFlush = true;
					straightFlushHeight = uniqueFlush[i + 1];
				}
			} else {
				consec = 0;
			}
		}
		//wheel straight flush
		const hasWheel = uniqueFlush.includes(14) && uniqueFlush.includes(2) && uniqueFlush.includes(3) && uniqueFlush.includes(4) && uniqueFlush.includes(5);
		if (hasWheel) {
			straightFlush = true;
			straightFlushHeight = 5;
		}
	}

	const royalFlush = straightFlush && straightFlushHeight === 14;

	//straight
	const uniqueValues = Array.from(new Set(values));
	let straight = false;
	let straightHeight = 0;
	let consec = 0;
	for (let i = 0; i < uniqueValues.length - 1; i++) {
		if (uniqueValues[i + 1] - uniqueValues[i] === 1) {
			consec++;
			if (consec >= 4) {
				straight = true;
				straightHeight = uniqueValues[i + 1];
			}
		} else {
			consec = 0;
		}
	}
	const hasWheelStraight = uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5);
	if (hasWheelStraight) {
		straight = true;
		straightHeight = 5;
	}

	//multiples
	let quads = false;
	let quadsValue = 0;
	for (const [v, cnt] of countedValues.entries()) {
		if (cnt === 4) {
			quads = true;
			quadsValue = v;
		}
	}

	let tripsOne = false, tripsTwo = false;
	let tripsOneValue = 0, tripsTwoValue = 0;
	for (const [v, cnt] of countedValues.entries()) {
		if (cnt === 3) {
			if (tripsOne) {
				tripsTwo = true;
				tripsTwoValue = v;
			} else {
				tripsOne = true;
				tripsOneValue = v;
			}
		}
	}

	let pairOne = false, pairTwo = false, pairThree = false;
	let pairOneValue = 0, pairTwoValue = 0, pairThreeValue = 0;
	for (const [v, cnt] of countedValues.entries()) {
		if (cnt === 2) {
			if (pairOne && pairTwo) {
				pairThree = true;
				pairThreeValue = v;
			} else if (pairOne) {
				pairTwo = true;
				pairTwoValue = v;
			} else {
				pairOne = true;
				pairOneValue = v;
			}
		}
	}

	const handRankAndKickers = [];

	if (flush) {
		if (straightFlush) {
			if (royalFlush) {
				handRankAndKickers.push(10);
			} else {
				handRankAndKickers.push(9);
				handRankAndKickers.push(straightFlushHeight);
			}
		} else {
			handRankAndKickers.push(6);
			// take top 5 flush cards
			for (let i = flushValues.length - 1; i > flushValues.length - 6; i--) {
				handRankAndKickers.push(flushValues[i]);
			}
		}
	} else if (straight) {
		handRankAndKickers.push(5);
		handRankAndKickers.push(straightHeight);
	} else {
		if (quads) {
			handRankAndKickers.push(8);
			handRankAndKickers.push(quadsValue);
			// find highest remaining as kicker
			const tempValues = values.slice();
			for (let i = 0; i < tempValues.length; i++) {
				if (tempValues[i] === quadsValue) tempValues[i] = 0;
			}
			for (let i = tempValues.length - 1; i >= 0; i--) {
				if (tempValues[i] !== 0) {
					handRankAndKickers.push(tempValues[i]);
					break;
				}
			}
		} else if (tripsOne) {
			if (tripsTwo || pairOne) {
				//full house
				handRankAndKickers.push(7);
				if (tripsTwo) {
					//choose higher trips as trips
					handRankAndKickers.push(Math.max(tripsOneValue, tripsTwoValue));
					if (pairThree && pairThreeValue > Math.min(tripsOneValue, tripsTwoValue)) {
						handRankAndKickers.push(pairThreeValue);
					} else if (pairTwo && pairTwoValue > Math.min(tripsOneValue, tripsTwoValue)) {
						handRankAndKickers.push(pairTwoValue);
					} else if (pairOne && pairOneValue > Math.min(tripsOneValue, tripsTwoValue)) {
						handRankAndKickers.push(pairOneValue);
					} else {
						handRankAndKickers.push(Math.min(tripsOneValue, tripsTwoValue));
					}
				} else {
					handRankAndKickers.push(tripsOneValue);
					if (pairThree) {
						handRankAndKickers.push(pairThreeValue);
					} else if (pairTwo) {
						handRankAndKickers.push(pairTwoValue);
					} else {
						handRankAndKickers.push(pairOneValue);
					}
				}
			} else {
				//trips only
				handRankAndKickers.push(4);
				handRankAndKickers.push(tripsOneValue);
				const tempValues = values.slice();
				for (let i = 0; i < tempValues.length; i++) {
					if (tempValues[i] === tripsOneValue) tempValues[i] = 0;
				}
				let added = 0;
				for (let i = tempValues.length - 1; i >= 0; i--) {
					if (tempValues[i] !== 0) {
						handRankAndKickers.push(tempValues[i]);
						added++;
					}
					if (added === 2) break;
				}
			}
		} else if (pairOne) {
			if (pairTwo) {
				//two pair
				handRankAndKickers.push(3);
				let highPair, lowPair;
				if (pairThree) {
					//choose top two pairs from three pairs
					const pairs = [pairOneValue, pairTwoValue, pairThreeValue].sort((a, b) => b - a);
					highPair = pairs[0];
					lowPair = pairs[1];
				} else {
					highPair = Math.max(pairOneValue, pairTwoValue);
					lowPair = Math.min(pairOneValue, pairTwoValue);
				}
				handRankAndKickers.push(highPair);
				handRankAndKickers.push(lowPair);
				const tempValues = values.slice();
				for (let i = 0; i < tempValues.length; i++) {
					if (tempValues[i] === highPair || tempValues[i] === lowPair) tempValues[i] = 0;
				}
				for (let i = tempValues.length - 1; i >= 0; i--) {
					if (tempValues[i] !== 0) {
						handRankAndKickers.push(tempValues[i]);
						break;
					}
				}
			} else {
				//one pair
				handRankAndKickers.push(2);
				handRankAndKickers.push(pairOneValue);
				const tempValues = values.slice();
				for (let i = 0; i < tempValues.length; i++) {
					if (tempValues[i] === pairOneValue) tempValues[i] = 0;
				}
				let added = 0;
				for (let i = tempValues.length - 1; i >= 0; i--) {
					if (tempValues[i] !== 0) {
						handRankAndKickers.push(tempValues[i]);
						added++;
					}
					if (added === 3) break;
				}
			}
		} else {
			//high card
			handRankAndKickers.push(1);
			for (let i = values.length - 1; i > values.length - 6; i--) {
				handRankAndKickers.push(values[i]);
			}
		}
	}

	//pad to length 6
	while (handRankAndKickers.length < 6) {
		handRankAndKickers.push(0);
	}
	return handRankAndKickers;
}

function compareRankVectors(a, b) {
	//lexicographic compare of arrays
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const av = a[i] || 0;
		const bv = b[i] || 0;
		if (av > bv) return 1;
		if (av < bv) return -1;
	}
	return 0;
}

function evaluateWinner(heroCardsArray, villainCardsArray, boardCardsArray) {
	
	const heroAll = heroCardsArray.concat(boardCardsArray);
	const villainAll = villainCardsArray.concat(boardCardsArray);

	const heroRank = getHandRankVector(heroAll);
	const villainRank = getHandRankVector(villainAll);

	const cmp = compareRankVectors(heroRank, villainRank);
	if (cmp > 0) return 'hero';
	if (cmp < 0) return 'villain';
	return 'tie';
}

module.exports = { evaluateWinner };