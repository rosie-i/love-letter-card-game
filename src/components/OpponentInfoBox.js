

class OpponentInfoBox {
    constructor(opponentPlayerID, opponentPlayerMap, parentEl) {
        this.parent = parentEl;
        this.opponentPlayerID = opponentPlayerID;

        this.create();
        this.update(opponentPlayerMap);
    }

    create(){

        const opponentBoxTemplate = document.createElement('div');
        opponentBoxTemplate.innerHTML = `<div class="opponentInfoBox opponent_id_${this.opponentPlayerID}">
                                            <div class="opponentNameDiv">
                                                Player ID: ${this.opponentPlayerID}
                                            </div>
                                            <div class="opponentTokens"></div>
                                            <div class="opponentKnockedOutStatus"></div>
                                            <div class="opponentHand"></div>
                                            <div class="opponentHandmaidStatus"></div>
                                        </div>`;
        this.parent.append(opponentBoxTemplate);
        this.opponentBoxDiv = opponentBoxTemplate;
        this.opponentBoxDiv.classList.add("opponentBoxFlexItem");


        // // Save the ones we'll need to update
        this.favourTokenEl = this.opponentBoxDiv.getElementsByClassName("opponentTokens")[0];
        this.knockedOutStatusEl = this.opponentBoxDiv.getElementsByClassName("opponentKnockedOutStatus")[0];
        this.handEl = this.opponentBoxDiv.getElementsByClassName("opponentHand")[0];
        this.handmaidStatusEl = this.opponentBoxDiv.getElementsByClassName("opponentHandmaidStatus")[0];
    }

    update(opponentPlayerMap){
        
        this.favourTokenEl.textContent = `Favor tokens: ${opponentPlayerMap.favourTokenCount}`;
        
        this.knockedOutStatusEl.textContent = opponentPlayerMap.knockedOutOfRound ? "Round status: Knocked out" : "Round status: Active";

        this.handEl.textContent = `# of cards in hand: ${opponentPlayerMap.hand.length}`;

        this.handmaidStatusEl.textContent = opponentPlayerMap.handmaid ? "Handmaid: Protected!" : "Handmaid: Not protected";

    }


}

export default OpponentInfoBox;
