
class CardPileArea {
    constructor(parent, G) {
        this.parent = parent;

        this.create(G);
    }

    create(G) {

        let cardPilesGridContainer = document.createElement("div");
        cardPilesGridContainer.classList.add("cardPileGridContainer");
        cardPilesGridContainer.innerHTML = `<div class="cardPileDeckCount"> Deck count: ${G.drawPile.length} </div>
                                        <div class="cardPileDeck"></div>
                                        <div class="cardPilePlayed"></div>
                                        <div class="cardPilePlayedCount"> Played cards count: ${G.playedPile.length} </div>
                                        <div class="cardPileDiscard"></div>`
        this.parent.cardPilesAreaContainer.append(cardPilesGridContainer);

        // Save divs that will need updating
        this.deckCount = cardPilesGridContainer.getElementsByClassName("cardPileDeckCount")[0];
        this.playedCount = cardPilesGridContainer.getElementsByClassName("cardPilePlayedCount")[0];

    }


}

export default CardPileArea;
