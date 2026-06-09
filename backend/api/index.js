const app = require('../src/server');

module.exports = (req, res) => {
  if (req.url.startsWith('/_/backend')) {
    req.url = req.url.replace('/_/backend', '') || '/';
  }
  return app(req, res);
};
