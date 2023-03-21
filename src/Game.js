import { CARD_INFO } from "./CardInfo";
import { INVALID_MOVE } from 'boardgame.io/core';


export const LoveLetter = {
    // Set initial state of G
    setup: ({ random, ctx }) => {

        // Create card piles
        let drawPile = makeDeck();
        drawPile = random.Shuffle(drawPile);
        let discardPile = [drawPile.pop()];
        let playedPile = [];

        // Make map of the players - hands, round status, favour token
        let playerMap = makePlayerMap(ctx);

        dealStartingHands(playerMap, drawPile);

        // Initial state for G object
        return {
            drawPile: drawPile,
            discardPile: discardPile,
            playedPile: playedPile,
            playerMap: playerMap
        }
    },

    turn: { minMoves: 1, maxMoves: 2 },

    moves: { playCard, drawCard },

    minPlayers: 3,


    // endIf is called every time our state updates - this seems unnecessarily often though?
    // Only required to be called when a round ends...
    // Unless we should use endif for a round, rather than the whole game?
    endIf: ({ G, ctx }) => {
        // In practice this will actually be if a player gets X favor tokens
        // This will actually currently not allow the last player to play their final card either
        if (G.drawPile.length <= 0) {
            return { drawPileEmpty: true };
        }
    },

    ai: {
        enumerate: (G, ctx) => {
            let moves = [];
            // for (let i = 0; i < 9; i++) {
            //     if (G.cells[i] === null) {
            //         moves.push({ move: 'clickCell', args: [i] });
            //     }
            // }
            // If hand size is less than two, can draw
            let player = G.playerMap[ctx.currentPlayer];
            if (player.hand.length < 2){
                moves.push({move: 'drawCard'});
            } 
            // If hand size is two, can play one of the two cards
            else if (player.hand.length === 2){
                moves.push({move: 'playCard', args: player.hand[0].val});
                moves.push({move: 'playCard', args: player.hand[1].val});
            }

            return moves;
        }
    }

};

// Make an unshuffled deck array of cards with correct quantities
function makeDeck() {

    let deck = [];

    // For each card type (8 in OG version), create card type
    for (let cardVal = 1; cardVal <= CARD_INFO.highestCardValue; cardVal++) {

        // Loop for correct quantity of each card.
        for (let i = 0; i < CARD_INFO.cardQuantity[cardVal]; i++) {
            let card = {
                val: cardVal,
                name: CARD_INFO.cardNames[cardVal]
            }
            deck.push(card);
        }
    }

    return deck;

}

function makePlayerMap(ctx) {

    let playerMap = {};

    // Create an object for each player using their ID as the key
    for (let i = 0; i < ctx.playOrder.length; i++) {
        let playerID = ctx.playOrder[i];

        if (playerMap[playerID]) {
            throw new Error("Player ID already exists in player map!");
        }

        playerMap[playerID] = {
            hand: [],
            knockedOutOfRound: false,
            favourTokenCount: 0
        }

    }

    return playerMap;


}

function dealStartingHands(playerMap, drawPile) {

    for (const playerID in playerMap) {
        let card = drawPile.pop();
        playerMap[playerID].hand.push(card);
    }

}



// -------------- GAME MOVE HELPER FUNCTIONS ---------------

function drawCard({ G, playerID }) {
    if (G.drawPile.length <= 0) {
        console.log("INVALID MOVE: Draw pile is already empty, cannot draw card!");
        return INVALID_MOVE;
    }

    let hand = G.playerMap[playerID].hand;

    // NOTE - if you implement the V2 chancellor card at any point, you will have to edit this!
    if (hand.length > 1) {
        console.log("INVALID MOVE: Player hand size is already at maximum!");
        return INVALID_MOVE;
    }

    let drawn = G.drawPile.pop();
    hand.push(drawn);
}

function playCard({ G, playerID }, cardNum) {

    let hand = G.playerMap[playerID].hand;
    // Get values of cards in hand
    let handVals = [hand[0].val];
    if (hand[1]) {
        handVals.push(hand[1].val);
    }

    // Ask player which card to play - will obvi change how this is selected at some point
    let cardVal;
    do {
        // CURRENTLY ONLY USED BY THE AI, BUT WILL BE USED BY PLAYERS LATER 
        if(cardNum){
            cardVal = cardNum;
            break;
        }

        
        cardVal = prompt("Which card from your hand do you want to play? (Input only the card value, not the name)");
        if (cardVal === null) {
            console.log("INVALID MOVE: Did not specify card to play");
            return INVALID_MOVE;
        }
        else {
            cardVal = parseInt(cardVal), 10;

        }
    } while (!handVals.includes(cardVal));


    // Remove selected card from their hand
    let playedCard;
    if (hand[1].val === cardVal) {
        playedCard = hand.pop();
    } else {
        playedCard = hand.shift();
    }

    // Add to played pile
    G.playedPile.push(playedCard);

}




