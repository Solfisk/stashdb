'use strict';

module.exports = (req, res, next) => {
  const path = req.path,
        pointer = req.app.locals.model.pointer(path),
        node = pointer.pop()[0];
  req.stashdb = {
    path: path,
    pointer: pointer,
    node: node
  };
  next();
};

