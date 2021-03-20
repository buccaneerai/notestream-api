const { tap } = require('rxjs/operators');
const { info } = require('../utils/logger');

const trace = (label, log = info) => tap(data => log(label, data));

module.exports = trace;
