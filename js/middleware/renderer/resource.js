'use strict';

module.exports = (path, req, res, next) => {
  const txn = res.locals.txn;
  const content = txn.getBinary('resource', path);
  const meta = txn.getObject('meta', path);

  const errors = [];
  if(!req.accepts(meta.contentType)) {
    errors.push('Unacceptable content type: ' + meta.contentType);
  }
  if(!req.acceptsCharsets(meta.charset)) {
    errors.push('Unacceptable charset: ' + meta.charset);
  }
  if(errors.length) {
    res.status(406).send(errors.join(', ') + '.').end();
  } else {
    // TODO: Handle empty payloads (deleted and just empty resources)
    res.append('Link', '<' + path + '>; rel=' + (res.locals.isResource ? 'canonical' : 'resource'));
    res.set({
      // TODO: 'Resource-Revision': meta.parent.key2revision.get(meta.name),
      'Name': meta.name,
      'Content-Type': meta.contentType + (meta.charset ? '; charset=' + meta.charset : ''),
    });
    res.send(content);
  }
};
