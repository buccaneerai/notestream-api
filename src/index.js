import path from 'path';
import dotenv from 'dotenv';

import * as socketioApp from './ws/server';

dotenv.config({path: path.resolve(__dirname, '../.env')});

if (process.env.START_SERVER === 'false') return of(null);
socketioApp.start();
