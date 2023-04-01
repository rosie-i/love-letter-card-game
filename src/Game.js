import { CARD_INFO } from "./CardInfo";
import { GAME_INFO } from "./GameInfo";
import { INVALID_MOVE } from 'boardgame.io/core';


export const LoveLetter = {
    // Set initial state of G
    setup: ({ ctx }) => {

        // Create empty card piles - deck, etc will be created in roundplay phase setup hook

        // Make map of the players - hands, round status, favour token
        let playerMap = makePlayerMap(ctx);


        // Initial state for G object
        return {
            drawPile: [],
            discardPile: [],
            playedPile: [],
            playerMap: playerMap,
            gameLog: [],
            roundNumber: 0,
            winnerOfLastRound: null
        }
    },


    phases: {

        roundPlay: {
            // Do we want start: true? Or should we have a button that lets us start the 
            // game mechanics once all players have joined the room?
            start: true,

            next: 'roundScoreAndCleanup',

            // NOTE - on begin hooks only run on server, not client
            // Phase setup hook: create + shuffle deck, deal starting card, set start player
            onBegin: ({ G, ctx, random }) => {

                G.roundNumber++;

                G.drawPile = makeDeck();
                G.drawPile = random.Shuffle(G.drawPile);
                G.discardPile = [G.drawPile.pop()];
                // Played pile is already empty and should remain so

                dealStartingHands(G.playerMap, G.drawPile);

                // Make all players active in round again and reset anything like handmaid effect
                resetPlayerRoundInfo(G.playerMap);

                // TO IMPLEMENT - SET THE STARTING PLAYER - (last round winner, or random player if 1st round)

                // ROSIE IMP!! Log that we are starting a round and which player is starting!
                // Add to game log
                G.gameLog.push({
                    action: "game info",
                    msg: `Starting round number ${G.roundNumber}: Player XXX goes first`
                });
            },

            moves: { playCard },

            turn: {
                // While this is true, will it end the turn as soon as move is made
                // Without waiting for other stages? - And also I can't end turn of ppl who are knocked out
                // minMoves: 1,
                maxMoves: 1,

                // BEGIN HOOK - RUNS EVERY TIME A NEW TURN BEGINS
                onBegin: ({ G, ctx, events }) => {
                    // Check if player knocked out - if yes, end their turn automatically
                    if (G.playerMap[ctx.currentPlayer].knockedOutOfRound) {
                        console.log(`Player ${ctx.currentPlayer} is already knocked out of round, skipping their turn`);
                        events.endTurn();
                    } else {
                        // Otherwise, draw card to start turn
                        drawCard({ G, playerID: ctx.currentPlayer });
                        // If they were protected by handmaid from last turn, reset
                        if (G.playerMap[ctx.currentPlayer].handmaid){
                            G.playerMap[ctx.currentPlayer].handmaid = false;
                        }

                    }
                },

                // onEnd of player turn hook - check if round should end (draw pile empty or one active player remaining)
                onEnd: ({ G, events }) => {

                    if (isOnlyOneActivePlayer(G.playerMap) || G.drawPile.length === 0) {
                        // We should move to roundScoring phase
                        events.setPhase('roundScoreAndCleanup');
                    }

                }


            }

        },

        roundScoreAndCleanup: {
            // All remaining active players reveal their cards
            // The one(s) with the highest card get a token 
            // Most recent winner is saved in G (randomise winner if multiple)
            // Cleanup - remove cards from hands + card piles
            // Check if game should end
            // If not, start a new round

            onBegin: ({ G, events }) => {

                scoreRoundAndAwardTokens(G, getActivePlayerIDs(G.playerMap));

                roundCleanup(G);

                let winners = getPlayerIDsMeetingWinConditions(G);

                if (winners.length > 0){
                    events.endGame({winningPlayerIDs: winners});
                } else {
                    // Start next round
                    events.setPhase('roundPlay');
                }

            },


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
            favourTokenCount: 0,
            handmaid: false
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
        playerMap[playerID].handmaid = false;
    }
}

function isOnlyOneActivePlayer(playerMap){
    let activePlayers = getActivePlayerIDs(playerMap);

    // In case there are no active players, may be helpful to have this debug msg logged
    if (activePlayers.length === 0) {
        console.log("Num of active players calculated as:", activePlayers);
        console.log("This may be a bug, would expect there to be at least one when calling this function");
    }
    
    return (activePlayers.length === 1);
}

function getActivePlayerIDs(playerMap) {
    let activePlayerIDs = [];

    for (const playerID in playerMap){
        if(!playerMap[playerID].knockedOutOfRound){
            activePlayerIDs.push(playerID);
        }
    }

    return activePlayerIDs;

}

function scoreRoundAndAwardTokens(G, activePlayerIDs){
    // Get all winning players
    let winningPlayerIDs = getRoundWinningPlayerIDs(G, activePlayerIDs);

    // Give each winning player a token
    winningPlayerIDs.forEach((id) => {
        G.playerMap[id].favourTokenCount++;
    });

    // Set winner in game hist - this randomly picks one (to start next round) if there is a tie
    G.winnerOfLastRound = winningPlayerIDs[Math.floor(Math.random()*winningPlayerIDs.length)];

    // Log the player(s) who won the round and their card
    G.gameLog.push({
        action: "round score info",
        winningCardVal: G.playerMap[G.winnerOfLastRound].hand[0].val,
        winningPlayerIDs: winningPlayerIDs
    });



}

function getRoundWinningPlayerIDs(G, activePlayerIDs) {

    // Iterate over hands
    let highestCardSeen = 0;
    let winningPlayerIDs = [];

    for (const playerID of activePlayerIDs) {

        let playerCardVal = G.playerMap[playerID].hand[0].val;
        // If that card val is higher than the previously seen, reset winning playersID to be just this player
        // And update highest card seen
        if (playerCardVal > highestCardSeen){
            winningPlayerIDs = [playerID];
            highestCardSeen = playerCardVal;
        }

        // If it's the same as highest, add them to winning playerIDs
        else if (playerCardVal === highestCardSeen){
            winningPlayerIDs.push(playerID);
        }
        // If it's lower, do nothing, they haven't won
    }

    return winningPlayerIDs;

}

function roundCleanup(G){
    // Remove cards from hands + card piles
    for (const playerID in G.playerMap){
        G.playerMap[playerID].hand = [];
    }

    // Empty card piles
    G.drawPile = [];
    G.discardPile = [];
    G.playedPile = [];

}

function getPlayerIDsMeetingWinConditions(G){
    // Iterate over player map, check if winning token count has been reached
    let winningPlayerIDs = [];

    for (const playerID in G.playerMap){
        if (G.playerMap[playerID] >= GAME_INFO.tokensRequiredForWin){
            winningPlayerIDs.push(playerID);
        }
    }

    return winningPlayerIDs;

}


// -------------- GAME MOVE HELPER FUNCTIONS ---------------

function drawCard({ G, playerID }) {

    if (G.drawPile.length <= 0) {
        console.log("INVALID MOVE: Draw pile is already empty, cannot draw card! Player trying to draw:", playerID);
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

    // Add to game log
    G.gameLog.push({
        playerID: playerID,
        action: "drew",
        cardVal: drawn.val
    });
}

function playCard(obj, cardVal, targetedPlayerID) {

    let G = obj.G;
    let playerID = obj.playerID;

    let hand = G.playerMap[playerID].hand;

    // No longer needed? It was only to validate the move, but if you can only select one in your hand on screen then not necessarily required
    // Though maybe handy to rtn invalid move anyway, just as a safeguard 
    // // Get values of cards in hand
    // let handVals = [hand[0].val];
    // if (hand[1]) {
    //     handVals.push(hand[1].val);
    // }

    // Remove selected card from their hand
    let playedCard;
    if (hand[1].val === cardVal) {
        playedCard = hand.pop();
    } else {
        playedCard = hand.shift();
    }

    // Add to played pile
    G.playedPile.push(playedCard);


    // Add to game log 
    G.gameLog.push({
        playerID: obj.ctx.currentPlayer,
        action: "played",
        cardVal: cardVal,
        targetedPlayerID: targetedPlayerID
    });

    // IMPLEMENT - ACTION THE EFFECTS OF THE CARD
    resolveCardEffects(G, cardVal, playerID, targetedPlayerID);

}

// -------------- Player status/hand helper functions ---------------

// This func should only ever need to be called when a player has one card in hand
function discardHand(G, playerID) {
    // Remove selected card from their hand
    let hand = G.playerMap[playerID].hand;
    let discardedCard = hand.pop();

    // Add to discard pile
    G.discardPile.push(discardedCard);

    // Add to game log
    G.gameLog.push({
        playerID: playerID,
        action: "discarded",
        cardVal: discardedCard.val
    });

    // If they still have any cards in their hand, some logic is off
    if (hand.length > 0) {
        throw new Error("Player should never have more than one card in hand when discarding card");
    }
}

function knockPlayerOut(G, playerID) {
    // Set status
    G.playerMap[playerID].knockedOutOfRound = true;

    // Discard their hand
    discardHand(G, playerID);

    // Add to game log
    G.gameLog.push({ playerID: playerID, action: "knocked out" });

}


// ---------- Specific card effect helper functions

function resolveCardEffects(G, cardVal, playerID, targetedPlayerID) {

    // TO IMPLEMENT:
    // If card requires target and doesn't have one (or otherwise has no effects)
    // Then just return? e.g. if all players are handmaided, you just 'play' the card with no effect
    // Which will currently throw an error for most resolve funcs here
    // So maybe we pass in a cardHasNoEffect parameter too? And just return here if true?
    // Otherwise we do it card by card... Which might be better? Dunno, depends what we want to render as result to players

    switch (cardVal) {
        case 1:
            console.log("Card 1 has not yet been implemented");
            break;
        case 2:
            console.log("Card 2 has not yet been implemented");
            break;
        case 3:
            resolveBaron(G, playerID, targetedPlayerID);
            break;
        case 4:
            resolveHandmaid(G, playerID);
            break;
        case 5:
            console.log("Card 5 has not yet been implemented");
            break;
        case 6:
            resolveKing(G, playerID, targetedPlayerID);
            break;
        case 7:
            console.log("Card 7 has not yet been implemented");
            break;
        case 8:
            console.log("Card 8 has not yet been implemented");
            break;
        default:
            console.log("Invalid card num played");
    }

}

function resolveGuard() {

}

function resolvePriest() {

}

function resolveBaron(G, playerID, targetedPlayerID) {

    // Choose another player. You and that player secretly compare your hands. 
    // Whoever has the lowervalue card is out of the round.
    // If there is a tie, neither player is out of the round

    let playerCardVal = G.playerMap[playerID].hand[0].val;
    let opponentCardVal = G.playerMap[targetedPlayerID].hand[0].val;

    if (typeof playerCardVal !== "number" || typeof opponentCardVal !== "number") {
        throw new Error("Baron - values compared were not both of type number. playerCardVal:", playerCardVal, " | opponentCardVal:", opponentCardVal);
    }


    if (playerCardVal < opponentCardVal) {
        // Knock out playerID
        knockPlayerOut(G, playerID);
    }
    else if (opponentCardVal < playerCardVal) {
        // Knock out opponent
        knockPlayerOut(G, targetedPlayerID);

    }
    else {
        // Val is the same, nobody is knocked out
        // Send log message I guess
        G.gameLog.push({
            action: "game info",
            msg: "Baron result: Card values were equal - neither player is knocked out"
        });
    }

}

function resolveHandmaid(G, playerID) {
    // Until the start of your next turn,
    // other players cannot choose you
    // for their card effects.

    // In the rare case that all other players still in
    // the round are “protected” by a Handmaid when
    // you play a card, do the following:
    // ❧ If that card requires you to choose another
    // player (Guard, Priest, Baron, King), your
    // card is played with no effect.
    // ❧ If that card requires you to choose any
    // player (Prince), then you must choose
    // yourself for the effect.


    // TODO 
    // Set player status to protected
    G.playerMap[playerID].handmaid = true;

    // Additionally, at start of player's turn (in onBegin hook), if they are protected by handmaid from prev turn, it will be reset to false

    // In the action modal, other players will not be able to select that player as a target


}

function resolvePrince() {

}

function resolveKing(G, playerID, targetedPlayerID) {

    // Swap hands of the two players
    [G.playerMap[playerID].hand, G.playerMap[targetedPlayerID].hand] = [G.playerMap[targetedPlayerID].hand, G.playerMap[playerID].hand];

    G.gameLog.push({
        action: "game info",
        msg: "King played - Players swapped hands"
    });
}

function resolveCountess() {

}

function resolvePrincess() {

}