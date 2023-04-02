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

    // Note - AI section hasn't been updated since very beginning of dev
    // Can't be used in multiplayer, but good chance it doesn't work now anyway I'd say?
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

function playCard(obj, cardVal, targetedPlayerID, guardGuessVal) {

    let G = obj.G;
    let playerID = obj.playerID;

    let hand = G.playerMap[playerID].hand;

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

    resolveCardEffects(G, cardVal, playerID, targetedPlayerID, guardGuessVal);

}

// -------------- Player status/hand helper functions ---------------

// This func should only ever need to be called when a player has one card in hand
function discardHand(G, playerID) {

    // Remove selected card from their hand
    let hand = G.playerMap[playerID].hand;

    if (hand.length !== 1){
        console.log("!! Discard hand called when player did not have exactly 1 card in hand! - only intended to be called with one card in hand, if you see this it might be causing bugs");
    }

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

    // Discard their hand, if they still have any cards in it
    if (G.playerMap[playerID].hand.length > 0){
        discardHand(G, playerID);
    }

    // Add to game log
    G.gameLog.push({ playerID: playerID, action: "knocked out" });

}


// ---------- Specific card effect helper functions

function resolveCardEffects(G, cardVal, playerID, targetedPlayerID, guardGuessVal) {


    // Return if card requires target and doesn't have one
    // e.g. if all players are handmaided, you just 'play' the card with no effect
    if (!targetedPlayerID && [1, 2, 3, 5, 6].includes(cardVal)){
        G.gameLog.push({
            action: "game info",
            msg: "Card had no effect as there was no target available"
        });
        return;
    }

    switch (cardVal) {
        case 1:
            resolveGuard(G, targetedPlayerID, guardGuessVal);
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
            resolvePrince(G, targetedPlayerID);
            break;
        case 6:
            resolveKing(G, playerID, targetedPlayerID);
            break;
        case 7:
            resolveCountess();
            break;
        case 8:
            resolvePrincess(G, playerID);
            break;
        default:
            console.log("Invalid card num played");
    }

}


function resolveGuard(G, targetedPlayerID, guardGuessVal) {
    
    // Choose another player and name a character other than Guard. If the
    // chosen player has that card in their hand, they are out of the round.

    let guessedRight = (G.playerMap[targetedPlayerID].hand[0].val === guardGuessVal);

    G.gameLog.push({
        action: "game info",
        msg: `Guard played: Card guessed is ${guardGuessVal}`
    });

    if (guessedRight){
        knockPlayerOut(G, targetedPlayerID);

    } else {
        G.gameLog.push({
            action: "game info",
            msg: `Guard result: Incorrect guess`
        });
    }

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


    // Set player status to protected
    G.playerMap[playerID].handmaid = true;

    // Additionally, at start of player's turn (in onBegin hook), if they are protected by handmaid from prev turn, it will be reset to false

    // In the action modal, other players will not be able to select that player as a target


}

function resolvePrince(G, targetedPlayerID) {

    let discardedCardVal = G.playerMap[targetedPlayerID].hand[0].val;

    // Targeted player discards hand, without resolving effects
    discardHand(G, targetedPlayerID);

    // If they discarded the princess, they are knocked out immediately
    if (discardedCardVal === 8){
        knockPlayerOut(G, targetedPlayerID);
    } else {
        // They draw new hand if not knocked out
        if (G.drawPile.length > 0){
            drawCard({G, playerID: targetedPlayerID});
        } 
        
        // If the deck is empty,the chosen player draws the facedown set-aside card from start of game
        else {
            let setAsideCard = G.discardPile.shift();
            
            G.playerMap[targetedPlayerID].hand.push(setAsideCard);
            G.gameLog.push({
                action: "game info",
                msg: "Deck is empty - player draws the facedown set-aside card from the discard pile"
            });
        }


    }


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
    // Card has no effect, but must be played if other card is King or Prince
    // --> Logic implemented in UI to stop other card being selected when Countess must be played
}

function resolvePrincess(G, playerID) {
    // Player is knocked out
    knockPlayerOut(G, playerID);
}