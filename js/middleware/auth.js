'use strict';

let initialized,
    useAuth,
    authorized = {};

module.exports = (req, res, next) => {
  if(!initialized) {
    initialized = true;
    authorized = {};
    let auth = req.app.locals.config.auth;
    if(auth) {
      for(let token of auth) {
        useAuth = true;
        authorized['Bearer ' + token] = true;
      }
    }
  }
  if(useAuth) {
    if(!authorized[req.headers.authorization]) {
      res.status(401).send('Unauthorized.').end();
      return;
    }
  }
  next();
  return;
};

