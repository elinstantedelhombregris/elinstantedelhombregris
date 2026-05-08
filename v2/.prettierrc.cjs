// Re-export the shared Prettier config so editors that look at the
// repo root pick it up without resolving workspace symlinks.
module.exports = require('./packages/config/prettier/index.js').default ?? require('./packages/config/prettier/index.js');
