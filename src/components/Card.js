import { CARD_INFO } from "../CardInfo";


class Card {
    constructor(val) {
        this.val = val;
        this.name = CARD_INFO.cardNames[val];
        // this.imgSrc = CARD_INFO.cardImg[val];
    }

}

export default Card;
