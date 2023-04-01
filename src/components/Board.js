import { CARD_INFO } from "../CardInfo";
import OpponentsArea from "./OpponentsArea";
import CardPileArea from "./CardPileArea";
import PlayerHandInfoArea from "./PlayerHandInfoArea";
import GameLogInfoArea from "./GameLogArea";
import ChatArea from "./ChatArea";

class Board {
    constructor({G, ctx}, client) {

        this.client = client;
        this.playerID = client.playerID;

        this.container = document.getElementById('gameplayView');
        this.opponentInfoContainer = this.container.getElementsByClassName("gameplay-opponentInfoContainer")[0];
        this.cardPilesAreaContainer = this.container.getElementsByClassName("gameplay-cardPilesAreaContainer")[0];
        this.playerHandAndInfoContainer = this.container.getElementsByClassName("gameplay-playerHandAndInfoContainer")[0];
        this.gameLogContainer = this.container.getElementsByClassName("gameplay-gameLogContainer")[0];
        this.chatContainer = this.container.getElementsByClassName("gameplay-chatContainer")[0];

        this.createBoard({G, ctx});

        // HAVE COMMENTED OUT ATTACH LISTENERS FOR THE MO BECAUSE THEY ARE FOR OLD ACTION BUTTONS!
        // this.attachListeners();

    }

    createBoard({G, ctx}) {

        // ---- DONE:
        this.opponentsArea = new OpponentsArea(this, G);
        this.cardPileArea = new CardPileArea(this, G);
        this.playerHandInfoArea = new PlayerHandInfoArea(this, G.playerMap[this.client.playerID]);
        this.gameLogArea = new GameLogInfoArea(this, G);
        
        // ---- IN PROGRESS:
        // TO IMPLEMENT: Chat function doesn't render cross-client yet
        this.chatArea = new ChatArea(this, G);

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
    }

    stateUpdate(state) {

        this.currentTurnPlayerID = state.ctx.currentPlayer;
        this.playerMap = state.G.playerMap;

        let playerInfo = state.G.playerMap[this.playerID];
        let isActivePlayer = (this.currentTurnPlayerID === this.playerID);
        this.playerHandInfoArea.update(playerInfo, isActivePlayer);

        // update opponent area
        this.opponentsArea.update(state);

        // update card pile area
        this.cardPileArea.update(state.G);

        // Game log update
        this.gameLogArea.update(state.G.gameLog);


    }

}


export default Board;
