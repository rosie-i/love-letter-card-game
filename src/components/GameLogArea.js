
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

    else {
        throw new Error("I don't know what the log obj action type is!!!");
    }

}

export default GameLogInfoArea;
