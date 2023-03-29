import { CARD_INFO } from "../CardInfo";
import OpponentsArea from "./OpponentsArea";
import CardPileArea from "./CardPileArea";
import PlayerHandInfoArea from "./PlayerHandInfoArea";
import GameLogInfoArea from "./GameLogArea";
import ChatArea from "./ChatArea";

class Board {
    constructor({G, ctx}, client) {

        this.client = client;

        this.container = document.getElementById('gameplayView');
        this.opponentInfoContainer = this.container.getElementsByClassName("gameplay-opponentInfoContainer")[0];
        this.cardPilesAreaContainer = this.container.getElementsByClassName("gameplay-cardPilesAreaContainer")[0];
        this.playerHandAndInfoContainer = this.container.getElementsByClassName("gameplay-playerHandAndInfoContainer")[0];
        this.gameLogContainer = this.container.getElementsByClassName("gameplay-gameLogContainer")[0];
        this.chatContainer = this.container.getElementsByClassName("gameplay-chatContainer")[0];


        // Might get rid of two below
        // play area no longer exists and i think everything using it is commented out
        // this.playArea = document.getElementById('play-area');
        // this.gameLog = document.getElementById('game-log');


        // IN PROGRESS - IMPLEMENTING! 
        this.createBoard({G, ctx});

        // HAVE COMMENTED OUT ATTACH LISTENERS FOR THE MO BECAUSE THEY ARE FOR OLD ACTION BUTTONS!
        // this.attachListeners();

    }

    createBoard({G, ctx}) {

        // ---- DONE:
        // NOTE: HAVE I DONE STATE UPDATE FOR NEW OPPONENTS AREA THOUGH??
        // NEED TO DOUBLE CHECK!! I DON'T THINK I FINISHED IT!

        new OpponentsArea(this, G);
        new ChatArea(this, G);


        // ---- IN PROGRESS:
        new CardPileArea(this, G);
        new PlayerHandInfoArea(this, G);

        // ---- TO IMPLEMENT/REFACTOR:
        new GameLogInfoArea(this, G);

        // THIS CAN STAY HERE FOR NOW BUT WILL PROBS GET RID OF PLAY-AREA IN FAVOUR OF gameplay-cardPilesAreaContainer
        // let drawPileDiv = document.createElement("div");
        // this.drawPileDiv = drawPileDiv;
        // drawPileDiv.classList.add("drawPile");
        // drawPileDiv.textContent = "Draw pile loading";
        // this.playArea.append(drawPileDiv);

        // let discardPileDiv = document.createElement("div");
        // this.discardPileDiv = discardPileDiv;
        // discardPileDiv.classList.add("discardPile");
        // discardPileDiv.textContent = "Discard pile loading";
        // this.playArea.append(discardPileDiv);

        // let playedPileDiv = document.createElement("div");
        // this.playedPileDiv = playedPileDiv;
        // playedPileDiv.classList.add("playedPile");
        // playedPileDiv.textContent = "Played pile loading";
        // this.playArea.append(playedPileDiv);


        // SOME OF THIS MIGHT BE USEFUL
        // // PLAYER ACTION STUFF
        // let playerActionDiv = document.createElement("div");
        // playerActionDiv.classList.add("playerActionDiv");
        // playerActionDiv.textContent = "Player actions:";

        // let drawCardBtn = document.createElement("button");
        // let playCard1Btn = document.createElement("button");
        // let playCard2Btn = document.createElement("button");
        // let endTurnBtn = document.createElement("button");

        // drawCardBtn.classList.add("drawCardBtn");
        // // Hiding draw card button atm - auto-draws at start of your turn
        // // Only other occasion player would need draw card is Prince being played on them
        // drawCardBtn.classList.add("hidden");
        // playCard1Btn.classList.add("playCard1Btn");
        // playCard1Btn.classList.add("hidden");
        // playCard2Btn.classList.add("playCard2Btn");
        // playCard2Btn.classList.add("hidden");
        // endTurnBtn.classList.add("endTurnBtn");

        // drawCardBtn.innerText = "Draw Card";
        // playCard1Btn.innerText = "Play Card 1";
        // playCard2Btn.innerText = "Play Card 2";
        // endTurnBtn.innerText = "End Turn";

        // playerActionDiv.append(drawCardBtn);
        // playerActionDiv.append(playCard1Btn);
        // playerActionDiv.append(playCard2Btn);
        // playerActionDiv.append(endTurnBtn);

        // this.drawCardBtn = drawCardBtn;
        // this.playCard1Btn = playCard1Btn;
        // this.playCard2Btn = playCard2Btn;
        // this.endTurnBtn = endTurnBtn;

        // this.playerHandAndInfoContainer.append(playerActionDiv);




    }

    attachListeners() {

        const handlePlayCard = event => {
            // Card val = whatever is on the btn
            let cardVal = event.target.cardVal;
            this.client.moves.playCard(cardVal);
        };

        let moves = this.client.moves;
        this.drawCardBtn.addEventListener("click", moves.drawCard);
        this.playCard1Btn.addEventListener("click", handlePlayCard);
        this.playCard2Btn.addEventListener("click", handlePlayCard);
        // this.endTurnBtn.addEventListener("click", moves.endTurn);
    }

    stateUpdate(state) {


        // TO IMPLEMENT:
        // - Ok so basically we're in the process of refactoring all of the create/set up
        // for each of the areas
        // - Then once that's done a bit more, it'll be easier to refactor the re-render funcs
        // 



        // COMMENT THIS OUT FOR NOW - COMPLETELY REWRITE TBH!
        // let playerBoxesDoNotExist = !this.opponentsFlexContainer.getElementsByClassName("playerBox").length;
        // if (playerBoxesDoNotExist) {
        //     // It feels like I should just move this into createBoard(), no reason not to
        //     createPlayerInfo(state, this);
        // } else {
        //     rerenderPlayerInfo(state, this);
        // }

        // COMMENTING OUT THESE TWO FOR NOW TOO!
        // Probs gonna completely re-write them all shortly!
        // rerenderCardPilesInfo(state, this);

        // rerenderCardButtons(state, this);
    }

    // Log in game log section, for convenience while implementing game mechanics
    // addGameLogMsg(text) {
    //     let item = document.createElement("ul");
    //     item.textContent = text;
    // THIS.GAMELOG NO LONGER EXISTS!
    //     this.gameLog.append(item);
    // }

}


// Lotsa refactoring required here!
// Moving all of this around/lots of editing
function createPlayerInfo(state, board) {
    let playerMap = state.G.playerMap;

    let currentTurnDiv = document.createElement("div");
    board.opponentsFlexContainer.append(currentTurnDiv);
    board.currentTurnDiv = currentTurnDiv;

    currentTurnDiv.textContent = "CURRENT TURN: Player " + state.ctx.currentPlayer;

    for (const player in playerMap) {
        let div = document.createElement("div");
        let className = "player" + player + "Div";
        div.classList.add(className);
        div.classList.add("playerBox");
        board.opponentsFlexContainer.append(div);

        // This is only so I can add new lines when changing .textContent of the divs
        div.setAttribute('style', 'white-space: pre;');

    }

    rerenderPlayerInfo(state, board);
}

function rerenderPlayerInfo(state, board) {

    let playerMap = state.G.playerMap;
    board.currentTurnDiv.textContent = "CURRENT TURN: Player " + state.ctx.currentPlayer;

    for (const player in playerMap) {
        let className = "player" + player + "Div";
        let div = board.opponentsFlexContainer.getElementsByClassName(className)[0];
        div.textContent = `Player ID: ${player} \r\n`;
        div.textContent += `Favour tokens: ${playerMap[player].favourTokenCount} \r\n`;
        div.textContent += `Knocked out: ${playerMap[player].knockedOutOfRound} \r\n`;
        div.textContent += `Current hand: \r\n`;
        let hand = playerMap[player].hand;
        if (hand[0]){
            div.textContent += `🃏 ${hand[0].val}: ${hand[0].name} \r\n`;
        }
        if (hand[1]) {
            div.textContent += `🃏 ${hand[1].val}: ${hand[1].name} \r\n`;
        }


    }

    // Box for each player displaying:
    // Player ID
    // Favour token count
    // Hand (although obvs hide this)
    // Round status - active vs knocked out

    // Also state who's turn it currently is

}


function rerenderCardPilesInfo(state, board) {

    // RENDER DRAW PILE COUNT
    let drawPile = state.G.drawPile;
    board.drawPileDiv.textContent = "Draw pile cards remaining: " + drawPile.length;

    // RENDER DISCARD PILE 
    let discardPile = state.G.discardPile;
    board.discardPileDiv.textContent = "Discard pile:";
    let discardPileList = document.createElement("ul");
    discardPileList.classList.add("discardPileList");

    // Add list item for each card in discard pile
    discardPile.forEach(card => {
        let el = document.createElement("li");
        el.textContent = card.val + ": " + card.name
        discardPileList.append(el);
    });

    board.discardPileDiv.append(discardPileList);


    // RENDER PLAYED CARDS PILE
    let playedPile = state.G.playedPile;
    board.playedPileDiv.textContent = "Played pile:";
    let playedPileList = document.createElement("ul");
    playedPileList.classList.add("playedPileList");

    // Add list item for each card in played pile
    playedPile.forEach(card => {
        let el = document.createElement("li");
        el.textContent = card.val + ": " + card.name
        playedPileList.append(el);
    });

    board.playedPileDiv.append(playedPileList);




}

function rerenderCardButtons(state, board) {
    let playerID = board.client.playerID;
    let hand = state.G.playerMap[playerID].hand;

    // Rerender the btns to whatever they have in their hand
    // DW about this being a bit verbose, will be updating UI properly later, just testing mechanics with this atm
    if (hand[0]) {
        board.playCard1Btn.classList.remove("hidden");
        board.playCard1Btn.innerText = "Play - " + `${hand[0].val}: ${hand[0].name}`;
        board.playCard1Btn.cardVal = hand[0].val;

    } else {
        board.playCard2Btn.classList.add("hidden");
        board.playCard2Btn.cardVal = null;
    }


    if (hand[1]) {
        board.playCard2Btn.classList.remove("hidden");
        board.playCard2Btn.innerText = "Play - " + `${hand[1].val}: ${hand[1].name}`;
        board.playCard2Btn.cardVal = hand[1].val;

    } else {
        board.playCard2Btn.classList.add("hidden");
        board.playCard2Btn.cardVal = null;
    }
}


export default Board;
