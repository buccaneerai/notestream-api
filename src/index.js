import path from 'path';
import dotenv from 'dotenv';

import * as socketioApp from './ws/server';

dotenv.config({path: path.resolve(__dirname, '../.env')});

function start() {
  if (process.env.START_SERVER === 'false') return null;
  socketioApp.start();
}

start();


