import { CARD_INFO } from "../CardInfo";


class Board {
    constructor(client){

        this.client = client;
        this.playArea = document.getElementById('play-area');
        this.createBoard();
        this.attachListeners();

    }

    createBoard(){
        // Create a text box showing info about each of the players' hands, points, etc
        // And discard pile and deck
        let playersDiv = document.createElement("div");
        playersDiv.classList.add("players");
        playersDiv.textContent = "This is where info about players will go";
        this.playersDiv = playersDiv;
        this.playArea.append(playersDiv);

        let drawPileDiv = document.createElement("div");
        this.drawPileDiv = drawPileDiv;
        drawPileDiv.classList.add("drawPile");
        drawPileDiv.textContent = "Draw pile loading";
        this.playArea.append(drawPileDiv);

        let discardPileDiv = document.createElement("div");
        this.discardPileDiv = discardPileDiv;
        discardPileDiv.classList.add("discardPile");
        discardPileDiv.textContent = "Discard pile loading";
        this.playArea.append(discardPileDiv);

        let playedPileDiv = document.createElement("div");
        this.playedPileDiv = playedPileDiv;
        playedPileDiv.classList.add("playedPile");
        playedPileDiv.textContent = "Played pile loading";
        this.playArea.append(playedPileDiv);

        let playerActionDiv = document.createElement("div");
        playerActionDiv.classList.add("playerActionDiv");
        playerActionDiv.textContent = "Player actions:";

        let drawCardBtn = document.createElement("button");
        let playCard1Btn = document.createElement("button");
        let playCard2Btn = document.createElement("button");
        let endTurnBtn = document.createElement("button");
        
        drawCardBtn.classList.add("drawCardBtn");
        playCard1Btn.classList.add("playCard1Btn");
        playCard2Btn.classList.add("playCard2Btn");
        endTurnBtn.classList.add("endTurnBtn");

        drawCardBtn.innerText = "Draw Card";
        playCard1Btn.innerText = "Play Card 1";
        playCard2Btn.innerText = "Play Card 2";
        endTurnBtn.innerText = "End Turn";

        playerActionDiv.append(drawCardBtn);
        playerActionDiv.append(playCard1Btn);
        playerActionDiv.append(playCard2Btn);
        playerActionDiv.append(endTurnBtn);

        this.drawCardBtn = drawCardBtn;
        this.playCard1Btn = playCard1Btn;
        this.playCard2Btn = playCard2Btn;
        this.endTurnBtn = endTurnBtn;
        

        this.playArea.append(playerActionDiv);

    }


    attachListeners(){

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

    stateUpdate(state){
        let playerBoxesDoNotExist = !this.playersDiv.getElementsByClassName("playerBox").length;
        if(playerBoxesDoNotExist){
            createPlayerInfo(state,this);
        } else {
            rerenderPlayerInfo(state, this);
        }

        rerenderCardPilesInfo(state, this);

        rerenderCardButtons(state, this);
    }

}

function createPlayerInfo(state,board){
    let playerMap = state.G.playerMap;

    let currentTurnDiv = document.createElement("div");
    board.playersDiv.append(currentTurnDiv);
    board.currentTurnDiv = currentTurnDiv;

    currentTurnDiv.textContent = "CURRENT TURN: Player " + state.ctx.currentPlayer;

    for (const player in playerMap){
        let div = document.createElement("div");
        let className = "player" + player + "Div";
        div.classList.add(className);
        div.classList.add("playerBox");
        board.playersDiv.append(div);

        // This is only so I can add new lines when changing .textContent of the divs
        div.setAttribute('style', 'white-space: pre;');

    }

    rerenderPlayerInfo(state, board);
}

function rerenderPlayerInfo(state, board){

    let playerMap = state.G.playerMap;
    board.currentTurnDiv.textContent = "CURRENT TURN: Player " + state.ctx.currentPlayer;

    for (const player in playerMap){
        let className = "player" + player + "Div";
        let div = board.playersDiv.getElementsByClassName(className)[0];
        div.textContent = `Player ID: ${player} \r\n`;
        div.textContent += `Favour tokens: ${playerMap[player].favourTokenCount} \r\n`;
        div.textContent += `Knocked out: ${playerMap[player].knockedOutOfRound} \r\n`;
        div.textContent += `Current hand: \r\n`;
        let hand = playerMap[player].hand;
        div.textContent += `🃏 ${hand[0].val}: ${hand[0].name} \r\n`;
        if (hand[1]){
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


function rerenderCardPilesInfo(state, board){

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

function rerenderCardButtons (state, board){
    let playerID = board.client.playerID;
    let hand = state.G.playerMap[playerID].hand;

    // Rerender the btns to whatever they have in their hand
    board.playCard1Btn.innerText = "Play - " + `${hand[0].val}: ${hand[0].name}`;
    board.playCard1Btn.cardVal = hand[0].val;
    if (hand[1]){
        board.playCard2Btn.classList.remove("hide");
        board.playCard2Btn.innerText = "Play - " + `${hand[1].val}: ${hand[1].name}`;
        board.playCard2Btn.cardVal = hand[1].val;

    } else {
        board.playCard2Btn.classList.add("hide");
        board.playCard2Btn.cardVal = null;
    }
}


export default Board;
