import express from 'express';
import http from 'http';
// import helmet from 'helmet';
// import compression from 'compression';
// import bodyParser from 'body-parser';
import cors from 'cors';
import Server from 'socket.io';

import config from '../utils/config';
import logger, { info as logInfo, error as logError } from '../utils/logger';
import createConsumer from './createConsumer';

const defaultSocketOptions = {
  path: '/',
  transports: ['websocket'],
  allowUpgrades: true,
  serveClient: false,
};

const startSocketIO = ({
  httpServer,
  origins = ['http://localhost:3000', '*:*'], // '*:*' FIXME: is this necessary?
  socketOptions = defaultSocketOptions,
  _socketIO = (...params) => new Server(...params),
  // _authenticator = authenticator,
}) => {
  const io = _socketIO(httpServer, { origins, ...socketOptions });
  io.origins(origins);
  // TODO: Answer -> This is how to handle an error in the socket
  // Does that mean we should keep it or let it throw out and handle it at the observable level?
  // io.on('connection', (socket) => {
  //   socket.on('error', (error) => {
  //     console.log('We got the error!');
  //   });
  // });
  // io.use(_authenticator); // FIXME: - add authentication
  return io;
};

export const startWebSocket = ({
  expressApp,
  wsPort,
  _startSocketIO = startSocketIO,
  _createConsumer = createConsumer,
}) => {
  try {
    const httpServer = http.createServer(expressApp);
    const io = _startSocketIO({ httpServer });
    const consumer$ = _createConsumer({ io }); // FIXME: enable to start consuming
    consumer$.subscribe({
      error: err => {
        logError(`Error subscribing to consumer: caught @ ${__filename} => `, err);
      },
    });
    httpServer.on('connect', () => logInfo('HTTP_CONNECT'));
    httpServer.on('clientError', (err, socket) => {
      logError(`Http Client Error: caught @ ${__filename} b=> `, err);
      if (err.code === 'ECONNRESET' || !socket.writable) {
        return;
      }
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    httpServer.listen(wsPort, () => {
      logInfo(`Websocket starting on ${wsPort}...`, {
        event: 'websocket-startup',
      });
    });
  } catch (err) {
    logError(`Error starting websocket: caught @ ${__filename} => `, err);
  }
};

// start server
export const start = (port = config().PORT) => {
  try {
    const app = express();
    app.use(
      cors({
        origin: (origin, cb) => cb(null, [origin]),
        credentials: true,
      })
    );

    app.use(logger.requestLogger());
    startWebSocket({ expressApp: app, wsPort: port });
  } catch (err) {
    logError(`Error starting server: caught @ ${__filename} => `, err);
  }
};
