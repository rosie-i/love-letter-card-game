import { CARD_INFO } from "../CardInfo";
// Need to import images bc Parcel can't get the right dist url otherwise
import images from '../imgs/*.webp';


class Card {
    constructor(parent, val) {
        this.parent = parent;
        this.images = images;
        this.create();
        this.updateCardVal(val);
    }

    create(){
        const card = document.createElement('img');
        card.classList.add("cardClassImg");
        this.parent.append(card);
        this.cardEl = card;
    }

    updateCardVal(newVal){
        this.val = newVal;
        this.cardEl.dataset.cardVal = newVal;
        
        
        this.name = CARD_INFO.cardNames[newVal] || newVal;
        this.cardEl.dataset.cardName = this.name;

        // this.cardEl.src = this.images[newVal];
        this.cardEl.src = this.images[newVal];


    }

}


// function getImgSrc(val) {

//     let imgSrc;

//     switch (val) {
//         case 1:
//             imgSrc = "src/imgs/1-guard.webp";
//             break;

//         case 2:
//             imgSrc = "src/imgs/2-priest.webp";

//             break;

//         case 3:
//             imgSrc = "src/imgs/3-baron.webp";

//             break;

//         case 4:
//             imgSrc = "src/imgs/4-handmaid.webp";

//             break;

//         case 5:
//             imgSrc = "src/imgs/5-prince.webp";

//             break;

//         case 6:
//             imgSrc = "src/imgs/6-king.webp";

//             break;

//         case 7:
//             imgSrc = "src/imgs/7-countess.webp";

//             break;

//         case 8:
//             imgSrc = "src/imgs/8-princess.webp";

//             break;

//         case "card-back":
//             imgSrc = "src/imgs/card-back.webp";

//             break;

//         case "empty-pile":
//             imgSrc = "src/imgs/empty-pile.webp";

//             break;

//         default:
//             imgSrc = "src/imgs/empty-pile.webp";

//             break;
//     }

//     return imgSrc;
// }

export default Card;
