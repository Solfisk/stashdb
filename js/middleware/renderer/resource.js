'use strict';

const Resource = require('../../model.js').Resource;
const createReadStream = require('fs').createReadStream;

module.exports = (req, res, next) => {
  const node = req.stashdb.node;
  if(node instanceof Resource) {
    const store = req.app.locals.store;
    const txn = store.begin();
    const storeContent = store.get(txn, 'resource', node.path);
    const storedNode = store.getMeta(txn, node.path);
    txn.commit();

    if(node.contentFile || node.content || storeContent) {
      let errors = [];
      if(!req.accepts(node.contentType)) {
        errors.push('Unacceptable content type: ' + node.contentType);
      }
      if(!req.acceptsCharsets(node.charset)) {
        errors.push('Unacceptable charset: ' + node.charset);
      }
      if(!req.acceptsEncodings('gzip')) {
        errors.push('Unacceptable encoding: gzip');
      }
      if(!errors.length) {
        res.append('Link', '<' + node.path + '>; rel=' + (req.stashdb.path.match(/\/$/) ? 'resource' : 'canonical'));
        res.set({'Resource-Revision': node.parent.key2revision.get(node.name), 'Name': node.name, 'Content-Type': node.contentType + (node.charset ? '; charset=' + node.charset : ''), 'Content-Encoding': 'gzip'});
        if(node.contentFile) {
          const stream = createReadStream(node.contentFile);
          stream.on('readable', () => {
            stream.pipe(res);
          });
        } else if(node.content) {
          res.send(node.content);
        } else {
          res.send(storeContent);
        }
      } else {
        res.status(406).send(errors.join(', ') + '.').end();
      }
    } else {
      res.status(204).end();
    }
  } else if(node === null || node === undefined) {
    res.status(404).end();
  } else {
    console.warn('Node not instanceof Resource:');
    console.warn(node);
    res.status(500).end();
  }
};

