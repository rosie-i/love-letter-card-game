import { Client } from 'boardgame.io/client';
import { LoveLetter } from './Game';
import Board from './components/Board';
import { SocketIO } from 'boardgame.io/multiplayer';


class LoveLetterClient {
    constructor(appElement, data) {
        this.client = Client({
            game: LoveLetter,
            numPlayers: 3,
            multiplayer: SocketIO({ server: 'localhost:8000' }),
            matchID: data.matchID,
            playerID: data.playerID
        });

        this.connected = false;
        this.client.start();
        this.appElement = appElement;
        this.gameLobbyElement = document.getElementById("gameLobby");
        this.connectingScreenElement = document.getElementById("connectingScreen");
        this.gameplayViewElement = document.getElementById("gameplayView");

        this.layouts = {
            lobby: this.gameLobbyElement,
            connecting: this.connectingScreenElement,
            gameplay: this.gameplayViewElement
        };

        this.client.subscribe(state => this.update(state));

    }

    onConnecting() {
        this.connected = false;
        this.showLayout("connecting");
    }

    onConnected({G, ctx}) {
        this.connected = true;


        // Create board
        this.createBoard({G, ctx});

        // Then show the gameplay view
        this.showLayout("gameplay");

    }


    // ACCEPTS lobby, connecting, gameplay
    showLayout(layoutName){

        let newLayoutShown = false;
        
        for (const layout in this.layouts){
            if (layoutName === layout){
                this.layouts[layout].classList.remove("hidden");
                newLayoutShown = true;
            } else {
                this.layouts[layout].classList.add("hidden");
            }
        }

        if (!newLayoutShown){
            throw new Error ("Hey roro, you didn't put a correct layout name in probs!");
        }

    }




    // Creates the UI
    createBoard({G, ctx}) {
        let board = new Board({G, ctx}, this.client);
        this.board = board;
    }


    update(state) {

        // When using a remote master, the client won’t know the game state when it first runs, 
        // so update will be called first with null, then with the full game state after it connects to the server.
        if (state === null) {
            this.onConnecting();
            return;
        } else if (!this.connected) {
            this.onConnected({G: state.G, ctx: state.ctx});
        }

        // Update UI
        this.board.stateUpdate(state);

        if (state.ctx.gameover) {
            this.board.addGameLogMsg("GAME OVER!!!");
        }

    }

}


class App {
    constructor(appElement) {

        // Game Lobby listeners will then create new client when someone joins game
        this.attachGameLobbyListeners();
        this.appElement = appElement;


        // FOR DEVELOPING: Automatically enter game
        document.getElementById("player-id-input-existing-game").value = 0;

          

    }

    attachGameLobbyListeners() {

        // NEW GAME - TO BE IMPLEMENTED
        // We will want to get the game id + num of players
        let newGameForm = document.getElementById("createNewGameForm");
        newGameForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Sorry, I don't work yet, try using default game ID and joining existing game");
        });



        // JOIN EXISTING GAME
        let joinGameForm = document.getElementById("joinExistingGameForm");
        joinGameForm.addEventListener("submit", (e) => {
            e.preventDefault();

            let gameToJoinID = document.getElementById("existing-game-id-input").value;
            let userID = document.getElementById("player-id-input-existing-game").value;

            let data = {
                matchID: gameToJoinID,
                playerID: userID
            };

            this.client = new LoveLetterClient(this.appElement, data);
        });

    }
}

const appElement = document.getElementById('app');
new App(appElement);
