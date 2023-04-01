const CARD_INFO = {

    // Card Names
    cardNames: {
        1: "Guard",
        2: "Priest",
        3: "Baron",
        4: "Handmaid",
        5: "Prince",
        6: "King",
        7: "Countess",
        8: "Princess"
    },

    // Card quantities to create deck
    cardQuantity: {
        1: 5,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 1,
        7: 1,
        8: 1
    },

    canTargetPlayedCardAtSelf: {
        1: false,
        2: false,
        3: false,
        4: true,
        5: true,
        6: false,
        7: false,
        8: false
    },

    canTargetPlayedCardAtOtherPlayers: {
        1: true,
        2: true,
        3: true,
        4: false,
        5: true,
        6: true,
        7: false,
        8: false
    },

    // Might want to change later if implementing V2 of Love Letter with Spy + Chancellor cards
    highestCardValue: 8
}

export { CARD_INFO };