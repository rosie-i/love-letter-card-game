
class GameLogInfoArea {
    constructor(parent, G) {
        this.parent = parent;
        this.container = document.getElementsByClassName("gameplay-gameLogContainer")[0];
        this.update(G.gameLog);
    }

    update(gameLog){

        // You only want to render ones you have yet to add I guess?
        // Check ID of last child of container

        let newLogStartIndex = 0;
        if (this.container.lastChild){
            newLogStartIndex = Number(this.container.lastChild.id.split('-')[1]) + 1;
        }

        // Render from that index onwards
        // Is this right? I'm slightly unsure, need to check
        // ROSIEEEE, START HERE TOMOZ!!
        // The game log is working surprisingly well in some ways
        // excepttt, i think the way i'm rendering it here is not working yknow
        // need to get the id/index of the last added child
        // then we check length of the game log
        // and if it's got additional ones to add, we should add those
        // and if not we dont need to updateeeee.
        // so am i


        for (let i = newLogStartIndex; i < gameLog.length; i++){
            this.addLog(gameLog[i], i);
        }

        
        
        

    }

    addLog(logObj, logID){
        const logEntry = document.createElement('div');
        logEntry.innerHTML = createLog(logObj);
        logEntry.id = "logMsgID-" + logID;
        this.container.appendChild(logEntry);
        // scroll to the bottom of the gamelog
        this.container.scrollTop = this.container.scrollHeight;
    }

}


// NOTE: OBVIOUSLY LATER WHEN NOT DEVELOPING YOU WILL WANT TO HIDE WHAT CARD WAS DRAWN
// BY OPPOSITION PLAYERS!! 
function createLog(logObj){

    if (logObj.action === "drew"){
        return `<span class="logMsgHighlightPlayerID-${logObj.playerID}">Player ${logObj.playerID}</span> drew card: ${logObj.cardVal}`;
    }
    
    else if (logObj.action === "played"){
        return `<span class="logMsgHighlightPlayerID-${logObj.playerID}">Player ${logObj.playerID}</span> played card ${logObj.cardVal} on <span class="logMsgHighlightPlayerID-${logObj.targetedPlayerID}">Player ${logObj.targetedPlayerID}</span>`;
    }

    else if (logObj.action === "discarded"){
        return `<span class="logMsgHighlightPlayerID-${logObj.playerID}">Player ${logObj.playerID}</span> discarded card ${logObj.cardVal}`;
    }

    else if (logObj.action === "knocked out"){
        return `<span class="logMsgHighlightPlayerID-${logObj.playerID}">Player ${logObj.playerID}</span> is knocked out of this round`;
    }

    else if (logObj.action === "game info"){
        return `${logObj.msg}`;
    }

    else if (logObj.action === "round score info"){
        let log = `Round over: Highest card value = ${logObj.winningCardVal}. 
        1 Favor Token awarded to: <span class="logMsgHighlightPlayerID-${logObj.winningPlayerIDs[0]}">Player ${logObj.winningPlayerIDs[0]}</span>`;

        // If >1 winners, add them to msg
        for (let i = 1; i < logObj.winningPlayerIDs.length; i++) {
            const playerID = logObj.winningPlayerIDs[i];
            log += ` & <span class="logMsgHighlightPlayerID-${logObj.winningPlayerIDs[playerID]}">Player ${logObj.winningPlayerIDs[playerID]}`;
        }

        return log;
    }

    else {
        throw new Error("Log object action type has not been implemented in GameLogArea createLog func");
    }

}
// msg: `Favor tokens awarded to: Round over: Highest card value was ${G.playerMap[G.winnerOfLastRound].hand[0].val}`

// G.gameLog.push({
//     action: "round score info",
//     winningCardVal: G.playerMap[G.winnerOfLastRound].hand[0].val,
//     winningPlayerIDs: winningPlayerIDs
// });

export default GameLogInfoArea;
