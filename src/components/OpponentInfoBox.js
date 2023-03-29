

class OpponentInfoBox {
    constructor(opponentPlayerID, opponentPlayerMap,parentEl) {
        this.parent = parentEl;
        this.opponentPlayerID = opponentPlayerID;
        this.opponentPlayerMap = opponentPlayerMap

        this.create();
    }

    create(){
        let status = this.opponentPlayerMap.knockedOutOfRound ? "Knocked out" : "Active";

        const opponentBoxTemplate = document.createElement('div');
        opponentBoxTemplate.innerHTML = `<div class="opponentInfoBox opponent_id_${this.opponentPlayerID}">
                                            <div class="opponentNameDiv">
                                                Player ID: ${this.opponentPlayerID}
                                            </div>
                                            <div class="opponentTokens">
                                                Favor tokens: ${this.opponentPlayerMap.favourTokenCount}
                                            </div>
                                            <div class="opponentKnockedOutStatus">
                                                Round status: ${status}
                                            </div>
                                            <div class="opponentHand">
                                            </div>
                                            <div class="opponentHandmaidStatus">
                                            </div>
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

    update(){
        // update inner html 
        
        // this.favourTokenEl.innerHTML = `Favor tokens: ${something we pass in when we update}`;
        // this.knockedOutStatusEl.innerHTML = ``;
        // this.handEl.innerHTML = ``;
        // this.handmaidStatusEl.innerHTML = ``;

    }


}

export default OpponentInfoBox;
