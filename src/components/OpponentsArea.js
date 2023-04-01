import OpponentInfoBox from "./OpponentInfoBox";

class OpponentsArea {
    constructor(parent, G) {
        this.parent = parent;
        this.opponentInfoBoxes = [];

        this.create(G);
    }

    create(G) {

        // TO IMPLEMENT/TO IMPROVE:
        // I think having opponentsFlexContainer + opponentInfoContainer is potentially slightly confusing/superfluous
        // At the very least rename them - opponentInfoContainer is the outer grid item
        // opponentsFlexContainer is the inner container set to display:flex
        let opponentsFlexContainer = document.createElement("div");
        opponentsFlexContainer.classList.add("opponentsFlexContainer");

        this.parent.opponentsFlexContainer = opponentsFlexContainer;
        this.parent.opponentInfoContainer.append(opponentsFlexContainer);

        // EXTRA TO IMPLEMENT - Ideally we want them rendered in turn order - so whoever is after you is first, then continue from there
        for (const playerID in G.playerMap) {
            // Do not render the client's info in this board section
            if (playerID === this.parent.client.playerID) {
                continue;
            }

            let newOpponentBox = new OpponentInfoBox(playerID, G.playerMap[playerID], this.parent.opponentsFlexContainer);
            this.opponentInfoBoxes.push(newOpponentBox);
        }
    }

    update(state){

        // Update active player highlight if changed:
        if (this.activePlayerID !== state.ctx.currentPlayer) {
            this.activePlayerID = state.ctx.currentPlayer;
            highlightActivePlayer(this.activePlayerID, this.opponentInfoBoxes);
        }

        // Update each player info box
        for (const opponent of this.opponentInfoBoxes){
            let opponentID = opponent.opponentPlayerID;
            opponent.update(state.G.playerMap[opponentID]);
        }
        

    }

}

function highlightActivePlayer(activePlayerID, opponentsArray){
    // Iterate over opponents array
    for (const opponent of opponentsArray){
        if (activePlayerID === opponent.opponentPlayerID){
            opponent.opponentBoxDiv.firstChild.classList.add("playerActiveHighlight");
        } else {
            // remove highlight class
            opponent.opponentBoxDiv.firstChild.classList.remove("playerActiveHighlight");
        }
    }
}

export default OpponentsArea;
