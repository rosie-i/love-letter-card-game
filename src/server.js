const { Server, Origins } = require('boardgame.io/server');
const { LoveLetter } = require('./Game');

const server = Server({
  games: [LoveLetter],
  // Set origins to game domain name later on, for now we'll allow any localhost to connect
  origins: [Origins.LOCALHOST],
});

server.run(8000);