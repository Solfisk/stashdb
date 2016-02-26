'use strict';

module.exports = (req, res, next) => {
    req.stashdb.pager = (type, defPageSize) => {
      const pageSize = req.query.pageSize || defPageSize || Infinity,
            page = req.query.page || 1,
            fromRevision = req.query.fromRevision || 0,
            node = req.stashdb.node,
            toRevision = req.query.toRevision || node.revisionNumber;

      let result = {},
          i = 0;

      for(let revisionPair of node.between(fromRevision, toRevision)) {
        i++;
        if(i > (pageSize * page || 0) || revisionPair[1].revisionNumber > toRevision) {
          break;
        } else if(i > (pageSize * (page - 1) || 0)) {
          result[revisionPair[0]] = revisionPair;
        }
      }
      if(pageSize < Infinity) {
        res.header('Link', '<' + node.path + '?list&page=' + (page + 1) + '&pageSize=' + pageSize + '&fromRevision=' + fromRevision + '&toRevision=' + toRevision + '>; rel=next');
      }
      res.header('Revision', node.revisionNumber);
      req.stashdb.result = result;
    };
    next();
  };


