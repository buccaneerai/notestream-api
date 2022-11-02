const path = require('path');
const dotenv = require('dotenv');

// FIXME: this could be an issue...  It was origiannly "import * as socketioApp"
const socketioApp = require('./ws/server');

dotenv.config({path: path.resolve(__dirname, '../.env')});

function start() {
  if (process.env.START_SERVER === 'false') return null;
  socketioApp.start();
}

start();
