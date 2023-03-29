
class PlayerHandInfoArea {
    constructor(parent, G) {
        this.parent = parent;

        this.create();
    }

    create() {


        // TO IMPLEMENT - Hard coded vals atm, dynamically render for each client
        // Need this.parent.client.playerID for playermap

        let playerHandInfoGridContainer = document.createElement("div");
        playerHandInfoGridContainer.classList.add("playerHandInfoGridContainer");
        playerHandInfoGridContainer.innerHTML = `<div class="playerHandInfoGameRoundStats">
                                                Rosie
                                                Tokens: 5
                                                Round status: Active
                                                Handmaid: Protected!
                                            </div>
                                            <div class="playerHandInfoHeader"> Your Hand </div>
                                            <div class="playerHandInfoCardLeft CARD-ANIMATION-TESTINGGG "></div>
                                            <div class="playerHandInfoCardRight CARD-ANIMATION-TESTINGGG "></div>`
        this.parent.playerHandAndInfoContainer.append(playerHandInfoGridContainer);


        addListenersAndAnimations();
    }

}


// NOTHING SOLID HERE ATM, JUST TESTING
function addListenersAndAnimations() {


    // This is also animation testing stuff for keyframe move up to played
    const cardToMove = document.querySelector('.playerHandInfoCardLeft');
    cardToMove.addEventListener('click', () => {
        cardToMove.classList.add('moveUpToPlayedPile');
    });

    const source = document.querySelector('.playerHandInfoCardLeft');
    const source2 = document.querySelector('.playerHandInfoCardRight');

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
