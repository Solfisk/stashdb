'use strict';

module.exports = (req, res, next) => {
  res.locals.isResource = !req.path.match(/\/$/);
  res.locals.txn = req.app.locals.store();
  next();
};
