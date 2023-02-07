const express = require('express');
const get = require('lodash/get');
const compression = require('compression');
const expressJWT = require('express-jwt');

const logger = require('@buccaneerai/logging-utils');
const createRunJob = require('./createRunJob');

const router = express.Router();

const authorize = (authorizedServices = ['clinical-api']) => (req, res, next) => {
  const serviceName = get(req, 'user.serviceName', null);
  if (authorizedServices.includes(serviceName)) return next();
  return res.send(401);
};

// Only allow admin users access
router.use(
  compression(),
  logger.requestLogger(),
  expressJWT({secret: process.env.JWT_SECRET, credentialsrequired: true}),
  authorize()
);

// run a batch run from an audio file
router.post('/run-job', createRunJob());

module.exports = () => router;
