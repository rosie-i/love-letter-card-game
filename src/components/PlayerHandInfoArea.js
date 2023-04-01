import Card from "./Card";

class PlayerHandInfoArea {
    constructor(parent, playerInfo) {
        this.parent = parent;

        this.create();
        this.update(playerInfo);
        this.attachListeners();
    }

    create() {

        let playerHandInfoGridContainer = document.createElement("div");
        playerHandInfoGridContainer.classList.add("playerHandInfoGridContainer");
        playerHandInfoGridContainer.innerHTML = `<div class="playerHandInfoGameRoundStats">
                                                    <div class="playerHandInner">
                                                        <div class="playerHandInfo-PlayerName">You</div>
                                                        <div class="playerHandInfo-Tokens"></div>
                                                        <div class="playerHandInfo-RoundStatus"></div>
                                                        <div class="playerHandInfo-Handmaid"></div>
                                                    </div>
                                                </div>
                                                <div class="playerHandInfoHeader"> Your Hand </div>
                                                <div id="playerHandInfo-CardLeftContainer" class="playerHandEmptyCardSlot"></div>
                                                <div id="playerHandInfo-CardRightContainer" class="playerHandEmptyCardSlot"></div>
                                                <div class="targetWhichPlayerModal hidden">
                                                    <div class="targetModalText"></div>
                                                    <div class="targetModalBtnsContainer"></div>
                                                </div>`
        this.parent.playerHandAndInfoContainer.append(playerHandInfoGridContainer);
        this.playerTokens = playerHandInfoGridContainer.getElementsByClassName("playerHandInfo-Tokens")[0];
        this.roundStatus = playerHandInfoGridContainer.getElementsByClassName("playerHandInfo-RoundStatus")[0];
        this.handmaid = playerHandInfoGridContainer.getElementsByClassName("playerHandInfo-Handmaid")[0];
        this.cardLeftContainer = document.getElementById("playerHandInfo-CardLeftContainer");
        this.cardRightContainer = document.getElementById("playerHandInfo-CardRightContainer");
        this.targetWhichPlayerModal = playerHandInfoGridContainer.getElementsByClassName("targetWhichPlayerModal")[0];
        this.leftCard = new Card(this.cardLeftContainer, "empty-pile");
        this.rightCard = new Card(this.cardRightContainer, "empty-pile");
        this.playerHandInner = playerHandInfoGridContainer.getElementsByClassName("playerHandInner")[0];


    }

    update(playerInfo, isActivePlayer) {

        updateActivePlayerHighlight(isActivePlayer, this.playerHandInner);
        
        this.playerTokens.textContent = `Favor tokens: ${playerInfo.favourTokenCount}`;

        this.roundStatus.textContent = playerInfo.knockedOutOfRound ? "Round status: Knocked out" : "Round status: Active";;
        this.handmaid.textContent = playerInfo.handmaid ? "Handmaid: Protected!" : "Handmaid: Not protected";

        if (playerInfo.hand[0]) {
            this.leftCard.updateCardVal(playerInfo.hand[0].val);
        } else {
            this.leftCard.updateCardVal("empty-pile");
        }

        if (playerInfo.hand[1]) {
            this.rightCard.updateCardVal(playerInfo.hand[1].val);

        } else {
            this.rightCard.updateCardVal("empty-pile");
        }
    }

    attachListeners() {

        const handleCardClick = (e) => {
            let modal =  this.targetWhichPlayerModal;

            // If not that player's turn, do nothing
            if (this.parent.currentTurnPlayerID !== this.parent.playerID) {
                return;
            };

            const cardVal = parseInt(e.currentTarget.firstChild.dataset.cardVal);

            // Ask player who to target, then we can call playCard!
            modal.classList.remove("hidden");

            // Change text
            modal.getElementsByClassName("targetModalText")[0].innerText = `You have chosen to play ${e.currentTarget.firstChild.dataset.cardName}. 
            Which player will you target?`;

            // Generate btns
            let btnDiv = modal.getElementsByClassName("targetModalBtnsContainer")[0];
            btnDiv.innerText = "";

            let moves = this.parent.client.moves;
            
            for (const playerID in this.parent.playerMap){
                const button = document.createElement('button');
                button.textContent = playerID;
                button.addEventListener('click', function (e) {
                    moves.playCard(cardVal, playerID);
                    modal.classList.add("hidden");
                });
                btnDiv.appendChild(button);
            }

            

            // this.parent.client.moves.playCard(cardVal, targetedPlayerID);
        };

        this.cardLeftContainer.addEventListener("click", handleCardClick);
        this.cardRightContainer.addEventListener("click", handleCardClick);
    }

}


function updateActivePlayerHighlight(isActivePlayer, div){

    if (isActivePlayer){
        div.classList.add("playerActiveHighlight");
    } else {
        div.classList.remove("playerActiveHighlight");
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
