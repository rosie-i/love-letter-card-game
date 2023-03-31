import Card from "./Card";

class CardPileArea {
    constructor(parent, G) {
        this.parent = parent;

        this.create();
        this.update(G);
    }

    create() {

        let cardPilesGridContainer = document.createElement("div");
        cardPilesGridContainer.classList.add("cardPileGridContainer");
        cardPilesGridContainer.innerHTML = `<div class="cardPileDeckCount"></div>
                                        <div class="cardPileDeck"></div>
                                        <div class="cardPilePlayed"></div>
                                        <div class="cardPilePlayedCount"></div>
                                        <div class="cardPileDiscard"></div>`
        this.parent.cardPilesAreaContainer.append(cardPilesGridContainer);

        // Save divs that will need updating
        this.deckCount = cardPilesGridContainer.getElementsByClassName("cardPileDeckCount")[0];
        this.playedCount = cardPilesGridContainer.getElementsByClassName("cardPilePlayedCount")[0];
        this.lastPlayedCard = new Card(cardPilesGridContainer.getElementsByClassName("cardPilePlayed")[0], "empty-pile");
        this.lastDiscardedCard = new Card(cardPilesGridContainer.getElementsByClassName("cardPileDiscard")[0], "empty-pile");

    }

    update(G){
        this.deckCount.textContent = `Deck count: ${G.drawPile.length}`;
        this.playedCount.textContent = `Played cards count: ${G.playedPile.length}`;
        if (G.playedPile.length > 0){
            
            // Update card pile played with most recently played card
            this.lastPlayedCard.updateCardVal(G.playedPile[G.playedPile.length-1].val);
        }

        // Update discard with most recently discarded card (unless there's only one, in which case it's the burned one)
        if (G.discardPile.length > 1){
            
            // Update card pile played with most recently played card
            this.lastDiscardedCard.updateCardVal(G.discardPile[G.discardPile.length-1].val);
        }
    }


}

export default CardPileArea;
