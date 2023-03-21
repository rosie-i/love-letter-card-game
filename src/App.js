import { Client } from 'boardgame.io/client';
import { LoveLetter } from './Game';
import Board from './components/Board';
import { SocketIO } from 'boardgame.io/multiplayer'

class LoveLetterClient {
    constructor(rootEl, { playerID }) {
        this.client = Client({ 
            game: LoveLetter,
            numPlayers: 3,
            multiplayer: SocketIO({ server: 'localhost:8000' }),
            playerID: playerID
        });
        this.client.start();

        this.rootEl = rootEl;
        this.gameLog = document.getElementById('game-log');
        
        this.log("Welcome to Love Letter");

        this.createBoard();

        this.client.subscribe(state => this.update(state));

    }

    // Creates the UI
    createBoard(){
        this.log("Creating board");

        let board = new Board(this.client);
        this.board = board;
    }


    update(state){

        // When using a remote master, the client won’t know the game state when it first runs, 
        // so update will be called first with null, then with the full game state after it connects to the server.
        if (state === null){
            this.log("Connecting to server...");
            return;
        }

        // Update UI
        this.board.stateUpdate(state);
        if (state.ctx.gameover) {
            this.log("GAME OVER!!!");
        }
      
    }

    // Log in game log section, for convenience while implementing game mechanics
    log(text) {
        let item = document.createElement("ul");
        item.textContent = text;
        this.gameLog.append(item);
    }

}


const appElement = document.getElementById('app');
const playerIDs = ['0', '1', '2'];
const clients = playerIDs.map(playerID => {
    const rootElement = document.createElement('div');
    appElement.append(rootElement);
    return new LoveLetterClient(rootElement, { playerID });
});