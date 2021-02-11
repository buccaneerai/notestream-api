import winston, { format } from 'winston';
import expressWinston from 'express-winston';
// import { of } from 'rxjs';
// import { tap } from 'rxjs/operators';
import { stringify as safeStringify } from 'flatted';
// require('winston-daily-rotate-file');

import config from './config';

const { combine, timestamp, json, prettyPrint } = format;


const { STAGE, SUPPRESS_LOGS } = config();

const metadata = {
  // service: config().SERVICE_NAME || 'unknown',
  // stage: config().STAGE,
  // sha: config().COMMIT_HASH || 'unknown',
};

// console.log('WRITING LOGS TO', config().LOG_DIR);
// Parsing large log entries
const parseLog = size => info => {
  if (!info.data) return info;

  const slicedArr =
    info.data.length > size
      ? safeStringify(info.data).substring(0, size)
      : safeStringify(info.data);
  const stack = [];
  let openQuote = false;
  [...slicedArr].map(c => {
    if (c === '{' || c === '[' || c === '(') stack.push(c);
    if (c === '}' || c === ']' || c === ')') stack.pop();
    if (c === '"') openQuote = !openQuote;
    return c;
  });
  if (openQuote) slicedArr.push('"');

  const data =
    stack.length > 0
      ? stack.reduceRight(
          (acc, s) => {
            if (s === '{') acc.push('}');
            if (s === '(') acc.push(')');
            if (s === '[') acc.push(']');
            return acc;
          },
          [...slicedArr]
        )
      : slicedArr;
  return { ...info, data: JSON.parse(data) };
};

const options = {
  format: combine(
    // colorize(),
    format(info => (SUPPRESS_LOGS ? false : parseLog(300)(info)))(),
    timestamp(),
    json(),
    prettyPrint()
  ),
};

const infoTransport = new winston.transports.Console({
  name: 'info',
  level: 'info',
});

const debugTransport = new winston.transports.Console({
  name: 'debug',
  level: 'debug',
});

const transports = STAGE === 'local' ? [debugTransport] : [infoTransport];

const winstonLogger = winston.createLogger({
  ...options,
  transports,
  exceptionHandlers: [new winston.transports.Console()],
});

const log = (level, message, data) => (SUPPRESS_LOGS ? false : winstonLogger[level](message, data));

// FIXME: I don't know why, but when you add metadata, it no longer logs the data!?
export const error = (message, data) => log('error', message, data);
export const info = (message, data) => log('info', message, data);
export const debug = (message, data) => log('debug', message, data);

const requestLogger = function requestLogger() {
  return expressWinston.logger({
    ...options,
    transports,
    baseMeta: metadata,
    requestWhitelist: ['body', 'query'],
    requestBlacklist: ['headers'],
    responseWhitelist: ['body'],
    headerBlacklist: ['Authorization'],
  });
};

// returns an express middleware, which logs requests
export default {
  requestLogger,
  info,
  error,
  debug,
};
