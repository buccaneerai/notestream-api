const jwt = require('jsonwebtoken');
const get = require('lodash/get');

const logger = require('../utils/logger');

const errors = {
  unauthorized: () => new Error('Unauthorized'),
};

const authenticator = ({
  secret = process.env.JWT_SECRET,
  _jwt = jwt,
  _logger = logger,
} = {}) => (socket, next) => {
  const token = get(socket, 'handshake.auth.token', null);
  if (!token) return next(errors.unauthorized());
  try {
    const data = _jwt.verify(token, secret);
    if (get(data, '_id', null) || get(data, 'serviceName', null)) return next();
    _logger.error('_id or serviceName is not present', {message: 'Unauthorized'});
    return next(errors.unauthorized());
  } catch (e) {
    _logger.error(e.message, {message: 'Unauthorized'});
    return next(errors.unauthorized());
  }
};

module.exports = authenticator;
