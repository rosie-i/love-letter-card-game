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
        this.playArea.append(playersDiv);

        let drawPileDiv = document.createElement("div");
        drawPileDiv.classList.add("drawPile");
        drawPileDiv.textContent = "This is where info about drawPile will go";
        this.playArea.append(drawPileDiv);

        let discardPileDiv = document.createElement("div");
        discardPileDiv.classList.add("discardPile");
        discardPileDiv.textContent = "This is where info about discardPile will go";
        this.playArea.append(discardPileDiv);

        let playerActionDiv = document.createElement("div");
        playerActionDiv.classList.add("playerActionDiv");
        playerActionDiv.textContent = "This is where player action options go:";

        let drawCardBtn = document.createElement("button");
        let playCardBtn = document.createElement("button");
        let endTurnBtn = document.createElement("button");

        drawCardBtn.classList.add("drawCardBtn");
        playCardBtn.classList.add("playCardBtn");
        endTurnBtn.classList.add("endTurnBtn");

        drawCardBtn.innerText = "Draw Card";
        playCardBtn.innerText = "Play Card";
        endTurnBtn.innerText = "End Turn";

        playerActionDiv.append(drawCardBtn);
        playerActionDiv.append(playCardBtn);
        playerActionDiv.append(endTurnBtn);

        this.drawCardBtn = drawCardBtn;
        this.playCardBtn = playCardBtn;
        this.endTurnBtn = endTurnBtn;
        

        this.playArea.append(playerActionDiv);

    }


    attachListeners(){
        let moves = this.client.moves;
        this.drawCardBtn.addEventListener("click", moves.drawCard);
        this.playCardBtn.addEventListener("click", moves.playCard);
        // this.endTurnBtn.addEventListener("click", moves.endTurn);
    }

}



export default Board;
