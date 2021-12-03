const { throwError } = require('rxjs');

const unauthorized = function unauthorized() {
  return throwError(new Error('unauthorized'));
};

module.exports = unauthorized;
