'use strict';

const Joi = require('joi'),
      queryValidator = Joi.object().keys({
        pageSize: Joi.number().min(0).integer(),
        fromRevision: Joi.number().min(0).integer(),
        toRevision: Joi.number().min(0).integer(),
        page: Joi.number().min(1).integer()
      }).unknown(true);

module.exports = (type, defPageSize) => {
  return (req, res, next) => {
      const queryValidation = queryValidator.validate(req.query);
      if(queryValidation.error) {
        res.status(400).send(queryValidation.error.details[0].message).end();
        return;
      }

      const pageSize = parseInt(req.query.pageSize) || defPageSize || Infinity,
            page = parseInt(req.query.page) || 1,
            node = req.stashdb.node,
            fromRevision = parseInt(req.query.fromRevision) || 0,
            toRevision = parseInt(req.query.toRevision) || node.revisionNumber;

      let result = {},
          i = 0,
          hasNext = false,
          headers = [];
      const revisionIterator = node.between(fromRevision, toRevision);

      for(let revisionPair of revisionIterator) {
        i++;
        if(i > (pageSize * page || 0)) {
          hasNext = true;
          break;
        } else if(i > (pageSize * (page - 1) || 0)) {
          result[revisionPair[0]] = revisionPair;
        }
      }
      if(pageSize < Infinity && hasNext) {
        headers.push(['Link', '<' + node.path + '?' + type + '&page=' + (page + 1) + '&pageSize=' + pageSize + '&fromRevision=' + fromRevision + '&toRevision=' + toRevision + '>; rel=next']);
      }
      req.stashdb.result.pager = {
        headers: headers.concat([['Revision', node.revisionNumber]]),
        content: result
      };
      return next();
    };
  };


