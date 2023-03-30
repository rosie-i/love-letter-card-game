import Card from "./Card";

class PlayerHandInfoArea {
    constructor(parent, playerInfo) {
        this.parent = parent;

        this.create(playerInfo);
    }

    create(playerInfo) {


        // TO IMPLEMENT - Hard coded vals atm, dynamically render for each client
        // Need this.parent.client.playerID for playermap
        let status = playerInfo.knockedOutOfRound ? "Knocked out" : "Active";

        let playerHandInfoGridContainer = document.createElement("div");
        playerHandInfoGridContainer.classList.add("playerHandInfoGridContainer");
        playerHandInfoGridContainer.innerHTML = `<div class="playerHandInfoGameRoundStats">
                                                    <div class="playerHandInfo-PlayerName">You</div>
                                                    <div class="playerHandInfo-Tokens"></div>
                                                    <div class="playerHandInfo-RoundStatus"></div>
                                                    <div class="playerHandInfo-Handmaid"></div>
                                                </div>
                                                <div class="playerHandInfoHeader"> Your Hand </div>
                                                <div id="playerHandInfo-CardLeftContainer" class="playerHandEmptyCardSlot"></div>
                                                <div id="playerHandInfo-CardRightContainer" class="playerHandEmptyCardSlot"></div>`
        this.parent.playerHandAndInfoContainer.append(playerHandInfoGridContainer);
        this.playerTokens = playerHandInfoGridContainer.getElementsByClassName("playerHandInfo-Tokens")[0];
        this.roundStatus = playerHandInfoGridContainer.getElementsByClassName("playerHandInfo-RoundStatus")[0];
        this.handmaid = playerHandInfoGridContainer.getElementsByClassName("playerHandInfo-Handmaid")[0];
        this.cardLeftContainer = document.getElementById("playerHandInfo-CardLeftContainer");
        this.cardRightContainer = document.getElementById("playerHandInfo-CardRightContainer");

        this.leftCard = new Card(this.cardLeftContainer, "empty-pile");
        this.rightCard = new Card(this.cardRightContainer, "empty-pile");

        this.update(playerInfo);

        // addListenersAndAnimations();
    }

    update(playerInfo){
        this.playerTokens.textContent = `Favor tokens: ${playerInfo.favourTokenCount}`;

        this.roundStatus.textContent = playerInfo.knockedOutOfRound ? "Round status: Knocked out" : "Round status: Active";;
        this.handmaid.textContent = playerInfo.handmaid ? "Handmaid: Protected!": "";

        if (playerInfo.hand[0]){
            this.leftCard.updateCardVal(playerInfo.hand[0].val);
        } else {
            this.leftCard.updateCardVal("empty-pile");
        }

        if (playerInfo.hand[1]){
            this.rightCard.updateCardVal(playerInfo.hand[1].val);

        } else {
            this.rightCard.updateCardVal("empty-pile");
        }        
    }

}


// NOTHING SOLID HERE ATM, JUST TESTING
function addListenersAndAnimations() {


    // This is also animation testing stuff for keyframe move up to played
    const cardToMove = document.querySelector('#playerHandInfo-CardLeftContainer');
    cardToMove.addEventListener('click', () => {
        cardToMove.classList.add('moveUpToPlayedPile');
    });

    const source = document.querySelector('#playerHandInfo-CardLeftContainer');
    const source2 = document.querySelector('#playerHandInfo-CardRightContainer');

    const target = document.querySelector('.cardPilePlayed');

    // OK THIS ACTUALLY BASICALLY WORKS! Wowww.
    // Little buggy though, idk if this is even best way to do it
    // Just cool to see it moving smoothly though!!
    source.addEventListener('click', () => {
        const targRect = target.getBoundingClientRect();
        const sourceRect = source.getBoundingClientRect();

        let horiz = targRect.left - sourceRect.left;
        let vert = targRect.top - sourceRect.top;

        source.style.transform = `translate(${horiz}px, ${vert}px)`;
    });
    source2.addEventListener('click', () => {
        const targRect = target.getBoundingClientRect();
        const sourceRect = source2.getBoundingClientRect();

        let horiz = targRect.left - sourceRect.left;
        let vert = targRect.top - sourceRect.top;

        source2.style.transform = `translate(${horiz}px, ${vert}px)`;
    });

}

export default PlayerHandInfoArea;
