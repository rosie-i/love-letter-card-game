import { Client } from 'boardgame.io/client';
import { LoveLetter } from './Game';
import Board from './components/Board';

class LoveLetterClient {
    constructor(rootEl) {
        this.client = Client({ game: LoveLetter });
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
const app = new LoveLetterClient(appElement);