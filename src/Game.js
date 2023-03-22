import { CARD_INFO } from "./CardInfo";
import { INVALID_MOVE } from 'boardgame.io/core';


export const LoveLetter = {
    // Set initial state of G
    setup: ({ ctx }) => {

        // Create empty card piles - deck, etc will be created in roundplay phase setup hook
        let drawPile = [];
        let discardPile = [];
        let playedPile = [];

        // Make map of the players - hands, round status, favour token
        let playerMap = makePlayerMap(ctx);



        // Initial state for G object
        return {
            drawPile: drawPile,
            discardPile: discardPile,
            playedPile: playedPile,
            playerMap: playerMap
        }
    },


    phases: {

        roundPlay: {
            // Do we want start: true? Or should we have a button that lets us start the 
            // game mechanics once all players have joined the room?
            start: true,

            // NOTE - on begin hooks only run on server, not client
            // Phase setup hook: create + shuffle deck, deal starting card, set start player
            onBegin: ({ G, ctx, random }) => {

                G.drawPile = makeDeck();
                G.drawPile = random.Shuffle(G.drawPile);
                G.discardPile = [G.drawPile.pop()];
                // Played pile is already empty and should remain so

                dealStartingHands(G.playerMap, G.drawPile);

                // Make all players active in round again and reset anything like handmaid effect
                resetPlayerRoundInfo(G.playerMap);

                // TO IMPLEMENT - SET THE STARTING PLAYER - (last round winner, or random player if 1st round)

            },

            moves: { playCard },

            turn: {
                // While this is true, will it end the turn as soon as move is made
                // Without waiting for other stages?
                minMoves: 1,
                maxMoves:1,

                // BEGIN HOOK - RUNS EVERY TIME A NEW TURN BEGINS
                onBegin: ({ G, ctx, events }) => {
                    // Check if player knocked out - if yes, end their turn automatically
                    if (G.playerMap[ctx.currentPlayer].knockedOutOfRound){
                        events.endTurn();
                    } else {
                        // Otherwise, draw card to start turn
                        drawCard({G, playerID: ctx.currentPlayer});
                        events.setStage('playCard');
                    }
                },

                stages: {
                    playCard: {
                        // Players selects which card to play, remove it from their hand and put it on play pile
                        next: 'chooseTarget'
                    },
                    chooseTarget: {
                        // Not always required, depends on card played
                    },
                    resolveCardEffects: {
                        // e.g. Reveal card, compare hands, knock players out, etc.
                    }
                }

                // IMPLEMENT ONEND HOOK - check if round should end (deck empty/only one player left in). 
                // If not, carry on to next player's turn
                // If yes, move to roundScoring phase
            }

        },

        roundScoring: {
            // All remaining active players reveal their cards
            // The one(s) with the highest card get a token 
            // Most recent winner is saved in G (randomise winner if multiple)


        },

        roundCleanup: {
            // Remove cards from player hands, discard, and played pile.

            // ON END HOOK - Check if a player has enough tokens, then go to end of game if so. 
            // (This could also be at end of roundscoring?) - but just thinking it's neater to always clear hands etc

        },

        endOfGame: {
            // Winner is displayed, any options to replay, etc. are shown
        }
    },


    moves: { playCard, drawCard },

    minPlayers: 2,


    // endIf is called every time our state updates - this seems unnecessarily often though?
    // Only required to be called when a round ends...
    // Unless we should use endif for a round, rather than the whole game?
    // endIf: ({ G, ctx }) => {
    //     // In practice this will actually be if a player gets X favor tokens
    //     // This will actually currently not allow the last player to play their final card either
    //     if (G.drawPile.length <= 0) {
    //         return { drawPileEmpty: true };
    //     }
    // },

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
            if (player.hand.length < 2) {
                moves.push({ move: 'drawCard' });
            }
            // If hand size is two, can play one of the two cards
            else if (player.hand.length === 2) {
                moves.push({ move: 'playCard', args: player.hand[0].val });
                moves.push({ move: 'playCard', args: player.hand[1].val });
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

function resetPlayerRoundInfo(playerMap) {
    for (const playerID in playerMap) {
        playerMap[playerID].knockedOutOfRound = false;
    }
}



// -------------- GAME MOVE HELPER FUNCTIONS ---------------

function drawCard({G, playerID}) {

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

function playCard(obj, cardNum) {

    let G = obj.G;
    let playerID = obj.playerID;

    let hand = G.playerMap[playerID].hand;
    // Get values of cards in hand
    let handVals = [hand[0].val];
    if (hand[1]) {
        handVals.push(hand[1].val);
    }

    // Remove selected card from their hand
    let playedCard;
    if (hand[1].val === cardNum) {
        playedCard = hand.pop();
    } else {
        playedCard = hand.shift();
    }

    // Add to played pile
    G.playedPile.push(playedCard);

}

