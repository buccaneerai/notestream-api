const isArray = require('lodash/isArray');
const omit = require('lodash/omit');
const { tap } = require('rxjs/operators');
const { info } = require('../utils/logger');

const defaultOptions = {
  blacklist: ['context', 'data.context', 'data.chunk'],
};

const trace = (label, options = defaultOptions, log = info) => (
  tap(data => log(
    label,
    isArray(data) ? null : omit(data, ...options.blacklist)
  ))
);

module.exports = trace;
