const express = require('express');
const http = require('http');
// import helmet = require('helmet');
// import compression = require('compression');
// import bodyParser = require('body-parser');
const cors = require('cors');
const {Server} = require('socket.io');
const rxjsConfig = require('rxjs').config;

const authenticator = require('../lib/authenticator');
const config = require('../utils/config');
const logger = require('../utils/logger');
const createConsumer = require('./createConsumer');



const logInfo = logger.info;
const logError = logger.error;

rxjsConfig.onUnhandledError = err => logError(`Uncaught RxJS error`, err);

const defaultSocketOptions = {
  path: '/',
  transports: ['websocket'],
  allowUpgrades: true,
  serveClient: false,
  cors: {
    origin: ['http://localhost:3000', '*:*'],
    credentials: true,
    allowedHeaders: ['authorization'],
  }
};

const startSocketIO = ({
  httpServer,
  socketOptions = defaultSocketOptions,
  _socketIO = (...params) => new Server(...params),
  _authenticator = authenticator,
}) => {
  const io = _socketIO(httpServer, { ...socketOptions });
  io.use(_authenticator());
  return io;
};

const startWebSocket = ({
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
const start = (port = config().PORT) => {
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

module.exports.start = start;
module.exports.startWebSocket = startWebSocket;
