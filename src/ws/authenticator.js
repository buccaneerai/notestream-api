const jwt = require('jsonwebtoken');

const authenticator = function authenticator(
  socket,
  next,
  secret = process.env.JWT_SECRET,
  _jwt = jwt
) {
  const token = socket.request.headers.Authorization;
  if (token) {
    _jwt.verify(token, secret, (err, decoded) => {
      if (err) return next(new Error('Unauthorized: incorrect token'));
      socket.user = decoded; // eslint-disable-line no-param-reassign
      return next();
    });
  }
  return next(new Error('Unauthorized'));
};

module.exports = authenticator;
